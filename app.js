const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const admin = require('firebase-admin');


const fire = require('./db/firebase.js')


const app = express();
// Parse json encoded in the request body
app.use(bodyParser.json({ limit: '50mb' }));
app.use(require('express-session')({
    secret: "whatever",
    resave: true,
    saveUninitialized: true,
  }));

app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
})

app.use(passport.initialize());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

const router = express.Router()


app.use('/auth', require('./routes/auth.js'))
app.use('/profile', require('./routes/profile'))

app.get('/',
  function(req, res) {
    res.send("yuh")
  });

// start server
app.listen(3001, () => console.log("Server listening on http://localhost:3001"))