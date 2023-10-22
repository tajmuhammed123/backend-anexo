const mongoose=require('mongoose')

const bannerSchema=new mongoose.Schema({
    banner_text:{
        type:String,
        required:true
    },
    main_text:{
        type:String,
        required:true
    },
    button_text:{
        type:String,
        required:true
    },
    banner_img:{
        type:String,
        required:true
    }
})

const bookingData=mongoose.model('bannerData',bannerSchema)
module.exports=bookingData