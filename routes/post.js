const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const User = mongoose.model("User");
const Category = mongoose.model("Category");

router.get("/posts", async (req, res) => {
  const posts = await Post.find()
    .populate("category", "_id name")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/trending-posts", async (req, res) => {
  const posts = await Post.find()
    .sort({ numOfLikes: -1 })
    .populate("category", "_id name")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/fresh-stories", async (req, res) => {
  const posts = await Post.find()
    .sort({ _id: -1 })
    .limit(3)
    .populate("category", "_id name")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/featured-posts", async (req, res) => {
  const posts = await Post.find({ isFeatured: true })
    .populate("category", "_id name")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/posts/:id", async (req, res) => {
  await Post.find({ _id: req.params.id })
    .then((post) => {
      res.json({ post });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/posts/category/:categoryId", async (req, res) => {
  await Post.find({ category: { _id: req.params.categoryId } })
    .populate("category", "_id name")
    .then((post) => {
      res.json({ post });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/posts/user/:userId", async (req, res) => {
  await Post.find({ user: { _id: req.params.userId } })
    .populate("category", "_id name")
    .then((post) => {
      res.json({ post });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post("/new-post", (req, res) => {
  const {
    title,
    description,
    imgUrl,
    numOfLikes,
    isFeatured,
    category,
  } = req.body;
  if (!title || !description || !imgUrl || !category) {
    res.json({ error: "All fields are required!" });
  }

  Category.findOne({ _id: category.id })
    .then((category) => {
      const post = new Post({
        title,
        description,
        imgUrl,
        numOfLikes,
        isFeatured,
        category: category,
      });

      post
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

router.get("/search/:str", (req, res) => {
  const { str } = req.params;
  if (!str) {
    res.json({ error: "Nothing is Searched!" });
  }

  Post.find({ $text: { $search: str } })
    .then((posts) => {
      res.json({ message: "Found!: ", posts });
    })
    .catch((error) => {
      console.error(error);
    });
});

module.exports = router;
