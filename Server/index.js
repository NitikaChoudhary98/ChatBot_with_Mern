const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeModel = require("./models/Employee");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json()); //transfer data in json format between fe and be
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
  cookieParser(),
  session({
    secret: "mysecret", // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevent JavaScript access to cookies (optional)
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  })
);

mongoose.connect("mongodb://127.0.0.1:27017/Employees");
app.get("/", (req, res) => {
  res.send("Hello World enjoy!");
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  EmployeeModel.findOne({ email: email }).then((user) => {
    if (user) {
      if (user.password === password) {
        req.session.userId = user.email;
        res.cookie("connect.sid", req.sessionID); //generating cookie
        res.send({ message: "login" });
      } else {
        res.json("invalid credentials");
      }
    } else {
      res.status(500).json("User does not exist");
    }
  });
});
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  EmployeeModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        res.status(500).json("user already exits");
      } else {
        const newUser = new EmployeeModel({ name, email, password });
        newUser
          .save()
          .then(() => res.status(200).json("registerarion successfull"))
          .catch((err) => res.json(err));
      }
    })
    .catch((err) => res.status(500).json(err));
});

//to get the user details
app.get("/me", (req, res) => {
  console.log(req.session.userId);
  if (!req.session.userId) {
    return res.status(401).send("You must be logged in to view this page");
  }
  const emailId = req.session.userId;
  EmployeeModel.findOne({ email: emailId }).then((user) => {
    res.send({ name: user.name, email: user.email });
  });
});

// Logout Route
app.get("/auth/logout", (req, res) => {
  req.session.destroy();
  res.send("Logged out successfully!");
});

app.listen(3001, () => {
  console.log("server is running");
});
