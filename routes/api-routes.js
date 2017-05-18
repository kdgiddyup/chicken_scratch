var db = require("../models");

// module for handling multipart file uploads -- ie, images
var multer  = require('multer')


// for aws storage, require the aws sdk
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
// For dev purposes only
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

var bucket = new AWS.S3({params: {Bucket: process.env.S3_BUCKET}});

// method for uploading images ** https://gist.github.com/adon-at-work/26c8a8e0a1aee5ded03c **
function uploadToS3(file, destFileName, callback) {
    bucket
        .upload({
            ACL: 'public-read', 
            Body: fs.createReadStream(file.path), 
            Key: destFileName.toString(),
            ContentType: 'application/octet-stream' // force download if it's accessed as a top location
        })
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#httpUploadProgress-event
        // .on('httpUploadProgress', function(evt) { console.log(evt); })
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#send-property
        .send(callback);
}

module.exports = function(app){

    //GET ALL STORIES AND BLURBS AND ART AND CONTRIBUTIONS FOR COUNT. THE USER ASSOCIATED WITH THE FIRST CONTRIBUTION.
    app.get("/", function(req, res) {
        db.Story.findAll({
            include: [db.Contribution,db.Art]
        }).then(function(results) {
            res.render("index", {stories: results});
        });
    });

    //GET ALL CONTRIBUTIONS FOR EACH STORY AND USER ASSOCIATED WITH EACH CONTRIBUTION
    app.get("/story/:id", function(req, res) {
        db.Contribution.findAll({
            where: {
                StoryId: req.params.id
            },
            include: [db.Story]
        }).then(function(data) {
              console.log(data);
            res.render("story", {contributions: data});
        });
    });

    //SEARCH USER
    app.get("/", function(req, res) {
        db.User.findOne({
            where: {
                username: req.body.username,
                password: req.body.password
            }
        }).then(function(results) {
            res.render("index", {user: results})
        });
    });

    //CREATE USER
    app.post("/", function(req, res) {
      db.User.create({
        username: req.body.username,
        password: req.body.password
      }).then(function(results) {
        res.redirect("/");
      });
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

    // upload art; id param here is contribution id 
    app.post("/api/new/art/:id", function (req, res) {
        
        if (!req.files || !req.files.file1) {
            return res.status(403).json({message:'Expect 1 file upload'});
        }
        var file1 = req.files.file1;

        // this is mainly for user friendliness. this field can be freely tampered by attacker.
        if (!/^image\/(jpe?g|png|gif)$/i.test(file1.mimetype)) {
            return res.status(403).json({message:'Must upload image file type'});
        }

        var pid = '10000' + parseInt(Math.random() * 10000000);

        uploadToS3(file1, pid, function (err, data) {
            if (err) {
                console.error(err);
            }
            console.log('Image uploaded to',data.Location);
            
        });
    });

        
    
            
            // Read in the file, convert it to base64, store to S3
            // fs.readFile(req.body.filePath, function (err, data) {
            // if (err) { throw err; }

            // var base64data = new Buffer(data, 'binary');

            // var s3 = new AWS.S3();
            // s3.client.putObject({
            //     Bucket: process.env.S3_BUCKET,
            //     Key: req.body.filePath,
            //     Body: base64data,
            //     ACL: 'public-read'
            // },function (resp) {
            //     console.log(arguments);
            //     console.log('Successfully uploaded package.');
            // });

            // });


        
        // db.Art.update({  // to do: add contribution and story id values
        //     art_file: req.body.art_file 
        // })


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

};