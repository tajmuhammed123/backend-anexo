const mongoose=require('mongoose')

const evetDataSchema=new mongoose.Schema({
    manager_id:{
        type:String,
        required:true
    },
    team_name:{
        type:String,
        required:true
    },
    salutation:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    events:{
        type:Array,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    dishes:{
        type:String,
        required:true
    },
    advance_amount:{
        type:Number,
        required:true
    }

})

const eventData=mongoose.model('eventData',evetDataSchema)
module.exports=eventData