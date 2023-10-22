const mongoose=require('mongoose')

const reportSchema=new mongoose.Schema({
    
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'manager'
      },
    content:{
        type: String,
        trim:true
    }
})

const report=mongoose.model('report',reportSchema)
module.exports=report