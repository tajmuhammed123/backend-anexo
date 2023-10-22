const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mob:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile_img:{
        type:String,
        default:'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80'
    },
    is_admin:{
        type:Boolean,
        default:false
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    is_block:{
        type:Boolean,
        default:false
    },
    wallet_amount:{
        type:Number,
        default:0
    },
    is_paid:{
        type:Boolean,
        default:false
    }
})

const user=mongoose.model('user',userSchema)
module.exports=user