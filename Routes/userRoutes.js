const express=require('express')
const userRouter=express.Router()
const userController=require('../Controller/userController')
const messageController=require('../Controller/messageController')
const { userAuth } = require('../Middleware/authMiddleware')
const { upload } = require('../Middleware/Multer')

let routeObj={
    signup:'/signup',
    login:'/login',
    googlelogin:'/googlelogin',
    verifyemail:'/verifyemail',
    forgotpas:'/forgotpas',
    verifypassword:'/verifypassword',
    homedata:'/homedata',
    geteventdata:'/geteventdata',
    detailpage:'/detailpage',
    eventlist:'/eventlist',
    managerdata:'/managerdata/:id',
    orderdata:'/orderdata/:id',
    cancelorder:'/cancelorder/:id',
    eventbooking:'/eventbooking',
    paymentbookingdata:'/paymentbookingdata/:id',
    bookingpaymentsuccess:'/bookingpaymentsuccess/:id',
    payment:'/payment',
    paymentsuccess:'/paymentsuccess/:id',
    accesschat:'/accesschat',
    fetchchat:'/fetchchat/:userId',
    usersearch:'/usersearch',
    message:'/message',
    messagewithid:'/message/:chatId',
    submitreview:'/submitreview',
    submitreport:'/submitreport',
    bannerdata:'/bannerdata',
    updateuserprofile:'/updateuserprofile'

}

userRouter.post(routeObj.signup,userController.userReg)
userRouter.post(routeObj.login,userController.userLogin)
userRouter.post(routeObj.googlelogin,userController.userGoogleLogin)
userRouter.get(routeObj.verifyemail,userController.VerifyEmail)
userRouter.patch(routeObj.forgotpas,userController.forgotPassword)
userRouter.patch(routeObj.verifypassword,userController.VerifyPassword)


userRouter.get(routeObj.homedata,userController.homeData)
userRouter.get(routeObj.geteventdata,userController.getEventData)
userRouter.get(routeObj.detailpage,userController.detailData)
userRouter.get(routeObj.eventlist,userController.eventList)


userRouter.get(routeObj.managerdata,userController.managerData)


userRouter.get(routeObj.orderdata,userAuth,userController.orderHistory)
userRouter.get(routeObj.cancelorder,userAuth,userController.cancelOrder)


userRouter.post(routeObj.eventbooking,userAuth,userController.submitBooking)
userRouter.get(routeObj.paymentbookingdata,userController.paymentBookingData)
userRouter.get(routeObj.bookingpaymentsuccess,userController.paymentBookingSuccess)


userRouter.post(routeObj.payment,userAuth,userController.userPayment)
userRouter.post(routeObj.paymentsuccess,userAuth,userController.paymentSuccess)


userRouter.post(routeObj.accesschat,userController.accessChat)
userRouter.get(routeObj.fetchchat,userController.fetchChats)
userRouter.get(routeObj.usersearch,userController.searchUsers)
userRouter.post(routeObj.message,messageController.sendMessage)
userRouter.get(routeObj.messagewithid,messageController.allMessages)


userRouter.post(routeObj.submitreview,userAuth,userController.submitReview)


userRouter.post(routeObj.submitreport,userAuth,userController.submitReport)


userRouter.get(routeObj.bannerdata,userController.bannerData)


userRouter.post(routeObj.updateuserprofile,userAuth,upload.single('profile_img'),userController.updateUser)

module.exports=userRouter