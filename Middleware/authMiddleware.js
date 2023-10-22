const jwt = require('jsonwebtoken');
const User=require('../Models/userModels')
require('dotenv').config();

const userAuth = async (req, res, next) => {
    try {
        console.log(req.headers.authorization);
        if (req.headers.authorization) {
            console.log('jkh');
            let token = req.headers.authorization.split(' ')[1];
            console.log('ghr');
            try {
                let decoded = jwt.verify(token, process.env.JwtSecretKey);
                const user = await User.findOne({ _id: decoded.userId });
                console.log();
                if (user) {
                    if(user.is_block){
                        console.log('user blocked');
                        return res.status(403).json({message:'user blocked'})
                    }
                    next();
                }else{
                    console.log('not a user');
                    return res.status(403).json({message:'Not a user'})
                }
              } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(403).json({message:'user expired'})
                } else {
                  console.error('JWT verification error:', error);
                }
              }
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    userAuth
};
