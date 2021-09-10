const { query } = require('express')
const {db, admin}= require('./firebase.js')
const userService = require("./userService.js")
const planService = require("./planService.js")


const PlansTable = process.env.PLANS_TABLE
const UsersTable = process.env.USERS_TABLE
const PlansPeople = process.env.PLANS_PEOPLE
const FriendsTable = process.env.FRIENDS_TABLE

async function sendInvites(senderId,planId, people) {
    console.log(planId)
    console.log(planId)

    var myPlan = await planService.getPlanById(planId)
    console.log(`people for send: ${people}`)

    var fcmList = []
    for (userId of people) {
        if (userId != senderId) {
            var currUser = await userService.getUserById(userId)
            var token
            if (currUser != null && currUser["fcmToken"]!= null) {
                console.log(currUser["fcmToken"])
                fcmList.push(currUser["fcmToken"])
            }

        }
    }
    console.log(`list of fcms: ${fcmList}`)
    console.log(`plan title is: ${myPlan["title"]}`)
    if (fcmList.length > 0) {
        const message = {
            data: {info: 'plan-invite'}, 
            notification: {
                title: `you were tagged to plan ${myPlan["title"]}`,
                body: "click to view the plan"
            },
            tokens: fcmList
            
        }
        admin.messaging().sendMulticast(message).then((response)=> {
            console.log("after send")
            console.log(response.successCount)
        })
    
        return true

    }
 
}


module.exports = { sendInvites}