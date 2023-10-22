const User=require('../Models/userModels')
const Manager=require('../Models/managerModel')
const Events=require('../Models/eventsModel')
const Booking=require('../Models/bookingData')
const Payment=require('../Models/transactionModel')
const Chat=require('../Models/chatModel')
const Review=require('../Models/reviewModel')
const Report=require('../Models/reportModel')
const Banner=require('../Models/bannerModel')
const Subscription=require('../Models/subscriptionModel')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
require('dotenv').config()
const  Tokenmodel =require('../Models/token.js')

const {sendEmail} =require('../utils/email')
const { default: Stripe } = require('stripe')
const { useParams } = require('react-router-dom')
const { uploadToCloudinary } = require('../utils/cloudinary')

const generateOtp = () => {
    let otp = "";
  for (let i = 0; i < 4; i++) {
    const random = Math.round(Math.random() * 9);
    otp = otp + random;
  }
  return otp;
  };

const userReg = async (req,res)=>{
    try{
        const {name,email,password,mob} = req.body
        console.log(name,email,password,mob);
        const exists=await User.findOne({email:email})
        if(exists){
            return res.status(400).json({status: false,message:'Email already in used'});
        }
        const hash = await bcrypt.hash(password,10)
        const newUser =  new User({
          name,
          email,
          mob,
          password:hash
       })
    
        let user =  await newUser.save().then(console.log("Registered"))
        let subject='Email Verification'
        let text='<p>Hii' + exists.name + ', Please click here to <a href="http://localhost:3000/verifyemail/' + exists._id + '"> Verify </a> your mail.</p>'
        sendEmail(email,subject,text)
        return res.status(200).json({ alert: 'Check your Email and Verify', status: false });
    }catch(error){
        console.log(error.message);
    }
}
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        
        const exists = await User.findOne({ email: email, is_block:false });
        console.log(exists);
        
        if (exists) {
            const access = await bcrypt.compare(password, exists.password);
            
            if (access) {
                console.log('user logined');
                if(exists.is_verified){
                    let token = await Tokenmodel.findOne({ userId: exists._id });
                    console.log(token);
                    if (!token) {
                        token = await new Tokenmodel({
                            userId: exists._id,
                            token: jwt.sign({ userId: exists._id }, process.env.JwtSecretKey, { expiresIn: '1d' })
                        });
                        await token.save();
                    }
                
                return res.status(200).json({ user: exists, token: token, alert: 'Logined', status: true });
                }else{
                    let subject='Email Verification'
                    let text='<p>Hii' + exists.name + ', Please click here to <a href="http://localhost:3000/verifyemail/' + exists._id + '"> Verify </a> your mail.</p>'
                    sendEmail(email,subject,text)
                    return res.status(200).json({ alert: 'Check your Email and Verify', status: false });
                }
            } else {
                return res.status(404).json({ alert: "Password is wrong", status: false });
            }
        }else{
          return res.status(404).json({ alert: "No user found", status: false })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const userGoogleLogin=async(req,res)=>{
    try {
      console.log('hjfj');
        const { name,email, password } = req.body
        const exists=await User.findOne({email:email})

        if (exists) {
          let token = await Tokenmodel.findOne({ userId: exists._id });
          if (!token) {
            token = new Tokenmodel({
              userId: exists._id,
              token: jwt.sign({ userId: exists._id }, process.env.JwtSecretKey, { expiresIn: '1d' }),
            });
          } else {
            token.token = jwt.sign({ userId: exists._id }, process.env.JwtSecretKey, { expiresIn: '1d' });
          }
        
          await token.save();
          return res.status(200).json({ token: token, user: exists, alert: 'Registered', status: true });
        }
        
        const hash = await bcrypt.hash(password,10)
        const newUser =  new User({
          name,
          email,
          mob: 1111111111,
          password:hash,
          is_manager:false,
          is_verified:true
       })
    
        let user =  await newUser.save().then(console.log("Registered"))
        const token=await new Tokenmodel ({
            userId:user._id,
            token:jwt.sign({ userId: user._id }, process.env.JwtSecretKey, { expiresIn: 60000 })
          });
          await token.save()
        return res.status(200).json({ token: token,user:newUser, alert:'Registred', status: true});
    } catch (error) {
        console.log(error.message);
    }
}

const VerifyEmail=async(req,res)=>{
    try {
        const user= req.query.id
        const userData=await User.findOne({_id:user})
        console.log(userData);
        await User.findOneAndUpdate({_id:user},{$set:{is_verified:true}},{upsert:true})
        let token = await Tokenmodel.findOne({ userId: user });
        console.log(token);
        if (!token) {
            token = await new Tokenmodel({
                userId: user,
                token: jwt.sign({ userId: user }, process.env.JwtSecretKey, { expiresIn: 60000 })
            });
            await token.save();
        }
        return res.status(200).json({ user: userData, token: token, alert: 'Verified Logined', status: true });
    } catch (error) {
        console.log(error);
    }
}

const forgotPassword=async(req,res)=>{
    try {
        const { email } = req.body;
        console.log(email);
        const exists = await User.findOne({ email: email });
        if(exists){
            await Tokenmodel.findOneAndDelete({
                userId: exists._id
              });
        
              const OTP = generateOtp();
              const tokenmodel=new Tokenmodel({
                userId: exists._id,
                token: OTP
              });
              let subject= "Verify your email account"
              let text=`<div>
              <h1>OTP for reset password</h1>
              <p>${OTP}</p>
              <strong>Do not share your otp</strong>
              </div>`
              await sendEmail(exists.email,subject,text)
              await tokenmodel.save()
              await exists.save()
              console.log('returned');
              return res.status(200).json({message:"Success",status:true});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const VerifyPassword=async(req,res)=>{
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({ email: email });
        console.log(user);
        const token = await Tokenmodel.findOne({ userId: user._id });
        console.log(token);
        if(otp===token.token){
            const hash = await bcrypt.hash(password,10)
            user.password = hash;
            await user.save();
            console.log();
            await Tokenmodel.findOneAndDelete({ userId: user._id });
            res.status(200).json({message:"Success",status:true});
        }else{
            await Tokenmodel.findOneAndDelete({ userId: user._id });
            res.status(200).json({message:"Failed",status:false});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const homeData=async(req,res)=>{
    try {
      console.log('new');
      const manager= await Subscription.find({}).populate('managerId')
      const managerDataArray = manager.map((subscription) => subscription.managerId);
        console.log("Array of managerId data:", managerDataArray);
        const homeData=await Manager.find({is_authorized:true, eventData: { $exists: true, $ne: null }})
        console.log(homeData);
        return res.status(200).json({homeData:managerDataArray})
    } catch (error) {
        console.log(error.message);
    }
}

const getEventData=async(req,res)=>{
    try {
        const eventData=await Events.find({is_block:false})
        console.log(eventData);
        return res.status(200).json({eventData})
    } catch (error) {
        
    }
}

const detailData=async(req,res)=>{
    try {
        const id = req.query.id
        console.log(id);
        const detailData=await Manager.findById(id)
        console.log(detailData);
        const reviewData=await Review.find({manager:id}).populate('user','name')
        const result=detailData.eventData
        return res.status(200).json({result,review:reviewData})
    } catch (error) {
        console.log(error.message);
    }
}

const eventList=async(req,res)=>{
    try {
        const name=req.query.name
        const page=req.query.page
        console.log(page,'page');
        const start=(page-1)*2
        const end=start+2
        const managers = await Manager.find(
          { 'eventData.events': name }
        ).skip(start).limit(end)
          return res.status(200).json({managers})
    } catch (error) {
        console.log(error.message);
    }
}

const managerData=async(req,res)=>{
    try {
      console.log('reached');
        const id=req.params.id
        console.log(id);
        const manager=await Manager.findById(id)
        console.log(manager);
        return res.status(200).json({data:manager, status:true})

    } catch (error) {
        console.log(error.message);
    }
}

const submitBooking=async(req,res)=>{
    try {
        console.log(req.body);
        const data=req.body.eventdata
        const dates = data.date.map((dateString) => new Date(dateString));
        const booking= new Booking({
            manager_id: data.manager_id,
            user_id: data.user_id,
            name: data.name,
            event_name: data.event_name,
            mob: data.mob,
            event: data.event,
            preffered_dishes: data.preffered_dishes,
            address :data.address,
            date: dates,
            time: data.time,
            additional_data: data.additional_data
        })
        const user=await User.findById(data.user_id)
        console.log(booking);
        const bookingdata=await booking.save()
        console.log(req.body);
        return res.status(200).json({alert:'Booking saved',status:true,data:bookingdata,user:user})
    } catch (error) {
        console.log(error.message);
    }
}

const paymentBookingData=async(req,res)=>{
  try {
    const {id}=req.params
    const stripe=new Stripe('sk_test_51NwHkGSEDFbx4uMAi4gaS8gIKK34IfRc6c1ang04n7KDxk5t8rRyid4fKedWCBqlaBUJeKDMczwzhCtPU1nWriaq00ahzBlJ8c')
    const data=await Booking.findById(id)
    if(data.is_paid=='paid'){
      return res.status(403).json({message:'already paid'})
    }
    const price=data.advance_amount    
    const paymentIntent = await stripe.paymentIntents.create({
            amount: price*100,
            currency: "inr",
            automatic_payment_methods: {
              enabled: true,
            },
          });
          console.log(paymentIntent);
          res.status(200).json({
            clientSecret: paymentIntent.client_secret, amount:price})
  } catch (error) {
    console.log(error.message);
  }
}

const paymentBookingSuccess=async(req,res)=>{
  try {
    console.log('reached');
    const {id}=req.params
    console.log(id);
    await Booking.findByIdAndUpdate(id,{$set:{is_paid:'paid'}},{new:true})
    const booking=await Booking.findById(id)
    const manager = await Manager.findById(booking.manager_id);
    manager.booked_dates = [...manager.booked_dates, ...booking.date];
    await manager.save()
    return res.status(200).json({status:true})
  } catch (error) {
    console.log(error.message);
  }
}

// const userPayment = async (req, res) => {
//     try {
//       const stripe = require("stripe")(
//         "sk_test_51NwHkGSEDFbx4uMAi4gaS8gIKK34IfRc6c1ang04n7KDxk5t8rRyid4fKedWCBqlaBUJeKDMczwzhCtPU1nWriaq00ahzBlJ8c"
//       );
//         console.log('hgff');
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "payment",
//         line_items: [
//           {
//             price_data: {
//               currency: "inr",
//               product_data: {
//                 name: "Product Name"
//               },
//               unit_amount: 100,
//             },
//             quantity: 1,
//           },
//         ],
//         success_url: "http://localhost:3000/success",
//         cancel_url: "http://localhost:3000/cancel",
//       });
//       console.log('jhkg');
//       res.json({ url: session.url });
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

const userPayment=async(req,res)=>{
    try {
        const stripe=new Stripe('sk_test_51NwHkGSEDFbx4uMAi4gaS8gIKK34IfRc6c1ang04n7KDxk5t8rRyid4fKedWCBqlaBUJeKDMczwzhCtPU1nWriaq00ahzBlJ8c')
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 500*100,
            currency: "inr",
            automatic_payment_methods: {
              enabled: true,
            },
          });
          console.log(paymentIntent);
          res.status(200).json({
            clientSecret: paymentIntent.client_secret})
    } catch (error) {
        console.log(error.message);
    }
}

const paymentSuccess=async(req,res)=>{
    try {
        console.log('fgfg');
        const {id}=req.params

        const user=await User.findByIdAndUpdate(id,{$set:{is_paid:true}},{new:true})
        console.log(user);
        // const bookingdata=await Booking.findByIdAndUpdate(id,{$set:{is_paid:'paid'}},{new:true,upsert:true})
        // const managerdata=await Manager.findById(mangId)
        // const price=managerdata.eventData.advance_amount
        // console.log(price);
        // const data=await Manager.findOne({_id:mangId})
        // console.log(data);
        // const updatedDocument = await User.findOneAndUpdate(
        //     { is_admin: true },
        //     { $inc: { wallet_amount: price } },
        //     { new: true, upsert: true }
        //   );
        //   const paymentdata= new Payment({
        //     userId:bookingdata.user_id,
        //     managerId:mangId,
        //     bookingId:id,
        //     amount:price,
        //     status:'paid'
        //   })
        //   await paymentdata.save()
        res.status(200).json({status:true})

    } catch (error) {
        console.log(error.message);
    }
}

const orderHistory=async(req,res)=>{
    try {
        const {id}=req.params
        console.log(id);
        const data=await Booking.find({user_id:id})
        console.log(data);
        res.status(200).json({data:data})
    } catch (error) {
        console.log(error.message);
    }
}

const cancelOrder=async(req,res)=>{
    try {
        const {id}=req.params
        console.log(id);
        const payData = await Payment.findOne({bookingId:id})
        const data=await Booking.findById(id)
        await Booking.findByIdAndUpdate(id,{$set:{is_paid:'cancelled'}})
        console.log(data);
        console.log(payData);
        const price=payData.amount
        let ans= await User.findByIdAndUpdate(data.user_id,{$inc:{wallet_amount:price}})
        let admin=await User.findOneAndUpdate({is_admin:true},{$inc:{wallet_amount:-price}})
        console.log(ans);
        console.log(admin);
        const paymentdata = new Payment({
            userId: data.user_id, 
            managerId: data.manager_id, 
            bookingId: id,
            amount: price,
            status: 'cancelled'
          });
          await paymentdata.save()
        console.log(data);
        res.status(200).json({status:true})
    } catch (error) {
        console.log(error.message);
    }
}

const accessChat = async (req, res) => {
    console.log('hgjfg');
    const { userId, mangId } = req.body;
    console.log(userId, mangId);
  
    if (!userId) {
      console.log('User not found');
      return res.status(400);
    }
  
    try {
      // Find a chat where the manager's ID matches mangId and the user's ID matches userId
      let isChat = await Chat.findOne({
        "users.manager": mangId,
        "users.user": userId,
      })
        .populate('users.user', '-password') // Populate the "user" references
        .populate('users.manager', '-password') // Populate the "manager" references
        .populate('latestMessage');
      console.log(isChat);
      // If a chat exists, send it
      if (isChat) {
        console.log(isChat);
        res.status(200).json(isChat);
      } else {
        // If a chat doesn't exist, create a new one
        const chatData = {
          chatName: "sender",
          users: {
            manager: mangId,
            user: userId,
          },
        };
  
        const createdChat = await Chat.create(chatData);
        console.log(createdChat);
  
        // Populate the "users" field in the created chat

        const FullChat = await Chat.findOne({ _id: createdChat._id })
          .populate('users.user', '-password')
          .populate('users.manager', '-password')
          .populate('latestMessage').populate({
            path: 'latestMessage',
            populate: {
              path: 'sender.manager' ? 'sender.manager' : 'sender.user',
              select: '-password',
            },
          });
        console.log(FullChat,'full');
        res.status(200).json(FullChat);
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  const fetchChats=async(req,res)=>{
    try {
        console.log('reached');
        const {userId}=req.params
        const result = await Chat.find({ "users.user": userId }).populate('users.user', '-password')
        .populate('users.manager', '-password')
        .populate('latestMessage').populate({
            path: 'latestMessage',
            populate: {
              path: 'sender.manager' ? 'sender.manager' : 'sender.user',
              select: '-password',
            },
          }).populate({
            path: 'latestMessage',
            populate: {
              path: 'sender.user',
              select: '-password',
            },
          }).then((result)=>{console.log(result),res.send(result)});
        
    } catch (error) {
        console.log(error.message);
    }
  }  
  
  const searchUsers = async (req, res) => {
    console.log('reached');
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
      console.log(keyword);
  
    const users = await Manager.find(keyword) //.find({ _id: { $ne: req.user._id } });
    console.log(users);
    res.status(200).json(users);
  };

  const submitReview=async(req,res)=>{
    try {
        const {content,rating,managId,userId}=req.body
        const data=await Booking.findOne({user_id:userId,manager_id:managId})
        console.log(data);
        if(data){
            console.log(req.body);
            await new Review({
                user:userId,
                starcount:rating,
                content:content,
                manager:managId
            }).save()
            return res.status(200).json({status:true})
        }else{
            return res.status(200).json({message:'You need to purchase to review'})
        }
    } catch (error) {
        console.log(error.message);
    }
  }
  const submitReport=async(req,res)=>{
    try {
        const {report,managId,userId}=req.body
        const data=await Booking.findOne({user_id:userId,manager_id:managId})
        console.log(data);
        if(data){
            console.log(req.body);
            await new Report({
                content:report,
                manager:managId
            }).save()
            return res.status(200).json({status:true})
        }else{
            return res.status(200).json({message:'You need to purchase to report'})
        }
    } catch (error) {
        console.log(error.message);
    }
  }

  const bannerData=async(req,res)=>{
    try {
      const banner=await Banner.find({})
      res.status(200).json({banner})
    } catch (error) {
      console.log(error.message);
    }
  }

  const updateUser=async(req,res)=>{
    try {
      const cloudinarydata = await uploadToCloudinary(req.file.path, "profile_img");
console.log(cloudinarydata);

  const mob = parseInt(req.body.mob, 10);

  console.log(req.body, 'body');
  let data = req.body;

  await User.findOneAndUpdate(
    { _id: req.body.id },
    {
      $set: {
        name: data.name,
        mob: mob,
        profile_img: cloudinarydata.url,
      }
    }
  );
  let user = await User.findOne(
    { _id: req.body.id }
  );
  console.log(user);
  return res.status(200).json({status:true,user:user})

    } catch (error) {
      console.log(error.message);
    }
  }

module.exports={
    userReg,
    userLogin,
    userGoogleLogin,
    VerifyEmail,
    forgotPassword,
    VerifyPassword,
    homeData,
    getEventData,
    detailData,
    eventList,
    managerData,
    submitBooking,
    paymentBookingData,
    paymentBookingSuccess,
    userPayment,
    paymentSuccess,
    orderHistory,
    cancelOrder,
    accessChat,
    fetchChats,
    searchUsers,
    submitReview,
    submitReport,
    bannerData,
    updateUser
}