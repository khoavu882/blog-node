const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Category = mongoose.model("Category");

router.get("/categories", (req, res) => {
  Category.find()
    .then((categories) => {
      res.json({ categories });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get("/categories-num", (req, res) => {
  Category.find()
    .count({})
    .then((categories) => {
      res.json({ categories });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get("/categories/:id", async (req, res) => {
  const category = await Category.find({ _id: req.params.id })
    .then((category) => {
      res.json({ category });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post("/new-category", (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.json({ error: "All fields are required!" });
  }

  const category = new Category({
    name,
  });

  category.save().then(() => {
    res.json({ message: "Success!" });
  });
});

module.exports = router;
