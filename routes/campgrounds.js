const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require("../models/campground");
const {isLoggedIn, isAuthor,validateCampground} = require('../middleware.js');
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const {storage} = require('../cloudinary/index.js');
const upload = multer({storage});

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'),validateCampground, catchAsync(campgrounds.createCampground))
    // .post(upload.array('image'), (req,res)=>{
    //     console.log(req.body, req.files);
    //     res.send("it worked");
    // })
   
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;






























// router.get("/", catchAsync(campgrounds.index));
  
// //order matter here this must come before /campgrounds/:id get route
// router.get("/new", isLoggedIn, (req, res) => {
//   res.render("campgrounds/new.ejs");
// });

// router.post("/",isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
//   // if(!req.body.campground) throw new ExpressError("Invalid Campground Data",400);
//   const campground = new Campground(req.body.campground);
//   campground.author = req.user._id;
//   await campground.save();
//   req.flash('success','Successfully made a new campground!');
//   res.redirect(`/campgrounds/${campground._id}`);
// }));

// router.get("/:id", catchAsync(async (req, res) => {
//   const campground = await Campground.findById(req.params.id).populate({
//     path:'reviews',
//     populate:{
//       path:'author'
//     }
//   }).populate('author');
//   //another way to handler error if campground is not found just redirect to index page with flash error message.
//   if(!campground){
//     req.flash('error','Cannot find that campground!');
//     return res.redirect('/campgrounds');
//   }
//   res.render("campgrounds/show.ejs", { campground: campground});
// }));

// router.get("/:id/edit",isLoggedIn,isAuthor, catchAsync(async (req, res) => {
//   const campground = await Campground.findById(req.params.id);
//   if(!campground){
//     req.flash('error','Cannot find that campground!');
//     return res.redirect('/campgrounds');
//   }
//   res.render("campgrounds/edit.ejs", { campground: campground });
// }));

// router.put("/:id",isLoggedIn, isAuthor,validateCampground, catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//   req.flash('success','Successfully updated campground!');
//   res.redirect(`/campgrounds/${campground._id}`);
// }));

// router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
//     const {id}= req.params;
//     await Campground.findByIdAndDelete(id);
//     req.flash('success','Successfully deleted campground.');
//     res.redirect('/campgrounds');
// }));

// module.exports = router;