const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
let configDB = require('../config/database.js');
const uri = configDB.url;

// Connect to MongoDB using Mongoose
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch(error => {
  console.error("MongoDB connection error:", error);
});

const db = mongoose.connection;

module.exports = function (app, passport) {
  // Home Route
  app.get("/", (req, res) => {
    res.render("index.ejs");
  });

  // Profile Route
  app.get("/profile", isLoggedIn, async (req, res) => {
    try {
      const books = await db.collection("books").find({ email: req.user.local.email }).toArray();
      res.render("profile.ejs", { books });
    } catch (error) {
      console.error("Error fetching profile data:", error);
      res.status(500).send("Error fetching profile data");
    }
  });

  // Bookmark Route
  app.post("/bookmark", async (req, res) => {
    const { title, author, imageLink } = req.body;
    try {
      await db.collection("books").insertOne({
        title,
        author,
        imageLink,
        email: req.user.local.email,
      });
      res.redirect("/profile");
    } catch (error) {
      console.error("Error saving bookmark:", error);
      res.status(500).send("Error saving bookmark");
    }
  });

  // Delete Book Route
  app.delete("/deleteBook", async (req, res) => {
    const { id } = req.body;
    try {
      await db.collection("books").findOneAndDelete({ _id: new ObjectId(id) });
      res.json("Success");
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).send("Error deleting book");
    }
  });

  // Delete Message Route
  app.delete("/messages", async (req, res) => {
    try {
      const result = await db.collection("messages").findOneAndDelete({
        name: req.body.name,
        msg: req.body.msg,
      });
      if (result.value) {
        res.send("Message deleted!");
      } else {
        res.status(404).send("Message not found");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).send("Error deleting message");
    }
  });

  // Authentication routes
  app.get("/login", (req, res) => {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  app.post("/login", passport.authenticate("local-login", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }));

  app.get("/signup", (req, res) => {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  app.post("/signup", passport.authenticate("local-signup", {
    successRedirect: "/profile",
    failureRedirect: "/signup",
    failureFlash: true,
  }));

  app.get("/unlink/local", isLoggedIn, (req, res) => {
    const user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(err => {
      if (err) console.error(err);
      res.redirect("/profile");
    });
  });
};

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}