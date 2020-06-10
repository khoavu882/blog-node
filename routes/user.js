const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

// router.get("/users", async (req, res) => {
//   const users = await Post.find()
//     .populate("category", "_id name")
//     .then((users) => {
//       res.json({ users });
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// });

// router.get("/users/:id", async (req, res) => {
//   await User.find({ _id: req.params.id })
//     .then((user) => {
//       res.json({ user });
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// });

// router.get("/users/post/:postId", async (req, res) => {
//   await User.find({ post: { _id: req.params.postId } })
//     .populate("category", "_id name")
//     .then((user) => {
//       res.json({ user });
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// });

// router
//   .post("/new-user", (req, res) => {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       role,
//       image,
//       token,
//       tokenExp,
//     } = req.body;
//     if (!firstName || !lastName || !email || !password || !role || !image) {
//       res.json({ error: "All fields are required!" });
//     }

//     const post = new Post({
//       firstName,
//       lastName,
//       email,
//       password,
//       role,
//       image,
//       token,
//       tokenExp,
//     });

//     post
//       .save()
//       .then(() => {
//         res.json({ message: "Success!" });
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   })
//   .catch((error) => {
//     console.error(error);
//   });

const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const {
  User,
  validateUser,
  validateUserUpdateProfile,
} = require("../models/user");
const { Role } = require("../models/role");
const router = express.Router();

// Profile
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id)
    // .populate({ path: "wishList" })
    .select("-password -wishList");

  // Valid token but user already deleted
  if (!user) return res.status(404).send("Invalid token");

  res.send(user);
});

// Update profile
router.post("/me", auth, async (req, res) => {
  const { error } = validateUserUpdateProfile(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        gender: req.body.gender,
        address: req.body.address,
      },
    },
    { new: true }
  );

  res.send(user);
});

// Register
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already register");

  //All new account is an CUSTOMER
  const role = await Role.findOne({ name: "CUSTOMER" });

  user = new User(
    _.assign(
      _.pick(req.body, [
        "firstName",
        "lastName",
        "email",
        "password",
        "phone",
        "gender",
        "address",
      ]),
      { role }
    )
  );

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const token = user.generateAuthToken();

  try {
    await user.save();
    res
      .header("x-auth-token", token)
      // Allow webserver whitelist which http header that client allowed to access
      .header("access-control-expose-headers", "x-auth-token")
      .send(
        _.pick(user, [
          "_id",
          "firstName",
          "lastName",
          "email",
          "phone",
          "isAdmin",
        ])
      );
  } catch (err) {
    res.status(404).send(err.message);
  }
});

module.exports = router;

module.exports = router;
