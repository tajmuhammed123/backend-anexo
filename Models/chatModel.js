const mongoose=require('mongoose')

const chatSchema=new mongoose.Schema({
    chatName:{
        type:String,
        trim:true
    },
    users:{user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // Reference to the "user" model
      },
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'manager' // Reference to the "manager" model
      }},
    latestMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'message'
    }
},{
    timestamps:true
})

const chat=mongoose.model('chat',chatSchema)
module.exports=chat