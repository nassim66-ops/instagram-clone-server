const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT } = require("../config/keys");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

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
