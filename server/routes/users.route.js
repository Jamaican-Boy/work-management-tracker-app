const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const usersController = require("../controllers/users.controller");

// register a new user
router.post("/register", usersController.registerUser);

// login a user
router.post("/login", usersController.loginUser);

// get logged in user
router.get(
  "/get-logged-in-user",
  authMiddleware,
  usersController.getLoggedInUser
);

router.post("/send-password-reset-link", usersController.sendPasswordResetLink);

router.post("/reset-password", usersController.resetPassword);

router.post("/verifyemail", usersController.verifyEmail);

module.exports = router;
