const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT } = require("../config/keys");
const requireLogin = require("../middleware/requireLogin");
const nodemailer = require("nodemailer");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nassimslim321@gmail.com", //sender email
    pass: "password", // password of the sender email
  },
});

router.get("/protected", requireLogin, (req, res) => {
  res.json({ message: "Protected route has been unlocked" });
});

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(422).json({ error: "All fields are required!" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        res.status(400);
        // throw new error("This email has been token!");
        res.json({ error: "This email is already there!" });
      }

      bcrypt.hash(password, 12).then((hashedPassword) => {
        User.create({
          email,
          password: hashedPassword,
          name,
        })
          .then((user) => {
            // transporter.sendMail({
            //   from: '"Fred Foo 👻" <nassimslim321@gmail.com>', // sender address
            //   to: user.email, // list of receivers
            //   subject: "Hello ✔", // Subject line
            //   text: "Hello world?", // plain text body
            //   html: "<b>Hello world?</b>", // html body
            // });
            const mailOptions = {
              from: "nassimslim321@gmail.com",
              to: user.email,
              subject: "Test Email",
              text: "This is a test email sent using Nodemailer.",
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
                console.log("test");
              } else {
                console.log("done");
                console.log("Email sent: " + info.response);
              }
            });
            // res.json(user);
            res.json({ message: "Saved successfully" });
          })
          .catch((err) => {
            console.log("err", err);
          });
      });
    })
    .catch((err) => {
      console.log("err", err);
    });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ error: "Please provide the required fields!" });
  }

  User.findOne({ email })
    .then((savedUser) => {
      if (!savedUser) {
        res.status(404).json({ error: "Invalid username or password" });
      }
      bcrypt
        .compare(password, savedUser.password)
        .then((value) => {
          if (value) {
            // res.json({ message: "Successfully signed in" });
            const accessToken = jwt.sign(
              {
                _id: savedUser._id,
              },
              JWT,
              { expiresIn: "15m" }
            );
            const { _id, name, email, followers, following } = savedUser;
            res.json({
              accessToken,
              user: {
                _id,
                name,
                email,
                followers,
                following,
              },
            });
          } else {
            res.status(404).json({ error: "Invalid username or password" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
