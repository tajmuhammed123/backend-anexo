const multer = require('multer');
const path = require('path');

console.log('gfsgf');
const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
    'image/webp':'webp'
}
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        const is_valid = true
        let uploadError= new Error('Input file format error')
        if(is_valid){
            uploadError=null
        }
        cb(uploadError,path.join(__dirname, '../../frontend/public/Images'))
    },
    filename: function(req,file,cb){
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

const upload = multer({ storage: storage })
module.exports={upload}