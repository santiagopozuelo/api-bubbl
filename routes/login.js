const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const firestore = require('../db/firebase.js')
const SnapchatStrategy = require('passport-snapchat').Strategy;
//const findOrCreate = require("../db/user.js")
const users = require('../db/user.js');
const JWT_KEY = "something_private_and_long_enough_to_secure"
//const LocalStrategy = require('passport-local').Strategy
const passportCustom =require('passport-custom');
const CustomStrategy = passportCustom.Strategy;

const router = express();

// const validateUser = async (username, done) => {
//     //find user where username same as usernme
//     const currentUser = users.findOrCreateUser(username)
//     const myUser = {username, docId: currentUser}


//     // const user = await users.find(u => u.user_name == username)
//     // if (!user) { return done(null, false); }
//     // if (!user.password === password) { return done(null, false); }
//     return done(null, myUser);

// }
//passport.use(new CustomStrategy(validateUser));

passport.use(new CustomStrategy(
    async function(req, done) {
        const username = req.query.name
        const currentUser = await users.findOrCreateUser(username)
        const name = username
        const myUser = {name, docId: currentUser}
        return done(null,myUser)
      
    }
  ));

router.post('/', (req, res, next) => {
    passport.authenticate('custom',
        (err, user) => {
            const token = jwt.sign({docId: user.docId}, JWT_KEY, {expiresIn: 60 * 60 * 24 * 1000})
            if (err) {
                return res.status(400).send({ error: err })
            }

            if (!user) {
                return res.status(400).send({ error: "Login failed bruh" });
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }

                //res.redirect(`http://localhost:3000/posters/${req.body.planId}?token=${token}`)
                //user.token = token
                user["token"] = token
                //res.redirect(`http://localhost:3000/posters/${req.body.planId}?token=${token}`)
                return res.send(user);
            });

        })(req, res, next);
});

module.exports = router