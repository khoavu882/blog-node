const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const Comment = mongoose.model("Comment");

router.get("/comments", (req, res) => {
  Comment.find()
    .populate("post", "_id title")
    .then((comments) => {
      res.json({ comments });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get("/comments-num", (req, res) => {
  Comment.find()
    .count({})
    .then((comments) => {
      res.json({ comments });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get("/comments/post/:postId", (req, res) => {
  Comment.find({ post: { _id: req.params.postId } })
    .populate("post", "_id title")
    .then((comments) => {
      res.json({ comments });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.post("/new-comment", (req, res) => {
  const { body, post } = req.body;
  if (!body || !post) {
    res.json({ error: "All fields are required!" });
  }

  Post.findOne({ _id: post.id })
    .then((post) => {
      res.json({ post });
      const comments = new Comment({
        body,
        post: post,
      });

      comments
        .save()
        .then(() => {
          res.json({ message: "Success!" });
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
});

module.exports = router;
