const mongoose=require('mongoose')

const bookingSchema=new mongoose.Schema({
    manager_id:{
        type:String,
        required:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    event_name:{
        type:String,
        required:true
    },
    mob:{
        type:String,
        required:true
    },
    event:{
        type:String,
        required:true
    },
    preffered_dishes:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    date: {
        type: [Date],
        required: true,
      },
    time:{
        type:String,
        required:true
    },
    additional_data:{
        type:String,
    },
    advance_amount:{
        type:Number
    },
    is_confirmed:{
        type:Boolean,
        default:false
    },
    is_paid:{
        type:String,
        default:'not paid'
    },
})

const bookingData=mongoose.model('bookingData',bookingSchema)
module.exports=bookingData