const express = require("express");
const userRouter = express.Router();
const userController = require("../Controller/userController");
const messageController = require("../Controller/messageController");
const { userAuth } = require("../Middleware/authMiddleware");
const { upload } = require("../Middleware/Multer");

let routeObj = {
  signup: "/signup",
  login: "/login",
  googlelogin: "/googlelogin",
  verifyemail: "/verifyemail",
  forgotpas: "/forgotpas",
  verifypassword: "/verifypassword",
  homedata: "/homedata",
  geteventdata: "/geteventdata",
  detailpage: "/detailpage",
  eventlist: "/eventlist",
  managerdata: "/managerdata/:id",
  orderdata: "/orderdata/:id/:num",
  cancelorder: "/cancelorder/:id",
  eventbooking: "/eventbooking",
  paymentbookingdata: "/paymentbookingdata/:id",
  bookingpaymentsuccess: "/bookingpaymentsuccess/:id",
  payment: "/payment",
  paymentsuccess: "/paymentsuccess/:id",
  userdata: "/userdata/:id",
  editprofilephoto: "/editprofilephoto",
  accesschat: "/accesschat",
  fetchchat: "/fetchchat/:userId",
  usersearch: "/usersearch",
  message: "/message",
  messagewithid: "/message/:chatId",
  submitreview: "/submitreview",
  submitreport: "/submitreport",
  bannerdata: "/bannerdata",
  updateuserprofile: "/updateuserprofile",
  paymenthistory: "/paymenthistory/:id",
  eventsearch: "/eventsearch",
};

userRouter.post(routeObj.signup, userController.userReg);
userRouter.post(routeObj.login, userController.userLogin);
userRouter.post(routeObj.googlelogin, userController.userGoogleLogin);
userRouter.get(routeObj.verifyemail, userController.VerifyEmail);
userRouter.patch(routeObj.forgotpas, userController.forgotPassword);
userRouter.patch(routeObj.verifypassword, userController.VerifyPassword);

userRouter.get(routeObj.homedata, userController.homeData);
userRouter.get(routeObj.geteventdata, userController.getEventData);
userRouter.get(routeObj.detailpage, userController.detailData);
userRouter.get(routeObj.eventlist, userController.eventList);
userRouter.get(routeObj.managerdata, userController.managerData);

userRouter.get(routeObj.orderdata, userAuth, userController.orderHistory);
userRouter.get(routeObj.cancelorder, userAuth, userController.cancelOrder);
userRouter.get(routeObj.userdata, userAuth, userController.userData);
userRouter.post(
  routeObj.editprofilephoto,
  userAuth,
  upload.single("profile"),
  userController.editPhoto
);

userRouter.post(routeObj.eventbooking, userController.submitBooking);
userRouter.get(routeObj.paymentbookingdata, userController.paymentBookingData);
userRouter.get(
  routeObj.bookingpaymentsuccess,
  userController.paymentBookingSuccess
);

userRouter.get(routeObj.payment, userAuth, userController.userPayment);
userRouter.post(
  routeObj.paymentsuccess,
  userAuth,
  userController.paymentSuccess
);
userRouter.get(
  routeObj.paymenthistory,
  userAuth,
  userController.paymentHistory
);

userRouter.post(routeObj.accesschat, userController.accessChat);
userRouter.get(routeObj.fetchchat, userAuth, userController.fetchChats);
userRouter.get(routeObj.usersearch, userAuth, userController.searchUsers);
userRouter.post(routeObj.message, userAuth, messageController.sendMessage);
userRouter.get(routeObj.messagewithid, messageController.allMessages);

userRouter.post(routeObj.submitreview, userAuth, userController.submitReview);

userRouter.post(routeObj.submitreport, userAuth, userController.submitReport);

userRouter.get(routeObj.bannerdata, userController.bannerData);

userRouter.get(routeObj.eventsearch, userController.searchEvent);

userRouter.post(
  routeObj.updateuserprofile,
  userAuth,
  userController.updateUser
);

module.exports = userRouter;
