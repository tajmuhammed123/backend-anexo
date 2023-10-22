const express=require('express')
const managerRouter=express.Router()
const managerController=require('../Controller/managerController')
const messageController=require('../Controller/messageController')
const {upload} = require("../utils/Multer");
const { managerAuth } = require('../Middleware/managerMiddleware');

let routeObj={
    login:'/',
    signup:'/signup',
    forgotpas:'/forgotpas',
    verifypassword:'/verifypassword',
    updatemanagerprofile:'/updatemanagerprofile',
    eventdata:'/eventdata/:userID',
    managerdata:'/managerdata/:id',
    managerverify:'/managerverify',
    geteventdata:'/geteventdata/:id',
    bookingdata:'/bookingdata/:id',
    bookeddetails:'/bookeddetails/:id',
    confirmbooking:'/confirmbooking/:amount/:id',
    usersearch:'/usersearch',
    fetchchat:'/fetchchat/:userId',
    message:'/message',
    subscriptionpayment:'/subscriptionpayment/:method',
    subscriptionsuccess:'/subscriptionsuccess',
    handlesubscription:'/handlesubscription/:id'

}


managerRouter.post(routeObj.login,managerController.managerLogin)
managerRouter.post(routeObj.signup,managerController.managerReg)
managerRouter.patch(routeObj.forgotpas,managerController.forgotPassword)
managerRouter.patch(routeObj.verifypassword,managerController.VerifyPassword)
managerRouter.patch(routeObj.updatemanagerprofile,managerAuth,upload.single('profile_img'),managerController.updateMananger)


managerRouter.post(routeObj.eventdata,managerAuth,upload.any("images"),managerController.eventData)
managerRouter.get(routeObj.managerdata,managerAuth,managerController.managerData)
managerRouter.get(routeObj.managerverify,managerController.managerVerify)
managerRouter.get(routeObj.geteventdata,managerController.getEventData)
managerRouter.get(routeObj.bookingdata,managerAuth,managerController.bookingData)
managerRouter.get(routeObj.bookeddetails,managerAuth,managerController.bookingDetails)
managerRouter.get(routeObj.confirmbooking,managerController.confirmBooking)


managerRouter.get(routeObj.usersearch,managerController.searchUsers)
managerRouter.get(routeObj.fetchchat,managerController.fetchChats)
managerRouter.post(routeObj.message,messageController.managerMessage)


managerRouter.get(routeObj.subscriptionpayment,managerAuth,managerController.subscriptionPayment)
managerRouter.post(routeObj.subscriptionsuccess,managerAuth,managerController.subscriptionSuccess)
managerRouter.get(routeObj.handlesubscription,managerAuth,managerController.handleSubscription)

module.exports=managerRouter