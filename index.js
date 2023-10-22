const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
require('./Config/config');
const http = require('http');
const stripe = require('stripe')('sk_test_51NwHkGSEDFbx4uMAi4gaS8gIKK34IfRc6c1ang04n7KDxk5t8rRyid4fKedWCBqlaBUJeKDMczwzhCtPU1nWriaq00ahzBlJ8c');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userRouter = require('./Routes/userRoutes');
app.use('/', userRouter);
const adminRouter = require('./Routes/adminRoutes');
app.use('/admin/', adminRouter);
const managerRouter = require('./Routes/mangerRoutes');
app.use('/manager/', managerRouter);

const server = app.listen(4000, () => {
  console.log('server running at 4000');
});

const io=require('socket.io')(server,{
  pingTimeout:60000,
  cors:{
    origin:'http://localhost:3000'
  }
})

io.on("connection",(socket)=>{
  console.log('connected to socket.io');

  socket.on("setup",(userData)=>{
    socket.join(userData._id)
    socket.emit('connected')
  })

  socket.on('join chat',(room)=>{
    socket.join(room)
    console.log('user joined in the room: '+room);
  })

  socket.on('typing',(room)=>socket.in(room).emit('typing'))
  socket.on('stop typing',(room)=>socket.in(room).emit('stop typing'))

  socket.on('new message', (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    console.log(newMessageRecieved.sender);
  
    const userKeys = Object.keys(chat.users);
  
    userKeys.forEach((userKey) => {
      const user = chat.users[userKey];
      const senderUserId = newMessageRecieved.sender.user
        ? newMessageRecieved.sender.user._id
        : newMessageRecieved.sender.manager._id;
  
      if (userKey !== senderUserId) {
        console.log(user);
        let access = user.user ? user.manager : user.user;
        console.log(access);
        socket.to(access).emit("message received", newMessageRecieved);
      }
    });
  });
  

})
