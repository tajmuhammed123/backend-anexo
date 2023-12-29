const User = require("../Models/userModels");
const Manager = require("../Models/managerModel");
const Payment = require("../Models/transactionModel");
const Report = require("../Models/reportModel");
const Banner = require("../Models/bannerModel");
const Events = require("../Models/eventsModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Tokenmodel = require("../Models/token.js");
const {
  MultiUploadCloudinary,
  uploadToCloudinary,
} = require("../utils/cloudinary");
const eventListModel = require("../Models/eventsModel");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email: email });

    if (exists) {
      const access = await bcrypt.compare(password, exists.password);

      if (access && exists.is_admin === true) {

        let token = await Tokenmodel.findOne({ userId: exists._id });
        if (!token) {
          token = await new Tokenmodel({
            userId: exists._id,
            token: jwt.sign({ userId: exists._id }, process.env.JwtSecretKey, {
              expiresIn: "1d",
            }),
          });
          await token.save();
        }

        return res
          .status(200)
          .json({ user: exists, token: token, alert: "Logined", status: true });
      } else {
        return res
          .status(404)
          .json({ alert: "Password is wrong", status: false });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const managerData = async (req, res) => {
  try {
    const { num } = req.params;
    let start = (num - 1) * 2;
    let limit = start + 2;
    const data = await Manager.find({ eventData: { $exists: true, $ne: null } })
      .skip(start)
      .limit(limit);
    return res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.log(error.message);
  }
};
const userData = async (req, res) => {
  try {
    const { num } = req.params;
    const start = (num - 1) * 5;
    const end = start + 5;
    const data = await User.find({}).skip(start).limit(end);
    return res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.log(error.message);
  }
};
const bookingData = async (req, res) => {
  try {
    const data = await Payment.find({});
    return res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const userBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const data = await User.findByIdAndUpdate(
      id,
      { $set: { is_block: !user.is_block } },
      { new: true }
    );
    return res.status(200).json({ data: data, status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const managerApprove = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Manager.findOneAndUpdate(
      { _id: id },
      { $set: { is_authorized: true } },
      { upsert: true }
    );
    return res.status(200).json({ alert: "Approved", status: true });
  } catch (error) {
    console.log(error.message);
  }
};
const managerReject = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Manager.findOneAndUpdate(
      { _id: id },
      { $set: { is_authorized: false } },
      { upsert: true }
    );
    return res
      .status(200)
      .json({ alert: "Rejected", status: false, success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const addEvent = async (req, res) => {
  try {
    const { categorey, description } = req.body;
    const cloudinarydata = await uploadToCloudinary(req.file.path, "categorey");
    const data = new eventListModel({
      event_name: categorey,
      event_image: cloudinarydata.url,
      description,
    });
    let rslt = await data.save();
  } catch (error) {
    console.log(error.message);
  }
};

const reportData = async (req, res) => {
  try {
    const data = await Report.find({}).populate("manager");
    return res.status(200).json({ data });
  } catch (error) {
    console.log(error.message);
  }
};
const reportDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Report.find({ manager: id }).populate("manager");
    return res.status(200).json({ data });
  } catch (error) {
    console.log(error.message);
  }
};

const addBanner = async (req, res) => {
  try {
    const cloudinarydata = await uploadToCloudinary(
      req.file.path,
      "banner_img"
    );
    const { banner_text, main_text, button_text } = req.body;
    if (req.body.id) {
      const banner = await Banner.findByIdAndUpdate(req.body.id, {
        $set: {
          banner_text,
          main_text,
          button_text,
          banner_img: cloudinarydata.url,
        },
      });
      return res.status(200).json({ banner });
    } else {
      const banner = await new Banner({
        banner_text,
        main_text,
        button_text,
        banner_img: cloudinarydata.url,
      }).save();
      return res.status(200).json({ banner });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getEventList = async (req, res) => {
  try {
    const eventData = await Events.find({});
    return res.status(200).json({ eventData });
  } catch (error) {}
};

const blockEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Events.findById(id);
    if (!event) {
      console.log("Event not found");
      return;
    }

    const newIsBlockValue = !event.is_block;

    await Events.findByIdAndUpdate(id, { $set: { is_block: newIsBlockValue } });
    const events = await Events.find();
    res.status(200).json({ events });
  } catch (error) {
    console.log(error.message);
  }
};

const searchUser = async (req, res) => {
  try {
    const keyword = req.params.search
      ? {
          $or: [
            { name: { $regex: req.params.search, $options: "i" } },
            { email: { $regex: req.params.search, $options: "i" } },
          ],
        }
      : {};

    const user = await User.find(keyword);
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
  }
};

const searchManager = async (req, res) => {
  try {
    const keyword = req.params.search
      ? {
          $or: [
            { name: { $regex: req.params.search, $options: "i" } },
            { email: { $regex: req.params.search, $options: "i" } },
          ],
        }
      : {};
    const user = await Manager.find(keyword);
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
  }
};

const bannerData = async (req, res) => {
  try {
    let banner = await Banner.find({});
    return res.status(200).json({ banner });
  } catch (error) {
    console.log(error.message);
  }
};
const singleBanner = async (req, res) => {
  try {
    const { id } = req.params;
    let banner = await Banner.findById(id);
    return res.status(200).json({ banner });
  } catch (error) {
    console.log(error.message);
  }
};

const paymentData = async (req, res) => {
  try {
    const paymentdata = await Payment.findOne({ managerId: "Admin" });
    return res.status(200).json({ data: paymentdata });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminLogin,
  managerData,
  userData,
  bookingData,
  userBlock,
  searchUser,
  searchManager,
  managerApprove,
  managerReject,
  addEvent,
  reportData,
  reportDetail,
  getEventList,
  blockEvents,
  bannerData,
  singleBanner,
  addBanner,
  paymentData,
};
