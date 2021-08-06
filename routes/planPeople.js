const express = require('express');
const {db} = require('../db/firebase.js')
const router = express();
const planService = require("../db/planService")
const peopleService = require("../db/peopleService")
const userService = require("../db/userService")
const planPeopleService = require("../db/planPeopleService")

//add user to plan (invite)

exports.addPlanPeople = async (req, res) => {
    var userId = req.body.userId
    var planId = req.body.planId
    var peopleList = req.body.peopleList

    var myUser = await planPeopleService.getUserById(userId)
    if (myUser = null) {
        return res.status(500).json({response: "error no userId exists"})
    }

    var info = await planService.tagPlanPeople(userId,planId,peopleList)
    
    return res.status(200).json({response: info})

    //tagPlanPeople

    //check plan exists
    //addPlanPeople service
        //add plans to users status:invited, lead: personId, updatedAt
    //check plan exists
    //

}

exports.getProfilePlans= async(req,res) => {

    try {
        var userId = req.params.userId
    console.log(userId)

    //get going
    var info = await planPeopleService.getCalendarPlans(userId)

    return res.status(200).json({response: info})

    } catch (error){
        console.log(`error: ${error}`)
        return res.status(500).json({error})

    }

    
    
}

exports.editPeopleStatus = async(req, res) => {
    console.log("enter route")
    var userId = req.body.userId
    var planId = req.body.planId
    var newStatus = req.body.status
    console.log("changing status route")

    //check userExits

    var results = await planPeopleService.changeStatus(userId, planId, newStatus)

    if (results == true) {
        return res.status(200).json({success: results})

    } else {
        return res.status(500).json({success: results})
    }
    //getcurrent status
        //check different than new
            //if new edit status
    
    //send updates

}








//setPersonStatus()down,interested,hide


//setUserStatus
exports.modifyPlanStatus = async (req,res)=> {
    var planId = req.body.planId
    var userId = req.body.userId
    var newStatus = req.body.status
    var info;
    if (newStatus == "down"){
        console.log("setting down")
        info = await planService.setUserDown(planId, userId)
    }else if (newStatus == "maybe"){
        console.log("setting maybe")
        info = await planService.setUserMaybe(planId, userId)
    } else if (newStatus == "host") {
        console.log("setting maybe")
        info = await planService.setUserHost(planId, userId)
    }

    if (info != null){
        console.log(`responding ${info}`)
        return res.status(200).json({response: info})
    }
    return res.status(500)
    

}