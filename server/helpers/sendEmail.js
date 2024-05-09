const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Token = require("../models/token.model");

require("dotenv").config();

module.exports = async (user, mailType) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.email_host,
      auth: {
        user: process.env.email_auth_user,
        pass: process.env.email_auth_password,
      },
    });

    const encryptedToken = bcrypt
      .hashSync(user._id.toString(), 10)
      .replaceAll("/", "");
    const token = new Token({
      userid: user._id,
      token: encryptedToken,
    });
    await token.save();

    let emailContent, mailOptions;
    if (mailType == "verifyemail") {
      emailContent = `<div><h1>Please click on the below link to verify your email address</h1> <a href="http://localhost:3000/verifyemail/${encryptedToken}">${encryptedToken}</a>  </div>`;

      mailOptions = {
        from: `"Deependra 👻" <${process.env.email_auth_user}>`,
        to: user.email,
        subject: "Verify Email For MERN Auth",
        html: emailContent,
      };
    } else {
      emailContent = `<div><h1>Please click on the below link to reset your password</h1> <a href="http://localhost:3000/resetpassword/${encryptedToken}">${encryptedToken}</a>  </div>`;

      mailOptions = {
         from: `"Deependra 👻" <${process.env.email_auth_user}>`,
        to: user.email,
        subject: "Reset password For MERN Auth",
        html: emailContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
