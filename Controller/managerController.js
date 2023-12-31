const Manager = require("../Models/managerModel");
const Booking = require("../Models/bookingData");
const Events = require("../Models/eventsModel");
const User = require("../Models/userModels");
const Chat = require("../Models/chatModel");
const Review = require("../Models/reviewModel");
const Subscription = require("../Models/subscriptionModel");
const Payment = require("../Models/transactionModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Tokenmodel = require("../Models/token.js");
const { sendEmail } = require("../utils/email");
const {
  MultiUploadCloudinary,
  uploadToCloudinary,
} = require("../utils/cloudinary");
const { default: Stripe } = require("stripe");
const moment = require("moment/moment");

const managerReg = async (req, res) => {
  try {
    const { name, email, password, mob } = req.body;
    const exists = await Manager.findOne({ email: email });
    if (exists) {
      return res
        .status(400)
        .json({ status: false, message: "Email already in used" });
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = new Manager({
      name,
      email,
      mob,
      password: hash,
    });
    let user = await newUser.save().then(console.log("Registered"));
    const token = await new Tokenmodel({
      userId: user._id,
      token: jwt.sign({ userId: user._id }, process.env.JwtSecretKey, {
        expiresIn: 60000,
      }),
    });
    await token.save();
    let subject = "Email Verification";
    let text =
      "<p>Hii" +
      user.name +
      ', Please click here to <a href="https://frontend-anexo.vercel.app/manager/managerverify/' +
      user._id +
      '"> Verify </a> your mail.</p>';
    sendEmail(email, subject, text);
    return res
      .status(200)
      .json({ alert: "Check your Email and Verify", status: true });
    // return res.status(200).json({ token: token,user:newUser, alert:'Registred', status: true});
  } catch (error) {
    console.log(error.message);
  }
};

const managerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await Manager.findOne({ email: email });

    if (exists) {
      const access = await bcrypt.compare(password, exists.password);

      if (access) {
        if (exists.is_verified) {
          let token = await Tokenmodel.findOne({ userId: exists._id });
          if (!token) {
            token = await new Tokenmodel({
              userId: exists._id,
              token: jwt.sign(
                { userId: exists._id },
                process.env.JwtSecretKey,
                { expiresIn: 60000 }
              ),
            });
            await token.save();
          }
          return res.status(200).json({
            user: exists,
            token: token,
            alert: "Logined",
            status: true,
          });
        } else {
          let subject = "Email Verification";
          let text =
            "<p>Hii" +
            exists.name +
            ', Please click here to <a href="https://frontend-anexo.vercel.app/manager/managerverify/' +
            exists._id +
            '"> Verify </a> your mail.</p>';
          sendEmail(email, subject, text);
          return res
            .status(200)
            .json({ alert: "Check your Email and Verify", status: false });
        }
      } else {
        return res
          .status(404)
          .json({ alert: "Password is wrong", status: false });
      }
    } else {
      return res.status(404).json({ alert: "User Not Found", status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await Manager.findOne({ email: email });
    if (exists) {
      await Tokenmodel.findOneAndDelete({
        userId: exists._id,
      });

      const OTP = generateOtp();
      const tokenmodel = new Tokenmodel({
        userId: exists._id,
        token: OTP,
      });
      let subject = "Verify your email account";
      let text = `<div>
              <h1>OTP for reset password</h1>
              <p>${OTP}</p>
              <strong>Do not share your otp</strong>
              </div>`;
      await sendEmail(exists.email, subject, text);
      await tokenmodel.save();
      await exists.save();
      return res.status(200).json({ message: "Success", status: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const VerifyPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const manager = await Manager.findOne({ email: email });
    const token = await Tokenmodel.findOne({ userId: manager._id });
    if (otp === token.token) {
      const hash = await bcrypt.hash(password, 10);
      manager.password = hash;
      await manager.save();
      await Tokenmodel.findOneAndDelete({ userId: manager._id });
      res.status(200).json({ message: "Success", status: true });
    } else {
      await Tokenmodel.findOneAndDelete({ userId: manager._id });
      res.status(200).json({ message: "Failed", status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateMananger = async (req, res) => {
  try {

    const mob = parseInt(req.body.mob, 10);
    let data = req.body;

    await Manager.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: data.name,
          mob: mob,
        },
      },
      { upsert: true }
    );
    let user = await Manager.findOne({ _id: req.body.id });
    return res.status(200).json({ status: true, user });
  } catch (error) {
    console.log(error.message);
  }
};

const getEventData = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = await Events.find({ is_block: false });
    const managerData = await Manager.findById(id);
    return res.status(200).json({ eventData, managerData });
  } catch (error) {}
};

const eventData = async (req, res) => {
  try {
    const multipleImages = req.files.filter((file) =>
      file.fieldname.startsWith("eventdata[profileImage]")
    );

    const Imagefilenames = multipleImages.map((file) => file.filename);
    const cloudinarymultipledata = await MultiUploadCloudinary(
      multipleImages,
      "images"
    );

    const cover_image = req.files.filter(
      (file) => file.fieldname === "eventdata[cover_image]"
    );
    const cloudinarydata = await uploadToCloudinary(
      cover_image[0].path,
      "categorey"
    );
    const { userID } = req.params;
    const exists = await Manager.findById(userID);
    if (exists) {
      const {
        team_name,
        salutation,
        about,
        events,
        location,
        dishes,
        advance_amount,
      } = req.body.eventdata;
      const amount = parseInt(advance_amount);
      const newEvent = {
        cover_image: cloudinarydata.url,
        team_name,
        salutation,
        about,
        multipleImages: cloudinarymultipledata,
        events,
        location,
        dishes,
        advance_amount: amount,
      };
      if (exists.eventData) {
        await Manager.findOneAndUpdate(
          { _id: exists._id },
          { $set: { eventData: newEvent } },
          { new: true }
        );
      } else {
        exists.eventData = newEvent;
        await exists.save();
      }
    }
    return res.status(200).json({ alert: "Data added", status: true });
  } catch (error) {
    console.log(error);
  }
};

const managerData = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await Manager.findById(id);
    const review = await Review.find({ manager: id }).populate("user");
    return res
      .status(200)
      .json({ data: manager, status: true, review: review });
  } catch (error) {
    console.log(error.message);
  }
};

const managerVerify = async (req, res) => {
  try {
    const manager = req.query.id;
    const managerData = await Manager.findOne({ _id: manager });
    await Manager.findOneAndUpdate(
      { _id: manager },
      { $set: { is_verified: true } },
      { upsert: true }
    );
    let token = await Tokenmodel.findOne({ userId: manager });
    if (!token) {
      token = await new Tokenmodel({
        userId: manager,
        token: jwt.sign({ userId: manager }, process.env.JwtSecretKey, {
          expiresIn: "1d",
        }),
      });
      await token.save();
    }
    return res.status(200).json({
      user: managerData,
      token: token,
      alert: "Verified Logined",
      status: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const bookingData = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Booking.find({ manager_id: id }).populate("user_id");
    return res.status(200).json({ data: data, alert: "booking data" });
  } catch (error) {
    console.log(error.message);
  }
};
const bookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Booking.findById(id).populate("user_id");
    return res.status(200).json({ data: data, alert: "booking data" });
  } catch (error) {
    console.log(error.message);
  }
};

const confirmBooking = async (req, res) => {
  try {
    const { id, amount } = req.params;
    const userData = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          is_confirmed: true,
          advance_amount: amount,
          is_paid: "pending",
        },
      },
      { new: true }
    );
    const user = await User.findById(userData.user_id);
    const email = user.email;
    let subject = "Booking Confirmation";
    let text =
      "<p>Congratulations" +
      user.name +
      ', Your booking has been confirmed by Manager. Please click here to <a href="https://frontend-anexo.vercel.app/bookingpayment/' +
      id +
      '"> Pay </a> your Advance.</p>';
    const emailres = sendEmail(email, subject, text);
    if (emailres.error) {
    }
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword); 
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
  }
};

const fetchChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Chat.find({ "users.manager": userId })
      .populate("users.user", "-password")
      .populate("users.manager", "-password")
      .populate("latestMessage")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender.manager" ? "sender.manager" : "sender.user",
          select: "-password",
        },
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender.user",
          select: "-password",
        },
      });
    result.reverse();
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
};

const editAbout = async (req, res) => {
  try {
    const { id, about } = req.body;
    await Manager.findByIdAndUpdate(
      id,
      { $set: { "eventData.about": about } },
      { new: true }
    );
    return res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};
const editEvents = async (req, res) => {
  try {
    const { id, eventlist } = req.body;
    await Manager.findByIdAndUpdate(
      id,
      { $set: { "eventData.events": eventlist } },
      { new: true }
    );
    return res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const editImages = async (req, res) => {
  try {
    console.log(req.body.id, "body console ");
    const img = await MultiUploadCloudinary(req.files, "profile");
    const managerId = req.body.id;
    await Manager.findByIdAndUpdate(managerId, {
      $set: { "eventData.multipleImages": img },
    });
    return res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const userData = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Manager.findById(id);
    return res.status(200).json({ user: user });
  } catch (error) {
    console.log(error.message);
  }
};

const editPhoto = async (req, res) => {
  try {
    const { id } = req.body;
    const cloudinarydata = await uploadToCloudinary(req.file.path, "profile");
    await Manager.findByIdAndUpdate(id, {
      $set: { profile_img: cloudinarydata.url },
    });
    return res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const handleSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await Subscription.findOne({ managerId: id });
    if (exists) {
      return res.status(200).json({ status: false });
    } else {
      return res.status(200).json({ status: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const subscriptionPayment = async (req, res) => {
  try {
    const { method } = req.params;
    const stripe = new Stripe(
      "sk_test_51NwHkGSEDFbx4uMAi4gaS8gIKK34IfRc6c1ang04n7KDxk5t8rRyid4fKedWCBqlaBUJeKDMczwzhCtPU1nWriaq00ahzBlJ8c"
    );
    let price;
    if (method == "classic") {
      price = 1000;
    } else if (method == "standard") {
      price = 3000;
    } else if (method == "premium") {
      price = 7000;
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      price: price,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const subscriptionSuccess = async (req, res) => {
  try {
    const { method, id } = req.body;
    let expire = 0;
    if (method == "classic") {
      expire = 604800;
    } else if (method == "standard") {
      expire = 2592000;
    } else if (method == "premium") {
      expire = 7776000;
    }
    const subscribe = new Subscription({
      managerId: id,
    });

    subscribe.createdAt.setSeconds(subscribe.createdAt.getSeconds() + expire);

    await subscribe.save();
  } catch (error) {
    console.log(error.message);
  }
};

const dashBoardData = async (req, res) => {
  try {
    const { id } = req.params;
    const notPaid = await Booking.find({
      manager_id: id,
      is_paid: "not paid",
    }).countDocuments();
    const paid = await Booking.find({
      manager_id: id,
      is_paid: "paid",
    }).countDocuments();
    const pending = await Booking.find({
      manager_id: id,
      is_paid: "pending",
    }).countDocuments();
    const cancel = await Booking.find({
      manager_id: id,
      is_paid: "cancelled",
    }).countDocuments();
    const bookings = { notPaid, paid, pending, cancel };
    await Payment.find({ managerId: id });
    const endDate = new Date(); // Current date
    const startDate = moment(endDate).subtract(5, "weeks").toDate();

    const payment = await Payment.aggregate([
      {
        $match: {
          paidAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$paidAt" },
            year: { $isoWeekYear: "$paidAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.week": 1 },
      },
      {
        $project: {
          _id: 0,
          //   week: "$_id.week",
          //   year: "$_id.year",
          startDate: {
            $dateFromParts: {
              isoWeekYear: "$_id.year",
              isoWeek: "$_id.week",
              isoDayOfWeek: 1,
            },
          },
          endDate: {
            $dateFromParts: {
              isoWeekYear: "$_id.year",
              isoWeek: "$_id.week",
              isoDayOfWeek: 7,
            },
          },
          count: 1,
        },
      },
    ]);
    return res.status(200).json({ status: true, bookings, payment });
  } catch (error) {
    console.log(error.message);
  }
};

const updateDates = async (req, res) => {
  try {
    const { date, id } = req.body;
    await Manager.findByIdAndUpdate(id, { $set: { booked_dates: date } });
    return res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  managerReg,
  eventData,
  managerLogin,
  getEventData,
  forgotPassword,
  VerifyPassword,
  updateMananger,
  managerData,
  managerVerify,
  bookingDetails,
  bookingData,
  confirmBooking,
  searchUsers,
  fetchChats,
  editAbout,
  editEvents,
  editImages,
  userData,
  editPhoto,
  subscriptionPayment,
  subscriptionSuccess,
  handleSubscription,
  dashBoardData,
  updateDates,
};
