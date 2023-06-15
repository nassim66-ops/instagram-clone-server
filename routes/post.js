const express = require("express");
const router = express.Router();
const Post = require("../models/postModel");
const requireLogin = require("../middleware/requireLogin");

router.get("/allPosts", requireLogin, (req, res) => {
  Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then((results) => {
      res.json(results);
    });
});

router.get("/allFollowedPosts", requireLogin, (req, res) => {
  Post.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then((results) => {
      res.json(results);
    });
});

router.post("/create", requireLogin, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    res.status(422).json({ error: "Title and body are required!" });
  }
  //This step is to remove the password in the response
  req.user.password = undefined;
  Post.create({
    title,
    body,
    postedBy: req.user,
  })
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/myPosts", requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .then((result) => {
      res.json({ myPosts: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/like", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .then((result) => {
      console.log("result", result);
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/unlike", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log("err", err);
      return res.status(422).json({ error: err });
    });
});

router.put("/comment", requireLogin, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name")

    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.delete("/deletePost/:postId", requireLogin, (req, res) => {
  const postId = req.params.postId;

  Post.findOne({ _id: postId })
    .populate("postedBy", "_id")
    .then((result) => {
      if (req.user._id.equals(result.postedBy._id)) {
        Post.deleteOne()
          .then((e) => {
            res.json({ result });
          })
          .catch((err) => {
            res.status(422).json({ error: err });
          });
      }
    });
});

router.put("/deleteComment", requireLogin, (req, res) => {
  const comment = {
    _id: req.body.id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name")

    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
