const express = require("express");
const adminRouter = express.Router();
const adminController = require("../Controller/adminController");
const { upload } = require("../Middleware/Multer");
const { adminAuth } = require("../Middleware/adminMiddleware");

let routeObj = {
  getmanagerdata: "/getmanagerdata/:num",
  login: "/login",
  getuserdata: "/getuserdata/:num",
  getbookingdata: "/getbookingdata",
  blockuser: "/blockuser/:id",
  reportdata: "/reportdata",
  reportdetails: "/reportdetails/:id",
  getbannerdata: "/bannerdata",
  addbanner: "/addbanner",
  getsinglebannerdata: "/getbannerdata/:id",
  managerapproval: "/managerapproval",
  managerreject: "/managerreject",
  geteventlist: "/geteventlist",
  addeventcategorey: "/addeventcategorey",
  blockevents: "/blockevents/:id",
  getpaymentdata: "/getpaymentdata",
  searchusers: "/searchusers/:search",
  searchmanager: "/searchmanager/:search",
};

adminRouter.post(routeObj.login, adminController.adminLogin);

adminRouter.get(
  routeObj.getmanagerdata,
  adminAuth,
  adminController.managerData
);

adminRouter.get(routeObj.getuserdata, adminAuth, adminController.userData);

adminRouter.get(
  routeObj.getbookingdata,
  adminAuth,
  adminController.bookingData
);

adminRouter.get(routeObj.blockuser, adminAuth, adminController.userBlock);

adminRouter.get(routeObj.reportdata, adminAuth, adminController.reportData);

adminRouter.get(
  routeObj.reportdetails,
  adminAuth,
  adminController.reportDetail
);

adminRouter.get(routeObj.getbannerdata, adminController.bannerData);

adminRouter.post(
  routeObj.addbanner,
  upload.single("banner_img"),
  adminController.addBanner
);
adminRouter.get(routeObj.getsinglebannerdata, adminController.singleBanner);

adminRouter.post(
  routeObj.managerapproval,
  adminAuth,
  adminController.managerApprove
);
adminRouter.post(
  routeObj.managerreject,
  adminAuth,
  adminController.managerReject
);

adminRouter.get(routeObj.geteventlist, adminController.getEventList);

adminRouter.get(routeObj.blockevents, adminController.blockEvents);

adminRouter.get(routeObj.searchusers, adminController.searchUser);
adminRouter.get(routeObj.searchmanager, adminController.searchManager);

adminRouter.post(
  routeObj.addeventcategorey,
  upload.single("eventlogo"),
  adminController.addEvent
);

adminRouter.get(
  routeObj.getpaymentdata,
  adminAuth,
  adminController.paymentData
);

module.exports = adminRouter;
