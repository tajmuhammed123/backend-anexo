const mongoose=require('mongoose')
require('dotenv').config()

const db=mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('connected to mongoose');
    })
    .catch((err) => {
      console.log(err.message);
    });