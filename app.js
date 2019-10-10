const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

//Map global promise - get rid of warning
mongoose.Promise = global.Promise;

//Connect to mogoose
mongoose
  .connect("mongodb://localhost/vidjot-dev", {
    //useMongoClient: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(err => console.log(err));

//Load Idea Model

require("./models/Idea");
const Idea = mongoose.model("ideas");

//Handlebars middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//method override middleware
app.use(methodOverride("_method"));

//Express Session middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

//connect flash middleware
app.use(flash());

//GLOBAL VARIABLES

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//INDEX Route
app.get("/", (req, res) => {
  const title = "Welcome1";
  res.render("index", {
    title: title
  });
});

//ABOUT Route
app.get("/about", (req, res) => {
  res.render("about");
});

//Ideas route
app.get("/ideas", (req, res) => {
  Idea.find({})
    .sort({ date: "desc" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

//Add Idea Form Route
app.get("/ideas/add", (req, res) => {
  res.render("ideas/add");
});

app.get("/ideas/edit/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    res.render("ideas/edit", {
      idea: idea
    });
  });
});

//Proccess Form
app.post("/ideas", (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({
      text: "Please add a title"
    });
  }
  if (!req.body.details) {
    errors.push({
      text: "Please add some details"
    });
  }
  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };
    new Idea(newUser).save().then(idea => {
      req.flash("success_msg", "Video idea added");
      res.redirect("/ideas");
    });
  }
});

//edit form proccess
app.put("/ideas/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    //new values to update
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save().then(idea => {
      req.flash("success_msg", "Video idea udated");
      res.redirect("/ideas");
    });
  });
});

//Delete Idea catch
app.delete("/ideas/:id", (req, res) => {
  Idea.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash("success_msg", "Video idea removed");
    res.redirect("/ideas");
  });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
