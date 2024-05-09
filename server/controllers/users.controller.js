const User = require("../models/user.model");
const Token = require("../models/token.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../helpers/sendEmail");

// register a new user
exports.registerUser = async (req, res) => {
  try {
    // check if the user already exists
    const email = req.body.email;
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      throw new Error("User already exists");
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // save the user
    const user = new User(req.body);
    const result = await user.save();
    // send mail after successful registration
    await sendEmail(result, "verifyemail");
    res.send({
      success: true,
      message: "Registration successful , Please verify your email",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

// login a user
exports.loginUser = async (req, res) => {
  try {
    // Check if the user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error("User does not exist");
    }

    // Check if the password is correct
    const passwordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordCorrect) {
      throw new Error("Invalid password");
    }

    // Check if the user is verified
    if (!user.isVerifed) {
      throw new Error("User is not verified");
    }

    // Prepare data to be sent to the frontend
    const dataToBeSentToFrontend = {
      userId: user._id,
      email: user.email,
      name: user.firstName + " " + user.lastName,
    };

    // Create and assign a token
    const token = jwt.sign(dataToBeSentToFrontend, process.env.jwt_secret, {
      expiresIn: "1d",
    });

    res.send({
      success: true,
      data: token,
      message: "User logged in successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

// get logged in user
exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });

    // remove the password from the user object
    user.password = undefined;

    res.send({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.sendPasswordResetLink = async (req, res) => {
  try {
    const result = await User.findOne({ email: req.body.email });
    await sendEmail(result, "resetpassword");
    res.send({
      success: true,
      message: "Password reset link sent to your email successfully",
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const tokenData = await Token.findOne({ token: req.body.token });
    if (tokenData) {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findOneAndUpdate({
        _id: tokenData.userid,
        password: hashedPassword,
      });
      await Token.findOneAndDelete({ token: req.body.token });
      res.send({ success: true, message: "Password reset successful" });
    } else {
      res.send({ success: false, message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const tokenData = await Token.findOne({ token: req.body.token });
    if (tokenData) {
      await User.findOneAndUpdate({ _id: tokenData.userid, isVerifed: true });
      await Token.findOneAndDelete({ token: req.body.token });
      res.send({ success: true, message: "Email Verified Successfully" });
    } else {
      res.send({ success: false, message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
