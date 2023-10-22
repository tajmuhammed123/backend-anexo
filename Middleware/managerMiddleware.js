const jwt = require('jsonwebtoken');
const Manager=require('../Models/managerModel')
require('dotenv').config();

const managerAuth = async (req, res, next) => {
    try {
        console.log(req.headers.authorization);
        if (req.headers.authorization) {
            console.log('jkh');
            let token = req.headers.authorization.split(' ')[1];
            console.log('ghr');
            try {
                let decoded = jwt.verify(token, process.env.JwtSecretKey);
                const manager = await Manager.findOne({ _id: decoded.userId });
                if (manager) {
                    next();
                }else{
                    console.log('not a user');
                    return res.status(403).json({message:'Not a Manager'})
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
    managerAuth
};
