const mongoose=require('mongoose')

const eventListModelSchema=new mongoose.Schema({
    event_name:{
        type:String,
        required:true
    },
    event_image:{
        type:String,
        required:true
    },
    is_block:{
        type:Boolean,
        default:false
    },
    description:{
        type:String
    }
})

const eventListModel=mongoose.model('eventListModel',eventListModelSchema)
module.exports=eventListModel