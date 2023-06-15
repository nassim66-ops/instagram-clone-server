const express = require("express");
const router = express.Router();
const Post = require("../models/postModel");
const User = require("../models/userModel");
const requireLogin = require("../middleware/requireLogin");

router.get("/user/:id", requireLogin, (req, res) => {
  const id = req.params.id;

  User.findOne({ _id: id })
    //I don't want to send the password also to the frontend
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: id })
        .populate("postedBy", "_id name")
        .then((result) => {
          res.json({ user, result });
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(404).json({ error: "User not found!" });
    });
});

router.put("/follow", requireLogin, (req, res) => {
  const id = req.user._id;
  const followId = req.body.followId;
  User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: id },
    },
    { new: true }
  )
    .then((result) => {
      User.findByIdAndUpdate(
        id,
        {
          $push: { following: followId },
        },
        { new: true }
      )
        .select("-password")
        .then((r) => {
          res.json(r);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

router.put("/unFollow", requireLogin, (req, res) => {
  const id = req.user._id;
  const unFollowId = req.body.unFollowId;
  User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: { followers: id },
    },
    { new: true }
  )
    .then((result) => {
      User.findByIdAndUpdate(
        id,
        {
          $pull: { following: unFollowId },
        },
        { new: true }
      )
        .select("-password")
        .then((r) => {
          res.json(r);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

module.exports = router;
