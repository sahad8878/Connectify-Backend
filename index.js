const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const passport = require("passport");
const path = require("path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require("./utils/connectedb");

require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");

require("./authenticate/authenticate");

const userRouter = require("./routes/userRoutes");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "middlewares/uploads"))
);

const whirelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : [];

app.use(
  cookieSession({
    name: "session",
    keys: ["Tummoc"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || whirelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   Credential: true,
// };

app.use(passport.initialize());
app.use(passport.session());

app.use(cors(
  // corsOptions
  ));

app.use("/users", userRouter);


const server = app.listen(process.env.PORT || 8081, function () {
  const port = server.address().port;

  console.log("App started at port: ", port);
});
