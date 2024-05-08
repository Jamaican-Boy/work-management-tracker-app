const nodemailer = require("nodemailer");
require("dotenv").config


const transporter = nodemailer.createTransport({
  host: process.env.email_host,
  auth: {
    user: process.env.email_auth_user,
    pass: process.env.email_auth_password,
  },
});

async function sendMail(email) {
  // send mail with defined transport object
  await transporter.sendMail({
    from: `"Deependra 👻" <${process.env.email_auth_user}>`, // sender address
    to: email, // list of receivers
    subject: "Work-Management-Tracker-App", // Subject line
    text: "Congratulations! Your email has been successfully registered. Welcome aboard! We're thrilled to have you join us.", // plain text body
  });
}

module.exports = sendMail;
