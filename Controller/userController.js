const User = require("../Models/userModels");
const Manager = require("../Models/managerModel");
const Events = require("../Models/eventsModel");
const Booking = require("../Models/bookingData");
const Payment = require("../Models/transactionModel");
const Chat = require("../Models/chatModel");
const Review = require("../Models/reviewModel");
const Report = require("../Models/reportModel");
const Banner = require("../Models/bannerModel");
const Subscription = require("../Models/subscriptionModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Tokenmodel = require("../Models/token.js");

const { sendEmail } = require("../utils/email");
const { default: Stripe } = require("stripe");
const { uploadToCloudinary } = require("../utils/cloudinary");

const generateOtp = () => {
  let otp = "";
  for (let i = 0; i < 4; i++) {
    const random = Math.round(Math.random() * 9);
    otp = otp + random;
  }
  return otp;
};

const userReg = async (req, res) => {
  try {
    const { name, email, password, mob } = req.body;
    const exists = await User.findOne({ email: email });
    if (exists) {
      return res
        .status(400)
        .json({ status: false, alert: "Email already in used" });
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      mob,
      password: hash,
    });

    let user = await newUser.save().then(console.log("Registered"));
    let subject = "Email Verification";
    let text =
      "<p>Hii" +
      name +
      ', Please click here to <a href="https://frontend-anexo.vercel.app/verifyemail/' +
      user._id +
      '"> Verify </a> your mail.</p>';
    sendEmail(email, subject, text);
    return res
      .status(200)
      .json({ alert: "Check your Email and Verify", status: false });
  } catch (error) {
    console.log(error.message);
  }
};
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email: email, is_block: false });

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
                { expiresIn: "1d" }
              ),
            });
            await token.save();
          }

          return res
            .status(200)
            .json({
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
            ', Please click here to <a href="https://frontend-anexo.vercel.app/verifyemail/' +
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
      return res.status(404).json({ alert: "No user found", status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userGoogleLogin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email });

    if (exists) {
      let token = await Tokenmodel.findOne({ userId: exists._id });
      if (!token) {
        token = new Tokenmodel({
          userId: exists._id,
          token: jwt.sign({ userId: exists._id }, process.env.JwtSecretKey, {
            expiresIn: "1d",
          }),
        });
      } else {
        token.token = jwt.sign(
          { userId: exists._id },
          process.env.JwtSecretKey,
          { expiresIn: "1d" }
        );
      }

      await token.save();
      return res
        .status(200)
        .json({
          token: token,
          user: exists,
          alert: "Registered",
          status: true,
        });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      mob: 1111111111,
      password: hash,
      is_manager: false,
      is_verified: true,
    });

    let user = await newUser.save().then(console.log("Registered"));
    const token = await new Tokenmodel({
      userId: user._id,
      token: jwt.sign({ userId: user._id }, process.env.JwtSecretKey, {
        expiresIn: 60000,
      }),
    });
    await token.save();
    return res
      .status(200)
      .json({ token: token, user: newUser, alert: "Registred", status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const VerifyEmail = async (req, res) => {
  try {
    const user = req.query.id;
    const userData = await User.findOne({ _id: user });
    await User.findOneAndUpdate(
      { _id: user },
      { $set: { is_verified: true } },
      { upsert: true }
    );
    let token = await Tokenmodel.findOne({ userId: user });
    if (!token) {
      token = await new Tokenmodel({
        userId: user,
        token: jwt.sign({ userId: user }, process.env.JwtSecretKey, {
          expiresIn: 60000,
        }),
      });
      await token.save();
    }
    return res
      .status(200)
      .json({
        user: userData,
        token: token,
        alert: "Verified Logined",
        status: true,
      });
  } catch (error) {
    console.log(error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await User.findOne({ email: email });
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
    const user = await User.findOne({ email: email });
    const token = await Tokenmodel.findOne({ userId: user._id });
    if (otp === token.token) {
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
      await user.save();
      await Tokenmodel.findOneAndDelete({ userId: user._id });
      res.status(200).json({ message: "Success", status: true });
    } else {
      await Tokenmodel.findOneAndDelete({ userId: user._id });
      res.status(200).json({ message: "Failed", status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const homeData = async (req, res) => {
  try {
    const manager = await Subscription.find({}).populate("managerId");
    const managerDataArray = manager.map(
      (subscription) => subscription.managerId
    );
    const homeData = await Manager.find({
      is_authorized: true,
      eventData: { $exists: true, $ne: null },
    });
    return res.status(200).json({ homeData: managerDataArray });
  } catch (error) {
    console.log(error.message);
  }
};

const getEventData = async (req, res) => {
  try {
    const eventData = await Events.find({ is_block: false });
    console.log(eventData);
    return res.status(200).json({ eventData });
  } catch (error) {}
};

const detailData = async (req, res) => {
  try {
    const id = req.query.id;
    const detailData = await Manager.findById(id);
    const reviewData = await Review.find({ manager: id }).populate(
      "user",
      "name"
    );

    const result = detailData.eventData;
    return res.status(200).json({ result, rating:detailData.rating, review: reviewData });
  } catch (error) {
    console.log(error.message);
  }
};

const eventList = async (req, res) => {
  try {
    const name = req.query.name;
    const page = req.query.page;
    const start = (page - 1) * 2;
    const end = start + 2;
    const managers = await Manager.find({ "eventData.events": name })
      .skip(start)
      .limit(end);
    return res.status(200).json({ managers });
  } catch (error) {
    console.log(error.message);
  }
};

const managerData = async (req, res) => {
  try {
    const id = req.params.id;
    const manager = await Manager.findById(id);
    console.log(manager);
    return res.status(200).json({ data: manager, status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const submitBooking = async (req, res) => {
  try {
    const data = req.body.eventdata;
    const dates = data.date.map((dateString) => new Date(dateString));
    const booking = new Booking({
      manager_id: data.manager_id,
      user_id: data.user_id,
      name: data.name,
      event_name: data.event_name,
      mob: data.mob,
      event: data.event,
      preffered_dishes: data.preffered_dishes,
      address: data.address,
      date: dates,
      time: data.time,
      additional_data: data.additional_data,
    });
    const user = await User.findById(data.user_id);
    const bookingdata = await booking.save();
    return res
      .status(200)
      .json({
        alert: "Booking saved",
        status: true,
        data: bookingdata,
        user: user,
      });
  } catch (error) {
    console.log(error.message);
  }
};

const paymentBookingData = async (req, res) => {
  try {
    const { id } = req.params;
    const stripe = new Stripe(
      "sk_test_51NwHkGSEDFbx4uMAi4gaS8gIKK34IfRc6c1ang04n7KDxk5t8rRyid4fKedWCBqlaBUJeKDMczwzhCtPU1nWriaq00ahzBlJ8c"
    );
    const data = await Booking.findById(id);
    if (data.is_paid == "paid") {
      return res.status(403).json({ message: "already paid" });
    }
    const price = data.advance_amount;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: price,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const paymentBookingSuccess = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndUpdate(
      id,
      { $set: { is_paid: "paid" } },
      { new: true }
    );
    const booking = await Booking.findById(id);
    const manager = await Manager.findById(booking.manager_id);
    await Manager.findByIdAndUpdate(
      booking.manager_id,
      { $inc: { wallet_amount: booking.advance_amount } },
      { new: true }
    );
    manager.booked_dates = [...manager.booked_dates, ...booking.date];
    await manager.save();
    new Payment({
      userId: booking.user_id,
      managerId: booking.manager_id,
      bookingId: id,
      amount: booking.advance_amount,
      status: true,
    }).save();
    return res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const userPayment = async (req, res) => {
  try {
    const stripe = new Stripe(
      "sk_test_51NwHkGSEDFbx4uMAi4gaS8gIKK34IfRc6c1ang04n7KDxk5t8rRyid4fKedWCBqlaBUJeKDMczwzhCtPU1nWriaq00ahzBlJ8c"
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 500 * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const paymentSuccess = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { is_paid: true } },
      { new: true }
    );
    await User.findOneAndUpdate(
      { is_admin: true },
      { $inc: { wallet_amount: 500 } },
      { new: true }
    );
    const payment = new Payment({
      userId: id,
      managerId: "Admin",
      amount: 500,
      status: true,
    }).save();
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const paymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Payment.find({ userId: id }).sort({ paidAt: -1 });
    const user = await User.findOne({ _id: id });
    return res.status(200).json({ data, user });
  } catch (error) {
    console.log(error.message);
  }
};

const orderHistory = async (req, res) => {
  try {
    const { id, num } = req.params;
    const start = (num - 1) * 2;
    const end = start + 2;
    const data = await Booking.find({ user_id: id }).skip(start).limit(end);
    res.status(200).json({ data: data });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Booking.findById(id);
    await Booking.findByIdAndUpdate(id, { $set: { is_paid: "cancelled" } });
    let ans = await User.findByIdAndUpdate(
      data.user_id,
      { $inc: { wallet_amount: data.advance_amount } },
      { new: true }
    );
    let admin = await Manager.findByIdAndUpdate(data.manager_id, {
      $inc: { wallet_amount: -data.advance_amount },
    });
    new Payment({
      userId: data.user_id,
      managerId: data.manager_id,
      bookingId: id,
      amount: data.advance_amount,
      status: false,
    }).save();
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const userData = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    return res.status(200).json({ user: user });
  } catch (error) {
    console.log(error.message);
  }
};

const editPhoto = async (req, res) => {
  try {
    const { id } = req.body;
    const cloudinarydata = await uploadToCloudinary(req.file.path, "profile");
    await User.findByIdAndUpdate(id, {
      $set: { profile_img: cloudinarydata.url },
    });
    return res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const accessChat = async (req, res) => {
  const { userId, mangId } = req.body;

  if (!userId) {
    return res.status(400);
  }

  try {
    // Find a chat where the manager's ID matches mangId and the user's ID matches userId
    let isChat = await Chat.findOne({
      "users.manager": mangId,
      "users.user": userId,
    })
      .populate("users.user", "-password") // Populate the "user" references
      .populate("users.manager", "-password") // Populate the "manager" references
      .populate("latestMessage");
    // If a chat exists, send it
    if (isChat) {
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

      // Populate the "users" field in the created chat

      const FullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users.user", "-password")
        .populate("users.manager", "-password")
        .populate("latestMessage")
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender.manager" ? "sender.manager" : "sender.user",
            select: "-password",
          },
        });
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const fetchChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Chat.find({ "users.user": userId })
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
      })
      .then((result) => {
        console.log(result), res.send(result);
      });
  } catch (error) {
    console.log(error.message);
  }
};

const searchUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await Manager.find(keyword); //.find({ _id: { $ne: req.user._id } });
  console.log(users);
  res.status(200).json(users);
};

const submitReview = async (req, res) => {
  try {
    const { content, rating, managId, userId } = req.body;
    const data = await Booking.findOne({
      user_id: userId,
      manager_id: managId,
    });
    if (data) {
      await new Review({
        user: userId,
        starcount: rating,
        content: content,
        manager: managId,
      }).save();
      const manager = await Manager.findById(managId);
      const previousRating = manager.rating ? manager.rating : 0;
      if (previousRating == 0) {
        await Manager.findByIdAndUpdate(
          managId,
          { $set: { rating: rating } },
          { new: true }
        );
      } else {
        const newRating = (previousRating + rating) / 2;
        await Manager.findByIdAndUpdate(
          managId,
          { $set: { rating: newRating } },
          { new: true }
        );
      }
      return res.status(200).json({ status: true });
    } else {
      return res
        .status(200)
        .json({ message: "You need to purchase to review" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const submitReport = async (req, res) => {
  try {
    const { report, managId, userId } = req.body;
    const data = await Booking.findOne({
      user_id: userId,
      manager_id: managId,
    });
    if (data) {
      await new Report({
        content: report,
        manager: managId,
      }).save();
      return res.status(200).json({ status: true });
    } else {
      return res
        .status(200)
        .json({ message: "You need to purchase to report" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const bannerData = async (req, res) => {
  try {
    const banner = await Banner.find({});
    res.status(200).json({ banner });
  } catch (error) {
    console.log(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const mob = parseInt(req.body.mob, 10);

    let data = req.body;

    await User.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: data.name,
          mob: mob,
        },
      }
    );
    let user = await User.findOne({ _id: req.body.id });
    return res.status(200).json({ status: true, user: user });
  } catch (error) {
    console.log(error.message);
  }
};

const searchEvent = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { "eventData.team_name": { $regex: req.query.search, $options: "i" } }
      : {};

    const managers = await Manager.find({
      $and: [{ "eventData.events": req.query.name }, keyword],
    });
    return res.status(200).json({ managers });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
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
  paymentHistory,
  paymentSuccess,
  orderHistory,
  userData,
  editPhoto,
  cancelOrder,
  accessChat,
  fetchChats,
  searchUsers,
  submitReview,
  submitReport,
  bannerData,
  updateUser,
  searchEvent,
};
