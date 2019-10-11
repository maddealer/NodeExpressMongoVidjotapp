const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

//load routes
const ideas = require("./routes/ideas");
const users = require("./routes/users");

//Passport config
require("./config/passport")(passport);

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

//Static folder
app.use(express.static(path.join(__dirname, "public")));

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

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash middleware
app.use(flash());

//GLOBAL VARIABLES

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
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

app.use("/ideas", ideas);
app.use("/users", users);

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
