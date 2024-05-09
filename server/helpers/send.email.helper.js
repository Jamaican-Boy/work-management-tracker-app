const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Token = require("../models/token.model");

require("dotenv").config();

// Function to get base URL based on environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.BASE_URL_PROD;
  } else {
    return process.env.BASE_URL_DEV;
  }
};

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

    // Calculate token expiry time (30 minutes from now)
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 30);

    const token = new Token({
      userid: user._id,
      token: encryptedToken,
      expiry: tokenExpiry, // Adding expiry time to the token
    });
    await token.save();

    let emailContent, mailOptions;
    if (mailType == "verifyemail") {
      emailContent = `<div><h1>Please click on the below link to verify your email address</h1> <a href="${getBaseUrl()}/verifyemail/${encryptedToken}">${encryptedToken}</a>  </div>`;

      mailOptions = {
        from: `"Deependra 👻" <${process.env.email_auth_user}>`,
        to: user.email,
        subject: "Work-Tracker Verify Email",
        html: emailContent,
      };
    } else {
      emailContent = `<div><h1>Please click on the below link to reset your password</h1> <a href="${getBaseUrl()}/resetpassword/${encryptedToken}">${encryptedToken}</a>  </div>`;

      mailOptions = {
        from: `"Deependra 👻" <${process.env.email_auth_user}>`,
        to: user.email,
        subject: "Work-Tracker Reset password",
        html: emailContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
