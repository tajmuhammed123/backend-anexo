const mongoose=require('mongoose')

const reviewSchema=new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // Reference to the "user" model
    },
    starcount: {
        type: Number,
        required:true
    },
    content:{
        type: String,
        trim:true
    },
    manager:{
        type:String,
        required:true
    }
})

const review=mongoose.model('review',reviewSchema)
module.exports=review