const express = require('express');
const {db} = require('../db/firebase.js')
const router = express();
const planService = require("../db/planService")
const peopleService = require("../db/peopleService")
const userService = require("../db/userService")





//get pending friend requests.
    //where status = pending and sentByMe = false
//remove Friend

//set changes for both users.
//send notification

//return true if removed
//return false if could not remove
exports.removeFriend = async (req,res) => {
    var userId = req.body.userId
    var otherId = req.body.otherId

    var status = await peopleService.getFriendStatus(userId, otherId)
    var response
    if (status) {
        //remove
        //true or false
        var result = await peopleService.deleteFriend(userId,otherId)
        console.log(result)
        if (result == true) {
            response = true
        }
    }

    if (response) {
        return res.status(200).json({response: response})
    } else {
        return res.status(500).json({response: false})
    }
}


exports.getPersonRelationship = async(req,res) =>{
    var userId = req.body.userId
    var otherId = req.body.otherId
    var myInfo = await peopleService.getFriendStatus(userId,otherId)

    if (myInfo) {
        return res.status(200).json({status:myInfo})
    } else {
        return res.status(500).json({status: "not"})
    }

}

exports.acceptFriendRequest = async (req,res) => {
    //body
        //userId, otherUser
    var userId = req.body.userId
    var otherId = req.body.otherId

    var ans = await peopleService.acceptRequest(userId, otherId)
    //send notification or or update/notification 
    console.log(ans)

    if(ans == true) {
        return res.status(200).json({response: ans})
    } else {
        return res.status(500).json({response: ans})
    }
}

exports.addFriend = async (req, res) => {
    try {
        var sender = req.body.sender
        var receiver = req.body.receiver
        //get usernames
        var senderUsername = await userService.getUsernameById(sender)
        var receiverUsername = await userService.getUsernameById(receiver)
        console.log(senderUsername)
        console.log(receiverUsername)

        var ans = await peopleService.sendRequest(sender, senderUsername, receiver, receiverUsername)
        //send notification
        //set update or notification

        // var friendInfo = {
        //     id: receiver,
        //     username: receiverUsername,
        //     status: "pending",
        //     sentByMe: false
        // }
        console.log(ans)
        return res.status(200).json({response: ans})

      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
}

exports.getFriends= async (req,res)=> {
    var userId = req.body.userId
    console.log(`getting friends for: ${userId}`)
    var friends = await peopleService.getUserFriends(userId)

    if (friends) {
        return res.status(200).json({friends: friends})
    } else {
        return res.status(500).json({friends: []})
    }



}
