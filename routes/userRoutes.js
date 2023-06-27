const express = require("express");
const router = express.Router();
const passport = require("passport");
const {upload} = require("../middlewares/multer")
const {
  verifyUser,
} = require("../authenticate/authenticate");

const {
  postUserRegister,
  postUserLogin,
  googleLogin,
  postUserLogout
  
} = require("../controller/authController")
const { 
  getUserDetails,
  postUserDetails,
  getNativesDetails,
  getSearchData
} = require("../controller/userController")

// Post routes

router.post("/signup",postUserRegister );

router.post("/login",passport.authenticate("local", { session: false }),postUserLogin);

router.post("/googleLogin",googleLogin)

router.post("/logout", verifyUser,postUserLogout);

router.post("/addUserdetails", verifyUser,upload.single("file") ,postUserDetails);

// Get routes

router.get("/getUserDetails", verifyUser,getUserDetails);

router.get("/getNatives",verifyUser,getNativesDetails)

router.get("/getSearchData",verifyUser,getSearchData)

module.exports = router;
