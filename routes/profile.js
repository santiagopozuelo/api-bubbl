// api/routes/profile.js
const express = require('express');
const userService = require('../db/user')
const jwt = require('jsonwebtoken');
const JWT_KEY = "something_private_and_long_enough_to_secure"

const router = express()

router.use((req, res, next) => {
    const token = req.headers['authorization'];

    //data saved in token
    jwt.verify(token, JWT_KEY, function (err, data) {
        if (err) {
            res.status(401).send({ error: "NotAuthorized" })
        } else {
            req.user = data;
            next();
        }
    })
})


//create routes to do different actions
//get user plans



router.get('/', async (req, res) => {
    //res.status(500).send({ error: "NotAuthorized" })
    try{
        user = await userService.findById(req.user.docId)

        res.send(JSON.stringify(user));

    }
    catch(e){
        console.log(e)
    }
    
})

module.exports = router;