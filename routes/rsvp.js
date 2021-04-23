const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const firestore = require('../db/firebase.js')
const SnapchatStrategy = require('passport-snapchat').Strategy;
//const findOrCreate = require("../db/user.js")
const users = require('../db/user.js');
const JWT_KEY = "something_private_and_long_enough_to_secure"

const router = express();

// passport.serializeUser(function(user,done){
//     done(null,user)

// })

// passport.deserializeUser(function(user,done){
//     done(null,user)

// })



//   router.get('/login/snapchat', (req, res, next) => {
//     const { redirectTo } = req.query;
//     const state = JSON.stringify({ redirectTo });
//     const authenticator = passport.authenticate('snapchat', { scope: [], state, session: true });
//     authenticator(req, res, next);
//   }, (req, res, next) =>{
//     next();
//   });
var strategySetup = false;
var passport_setup = function(){
    return function(req,res,next){

        console.log(req.query)
        req.session.posterId = req.query.id
        if (!strategySetup){
            passport.use(
                new SnapchatStrategy({
                    clientID: '68a7e876-119d-487d-8ae4-7e7fc6fde029',
                     clientSecret:  "OMZY9SkQxCwXMkzz2bLMaGs1q6753-tOeekHawn-pUs",
                     //redirectURI: "https://localhost:3000",
                    //callbackURL: `https://bubbl-api-0.herokuapp.com/rsvp/snapchat/callback`,
                    callbackURL: 'http://localhost:3001/rsvp/snapchat/callback',
                    profileFields: ['id', 'displayName', 'bitmoji'],
                    scope: ['user.display_name', 'user.bitmoji.avatar'],
                    pkce: true,
                    state: true
                  },
                  async function(req,accessToken, refreshToken, profile, cb) {
                    // In this example, the user's Snapchat profile is supplied as the user
                    // record.  In a production-quality application, the Snapchat profile should
                    // be associated with a user record in the application's database, which
                    // allows for account linking and authorization with other identity
                    // providers.
                
                    //uid of doc returned
                    console.log(req.query)
                    const currentUser = await users.findOrCreate(profile)
                    const myUser = {...profile, docId: currentUser}
                    cb(null,myUser)
                    
                    
                    return cb(null, profile);
                  })
                  
            );
            strategySetup = true;

        }
        next()

    }
}

   router.get('/snapchat', passport_setup(),
   passport.authenticate('snapchat'),(req,res,next)=>{
       console.log(req)
   });

  router.get('/snapchat/callback',
  passport.authenticate('snapchat'),(req,res,next)=>{
    const token = jwt.sign({docId: req.user.docId}, JWT_KEY, {expiresIn: 60 * 60 * 24 * 1000})
    req.logIn(req.user, function(err) {
        if (err) return next(err); ;
        //res.redirect(`http://usebubbl.app/posters/${req.session.posterId}?token=${token}`)
        res.redirect(`http://localhost:3000/posters/${req.session.posterId}?token=${token}`)
        //res.status(200).writeHead(302, {Location:`http://localhost:3000/posters/${req.session.posterId}?token=${token}`})
      });
      //res.send(req.user)

  });





router.get("/", (req,res,next) => {
    const { info } = req.query;
    const data = JSON.stringify(info)
    res.send({yeet: "2"})
});

router.get("/create", async (req,res,next) => {
    const info = req.body
    const mynum = req.body["myId"]
    //const mynum = JSON.parse(info)["num"]
    const resp = await findOrCreate(mynum)
    res.send(resp)
    
});






module.exports = router;