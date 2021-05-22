const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const firestore = require('../db/firebase.js')
const SnapchatStrategy = require('passport-snapchat').Strategy;
//const findOrCreate = require("../db/user.js")
const users = require('../db/user.js');
const JWT_KEY = "something_private_and_long_enough_to_secure"

const router = express();

router.get('/tokenize', (req,res,next)=>{
    const myId = req.body["hostId"]
    const token = jwt.sign({docId: myId}, JWT_KEY, {expiresIn: 60 * 60 * 24 * 1000})
    //const token = jwt.sign({docId: req.user.docId}, JWT_KEY, {expiresIn: 60 * 60 * 24 * 1000})
    
    res.send(token)

  });
  