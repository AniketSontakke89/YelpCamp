if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}


const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);

const userRoutes = require('./routes/users.js');
const campgroundsRoutes = require('./routes/campgrounds.js');
const reviewsRoutes = require('./routes/reviews.js');
const { MongoStore } = require('connect-mongo');

const dbUrl = process.env.DB_URL;
// const dbUrl = "mongodb://localhost:27017/yelp-camp";

 
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine('ejs',ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());

const store = new MongoDBStore({
  url:dbUrl,
  secret:process.env.SESSION_SECRET,
  touchAfter: 24 * 60 * 60
});

store.on('error',function(e){
  console.log("Session store error",e);
})
//this sessionconfig is used for sessions. The cookie property defines some properties for the cookie which will be sent by the session to the user.  Here we have defined the expiration date of the cookie. These are called options for the cookie and sessionConfig itself.
const sessionConfig = {
  store,
  name: 'session', //this is to change the name of cookie. We must change the default name of cookie into something less obvious.
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized:true,
  cookie:{
    httpOnly: true,  //this means cookies are only accessible via html and not by js
    // secure: true; //this is to ensure that the cookies can only be configured at https i.e. secure protocol.
    expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(helmet({contentSecurityPolicy: false}));
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dv5vm4sqh/" ];

app.use(
  helmet.contentSecurityPolicy({
      directives : {
          defaultSrc : [],
          connectSrc : [ "'self'", ...connectSrcUrls ],
          scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
          styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
          workerSrc  : [ "'self'", "blob:" ],
          objectSrc  : [],
          imgSrc     : [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/djh3wngik/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
              "https://images.unsplash.com/"
          ],
          fontSrc    : [ "'self'", ...fontSrcUrls ],
          mediaSrc   : [ "https://res.cloudinary.com/dv5vm4sqh/" ],
          childSrc   : [ "blob:" ]
      }
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//templates will have access to the res.locals object
app.use((req,res,next)=>{
  
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


app.use('/',userRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);






app.get("/", (req, res) => {
  res.render("home.ejs");
});


app.all("*",(req,res,next)=>{
  next(new ExpressError('Page Not Found',404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error.ejs', { err })
})

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
