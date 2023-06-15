const express = require("express");
const mongoose = require("mongoose");
const { mongoUri } = require("./config/keys");
// const { User } = require("./models/userModel");

const auth = require("./routes/auth");
const post = require("./routes/post");
const user = require("./routes/user");

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoUri);
mongoose.connection.on("connected", () => {
  console.log("Connected to the mongo database");
});

mongoose.connection.on("error", (err) => {
  console.log("Connection error", err);
});

app.use(express.json());
app.use(auth);
app.use(post);
app.use(user);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("The server is running on", PORT);
});
