// auth, image upload and api routes go here

var db = require("../models");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

// set up for image uploading
// multer helps with multipart files (ie, images)
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

var S3FS = require('s3fs');
var bucketPath = process.env.S3_BUCKET;

var s3Options = {
  region: 'us-east-1',
};
var fsImpl = new S3FS(bucketPath, s3Options);

module.exports = function(app){

    app.use(require('cookie-parser')())
    app.use(require('body-parser').urlencoded({ extended: true }))
    app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(function(username, pass, cb){
        var hashedPass = bCrypt.hashSync(pass)
        db.User.findOne({
            where: {
                username: username
            }
        }).then(function(user, err){
            if (err) { 
                return cb(err); 
            }
            if (!user) { 
                return cb(null, false); 
            }
            if (!bCrypt.compareSync(pass, user.password)){ 
                return cb(null, false); 
            }
            return cb(null, user);
        })
    }))

    passport.serializeUser(function(user, cb) {
        cb(null, user.id);
    });

    passport.deserializeUser(function(id, cb) {
        db.User.findById(id).then(function (user) {
            cb(null, user);
        });
    });

    app.use(function(req,res,next){
        if(req.user){
            res.locals.user = req.user.username
        }
        next()
    });

   

    //SIGN IN FROM INDEX PAGE / SEARCH USER
    app.post("/signin/", passport.authenticate('local'), function(req, res) {
        console.log("Succesfully signed in.");
        res.redirect("/");
    });

    // SIGN IN FROM STORY PAGE
    app.post("/signin/:from", passport.authenticate('local'), function(req, res) {
        console.log("Succesfully signed in.");
        res.redirect("/story/"+req.params.from);
    });

    app.post("/signup", function(req, res, next){
        db.User.findOne({
            where: {
                username: req.body.username
            }
        }).then(function(user){
            if(!user){
            db.User.create({
                username: req.body.username,
                password: bCrypt.hashSync(req.body.password)
            }).then(function(user){
                passport.authenticate("local", {failureRedirect:"/signup", successRedirect: "/signup"})(req, res, next)
                return done(null, user);

            })
            } else {
                res.send("user exists");
            }
        })
    })

    app.get("/signup", function(req, res){
        console.log("Successfully signed up.");
        res.redirect("/")
    });

    //CREATE STORY
    app.post("/api/new/story", function(req, res) {
        db.Story.create({
            title: req.body.title,
            blurb: req.body.blurb
        }).then(function(results) {
            res.redirect("/");
        });
    });

    //CREATE CONTRIBUTION

    app.post("/api/new/contribution/:id", function(req, res) {
    db.Contribution.create({
        contribution_text: req.body.contribution_text,
        // req.user.id gets the user id serialized in the passport session
        UserId: req.user.id,
        StoryId: req.params.id
    }).then(function(results) {
        res.redirect("/story/"+results.StoryId);
    });
});

    // upload contribution art

    app.post("/api/new/art", upload.single('fileupload'), function (req, res, next) {
    // req.file is the `fileupload` file 
    // req.body will hold the text fields, if there were any   
       var fileName = "img-Story"+req.body.StoryId+"-Contrib"+req.body.ContributionId+'.'+req.file.mimetype.split("/")[1];
        fsImpl.writeFile(fileName, req.file.buffer, "binary", function (err) {
            if (err) throw(err);
            db.Art.create({
                art_file: 'https://s3.amazonaws.com/chickenscratchdb/'+fileName,
                ContributionId: req.body.ContributionId,
                StoryId: req.body.StoryId
            }).then(function(results) {
                res.redirect("/story/" + req.body.StoryId);
            });
        });
    });
 
  // upload cover art -> id is cover art index
     app.post("/api/new/cover/:id", upload.single('fileupload'), function (req, res, next) {
    // req.file is the `fileupload` file 
    // req.body will hold the text fields, if there were any
    // CoverId will be integer representing length of image URLs in this row   
       var fileName = "img-Story"+req.body.StoryId+"-Cover"+req.params.id+"."+req.file.mimetype.split("/")[1];

    // append cover_art URL to existing image file string
       var covers = req.body.images+",https://s3.amazonaws.com/chickenscratchdb/"+fileName;

      // upload image to AWS
       fsImpl.writeFile(fileName, req.file.buffer, "binary", function (err) {
        if (err) throw(err);
            
         // update story row in table
        console.log("\n\nTHIS COVER:",covers[req.params.id]+"\n\n");

            db.Story.update(
                {
                    cover_art: covers,
                 },
                {
                    where: { id:req.body.StoryId }
                }
            ).then(function(results) {
                res.redirect("/story/" + req.body.StoryId);
            });
        });
    });

    // return story coverart data; id here is story id
    app.get("/api/coverart/:id", function(req,res){
        db.Story.findOne({
            where: {
                id:req.params.id
            }
        }).then(function(results){
            
            res.json(results.cover_art)
        })
    });

    // return contributor username
     app.get("/api/contributor/:id", function(req, res) {
        db.User.findOne({
            where: {
                id: req.params.id
            }
        }).then(function(results) {
     
            res.json({name:results.username})
        });
    });    
 
 // route for fetching art for contributions
     app.get("/api/art/:id", function(req, res) {
        db.Art.findOne({
            where: {
                ContributionId: req.params.id
            }
        }).then(function(results) {

            res.json({url:results.art_file})
        });
    });   

   //ADD RANK
    // app.put("/:id", function(req, res) {
    //     db.Contribution.update({
    //         rank: req.body.rank
    //     }).then(function(results) {
    //         res.redirect("/");
    //     });
    // });

    // //ADD RANK
    // app.put("/:id", function(req, res) {
    //     db.Art.update({
    //         rank: req.body.rank
    //     }).then(function(results) {
    //         res.redirect("/");
    //     })
    //});
}
