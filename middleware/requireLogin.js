const jwt = require("jsonwebtoken");
const { JWT } = require("../config/keys");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const requireLogin = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ error: "You have to login in first" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT, (err, payload) => {
    if (err) {
      res.status(400).json({ error: "You have to login again!" });
    }
    const { _id } = payload;
    User.findById(_id).then((userData) => {
      req.user = userData;
      next();
    });
  });
};

module.exports = requireLogin;
