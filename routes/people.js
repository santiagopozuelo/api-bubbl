const express = require('express');
const {db} = require('../db/firebase.js')
const router = express();
const planService = require("../db/planService")
const peopleService = require("../db/peopleService")


//send friend request
//accept friend request
//getFriends
//get pending friend requests.
    //where status = pending and sentByMe = false
//remove Friend

//set changes for both users.
//send notification

exports.acceptFriendRequest = async (req,res) => {
    
}

exports.addFriend = async (req, res) => {
    try {

        //body:
            //senderId
            //reciver ID
            //receiver name
            //sender Name
        var sender = req.body.sender
        var receiver = req.body.receiver
        var receiverUsername = req.body.receiverUsername
        var senderUsername = req.body.senderUsername
        
        console.log(req.body)

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
