const mongoose=require('mongoose')

const messageSchema=new mongoose.Schema({
    sender:
        {user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // Reference to the "user" model
      },
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'manager' // Reference to the "manager" model
      }},
    content:{
        type: String,
        trim:true
    },
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'chat'
    }
},{
    timestamps:true
})

const message=mongoose.model('message',messageSchema)
module.exports=message