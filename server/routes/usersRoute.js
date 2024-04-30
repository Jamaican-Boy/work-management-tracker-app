const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const usersController = require("../controllers/usersController");

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

module.exports = router;
