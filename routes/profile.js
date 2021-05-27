// api/routes/profile.js
const express = require('express');
const userService = require('../db/user')
const jwt = require('jsonwebtoken');
const JWT_KEY = "something_private_and_long_enough_to_secure"

const router = express()

router.use((req, res, next) => {
    var token =""

    if (!req.headers["authorization"]){
        token = req.headers['token']
    } else{
        token = req.headers['authorization'];
    }
    
    
    
    //var token = req.headers['token'];
    
    //const {token} = req.headers
    //  if(!token){
    //      const {token} = req.headers;
    //  }

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
router.get('/trial', async (req, res) => {
    //res.status(500).send({ error: "NotAuthorized" })
    res.json({"sheesh":"lol"})
    
})



router.get('/', async (req, res) => {
    //res.status(500).send({ error: "NotAuthorized" })
    try{
        user = await userService.findById(req.user.docId)
        res.json({...user, uid: req.user.docId})

        //res.send(JSON.stringify(user));

    }
    catch(e){
        console.log(e)
    }
    
})

router.get('/plans', async (req, res) => {
    //res.status(500).send({ error: "NotAuthorized" })
    try{


        var plans = await userService.getPlans(req.user.docId)
        //res.json({...user, uid: req.user.docId})
        console.log(plans)
        res.json({plans:plans})

        //res.send(JSON.stringify(user));

    }
    catch(e){
        console.log(e)
    }
    
})

router.post('/plans', async (req,res)=> {
    try {
        //var info = JSON.parse(req.body)
        console.log(req.body)
        //console.log(info)
        var planId = await userService.createPlan(req.body)


        res.status(200).json({response: planId.id})
    }
    catch(e){
        console.log("error")
        console.log(e)
    }
})


module.exports = router;