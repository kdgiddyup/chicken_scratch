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

    passport.use(new LocalStrategy(function(username, pass, cb){
    var hashedPass = bCrypt.hashSync(pass)
        db.User.findOne({
            where: {
            username: username
            }
        }).then(function(user, err){
            if (err) { return cb(err); }
            if (!user) { 
            return cb(null, false); }
            if (!bCrypt.compareSync(pass, user.password)){ 
            return cb(null, false); }
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

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function(req,res,next){
        if(req.user){
            res.locals.user = req.user.username
        }
        next()
    })

    //GET ALL STORIES AND BLURBS AND ART AND CONTRIBUTIONS FOR COUNT. THE USER ASSOCIATED WITH THE FIRST CONTRIBUTION.
    app.get("/", function(req, res) {
        db.Story.findAll({
            include: [db.Contribution,db.Art]
        }).then(function(results) {
            
            res.render("index", {stories: results});
        });
    });

    app.get("/signout", function(req, res){
        req.session.destroy();
        res.redirect("/posts");
    });

    //GET ALL CONTRIBUTIONS FOR EACH STORY AND USER ASSOCIATED WITH EACH CONTRIBUTION
    app.get("/story/:id", function(req, res) {
        db.Story.findOne({
            where: {
                id: req.params.id
            },
            include: [db.Contribution, db.Art]
        }).then(function(data) {
            console.log(data)
            res.render("story", {story: data});
            });
        });

    //SEARCH USER
    app.post("/signin", passport.authenticate('local', { 
        failureRedirect: '/signin',
        successRedirect: '/'
    }))

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
                passport.authenticate("local", {failureRedirect:"/signup", successRedirect: "/"})(req, res, next)
                return done(null, user);
            })
            } else {
            res.send("user exists")
            }
        })
    })

    app.get("/signup", function(req, res){
        console.log("Successfully signed up.");
        res.redirect("/")
    });

    app.get("/signin", function(req, res){
        console.log("Succesfully signed in.");
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
            UserId: req.body.userId,
            StoryId: req.params.id
        }).then(function(results) {
            res.redirect("/");
        });
    });


    // upload art

    app.post("/api/new/art", upload.single('fileupload'), function (req, res, next) {
    // req.file is the `fileupload` file 
    // req.body will hold the text fields, if there were any   
       console.log('req.body: ',req.body);
       var fileName = "img-Story"+req.body.StoryId+"-Contrib"+req.body.ContributionId+"."+req.file.mimetype.split("/")[1];
       console.log(req.file);
        fsImpl.writeFile(fileName, req.file.buffer, "binary", function (err) {
            if (err) throw(err);
            db.Art.create({
                art_file: 'https://s3.amazonaws.com/chickenscratchdb/'+fileName,
                ContributionId: req.body.ContributionId,
                StoryId: req.body.StoryId
            }).then(function(results) {
                res.redirect("/story/"+req.body.StoryId)
            })
        });
    });
 
     app.get("/contributor/:id", function(req, res) {
        db.User.findOne({
            where: {
                id: req.params.id
            }
        }).then(function(results) {
     
            res.json({name:results.username})
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
