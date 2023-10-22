const nodemailer=require('nodemailer')

require('dotenv').config()

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure:false,
      requireTLS:true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject: subject,
      html: text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};

module.exports={
    sendEmail
};
