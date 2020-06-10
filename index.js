const express = require("express");
const app = express();

app.use(express.json());

const mongoose = require("mongoose");
const { MONGO_URL } = require("./key");

const PORT = 5000;

mongoose
  .connect(MONGO_URL, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// Models
require("./models/post");
require("./models/comment");
require("./models/category");

// Routes
const postRoute = require("./routes/post");
const commentRoute = require("./routes/comment");
const categoryRoute = require("./routes/category");

app.use(postRoute);
app.use(commentRoute);
app.use(categoryRoute);

app.listen(PORT, () => {
  console.log("Server is running on port :", PORT);
});
