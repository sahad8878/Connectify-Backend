
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
} = require("../authenticate/authenticate");

// post user register
const postUserRegister = (req, res) => {
  try {
    // Verify that first name is not empty
    if (!req.body.firstName) {
      res.statusCode = 500;
      res.json({
        name: "FirstNameError",
        message: "The first name is required",
      });
    } else {
      User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
          if (err) {
            res.statusCode = 500;
            res.send(err);
          } else {
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName || "";
            const token = getToken({ _id: user._id });
            const refreshToken = getRefreshToken({ _id: user._id });
            user.refreshToken.push({ refreshToken });
            user
              .save()
              .then((user) => {
                res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
                res.json({ success: true, token });
              })
              .catch((err) => {
                res.statusCode = 500;
                res.send(err);
              });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `postUserregister controller ${error.message}`,
    });
  }
};

// post user login
const postUserLogin = (req, res, next) => {
  try {
    const token = getToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });
    User.findById(req.user._id).then(
      (user) => {
        user.refreshToken.push({ refreshToken });
        user
          .save()
          .then((user) => {
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
            res.json({ success: true, token });
          })
          .catch((err) => {
            res.statusCode = 500;
            res.send(err);
          });
      },
      (err) => next(err)
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `postUserLogin controller ${error.message}`,
    });
  }
};

// google Login

const googleLogin = async(req, res) => {

  try {
   
  const {email,firstName,lastName} = req.body
   const user = await User.findOne({username:email})
console.log(user,"user");
if(user) {
  const token = getToken({ _id: user._id });
  const refreshToken = getRefreshToken({ _id:user._id });
  user.refreshToken.push({ refreshToken });
  user
    .save()
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.status(200).json({success:true,token})
}else {
    const newUser = new User({
      username: email,
      firstName: firstName,
      lastName: lastName,
      authStrategy: "google",
    })
    newUser.save().then((user) => {
      const token = getToken({ _id: user._id });
  const refreshToken = getRefreshToken({ _id:user._id });
  user.refreshToken.push({ refreshToken });
  user
    .save()
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.status(200).json({success:true,token})

    })
}
} catch (error) {
  console.log(error);
  res.status(500).send({
    success: false,
    message: `googleLogin controller ${error.message}`,
  });
}
};

// post refresh Token
const postRefreshToken = (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;

  if (refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const userId = payload._id;
      User.findOne({ _id: userId }).then(
        (user) => {
          if (user) {
            // Find the refresh token against the user record in database
            const tokenIndex = user.refreshToken.findIndex(
              (item) => item.refreshToken === refreshToken
            );

            if (tokenIndex === -1) {
              res.statusCode = 401;
              res.send("Unauthorized");
            } else {
              const token = getToken({ _id: userId });
              // If the refresh token exists, then create new one and replace it.
              const newRefreshToken = getRefreshToken({ _id: userId });
              user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
              user.save().then((user) => {
                res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
                res.json({ success: true, token });
              });
            }
          } else {
            res.statusCode = 401;
            res.send("Unauthorized");
          }
        },
        (err) => next(err)
      );
    } catch (err) {
      res.statusCode = 401;
      res.send("Unauthorized");
    }
  } else {
    res.statusCode = 401;
    res.send("Unauthorized");
  }
};


// post user logout
const postUserLogout = (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  try {
    User.findById(req.user._id).then(
      (user) => {
        const tokenIndex = user.refreshToken.findIndex(
          (item) => item.refreshToken === refreshToken
        );

        if (tokenIndex !== -1) {
          user.refreshToken.splice(tokenIndex, 1);
        }

        user.save().then((user) => {
          res.clearCookie("refreshToken", COOKIE_OPTIONS);
          res.send({ success: true });
        });
      },
      (err) => next(err)
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `postLogout controller ${error.message}`,
    });
  }
};

module.exports = {
  postUserLogin,
  postUserRegister,
  postRefreshToken,
  googleLogin,
  postUserLogout,
};
