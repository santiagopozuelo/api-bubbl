const {db}= require('./firebase.js')

const userService = require("./userService.js")
const PlansTable = process.env.PLANS_TABLE
const UsersTable = process.env.USERS_TABLE
const PlansPeople = process.env.PLANS_PEOPLE

const planService = require("./planService.js")


//setUserStatus


async function updatePlanMessage(planId, message) {
    var info = {updatedAt: Date(), lastMessage: message}
    var planRef = await db.collection(PlansTable).doc(planId)
    var result = await planRef.update(info)

    if (result) {
        return true
    } else {
        return false
    }
}

async function updateViewersMessage(userIds, planId, message) {
    //update updatedAt, lastMessage for usersId
    //var planRef  = db.collection(PlansTable).doc(planId)
    try {
        var info = {updatedAt: Date(), lastMessage: message}
        var userCollection = await db.collection(UsersTable)
        for (userId of userIds) {
            var planRef = await userCollection.doc(userId).collection(PlansTable).doc(planId)
            var response = await planRef.update(info)
        }
        return true
    } catch(error) {
        console.log(error)
        //throw error
        return false
    }
    
}

async function updatePlan(userId,planId, lastMessage) {
    console.log("updating plan with lastmesss")
    var planRef =  await db.collection(PlansTable).doc(planId)

    var update = await planRef.update({updatedAt: new Date(), lastMessage: lastMessage})
    console.log(update)

    planRef.collection("seen").get().then(querySnap=>{
        if(!querySnap.empty) {
            querySnap.forEach((doc)=> {
                if (doc.id != userId) {
                    console.log("updating")
                    doc.ref.update({"seen": false})
                }
            })

        }
    })
    return update
}


async function changeStatus(userId,planId,newStatus) {

    var userInfo = await userService.getUserById(userId)
    

    var currentStatus = await getPlanStatus(userId,planId)
    if (currentStatus == newStatus) {
        console.log(planId)
        console.log("same status")
        return false
    } else {
        console.log("different status")
        
        var change = await setStatus(userId, userInfo, planId,newStatus)

        if (change == true) {
            console.log("changed status")
            //create update
            var updateMessage 
            if (newStatus == "going") {
                var username = await userService.getUsernameById(userId)
                console.log(`username changing ${username}`)

                updateMessage = await updatePlan(userId,planId,`${username} joined the plan`)

            } else if (newStatus == "invited") {
                console.log("invited")
                setUnseen(userId,planId)

            } else if (newStatus == "host"){
                console.log("host")
                setSeen(userId,planId)

            }
 
            return true
            //update messages
        } else {
            return false
        }
        

        //if going
            //updateLastMessagePlan
            //updateLastMessage plans -> users - >
    }
}

async function setStatus(userId,userInfo ,planId, status) {
   // if status is going, interested, hidden
   var userRef = await db.collection(UsersTable).doc(userId)
   var planRef =  await db.collection(PlansTable).doc(planId)

   //update message
   var info = {updatedAt: new Date(), status: status, id: userId}
   if (userInfo["profile-picture"] !=null) {
       info["profile-picture"] = userInfo["profile-picture"]

   }
   if (userInfo["name"] !=null) {
    info["name"] = userInfo["name"]

}   
  
   
   var subPlan = await userRef.collection(PlansTable).doc(planId).set(info,{merge:true})

   var subUser = await planRef.collection(UsersTable).doc(userId).set(info, {merge:true})
   return true
   
}

async function getPlanStatus(userId, planId) {
    console.log("plan Status")
    const userRef = await db.collection(UsersTable).doc(userId)
    var status = await userRef.collection(PlansTable).doc(planId).get().then(snap=>{
        if (snap.exists && snap.data() != null) {
            return snap.data()["status"]
        } else {
            return "uninvited"
        }

    })
    return status
}

async function getPlansGoing(userId) {
    const userRef = await db.collection(UsersTable).doc(userId)
    var plans = []
    var expireTime = Date()
    var info = await userRef.collection(PlansTable).where("status","==","going")
    .where("createdAt",">=", expireTime).get().then(docs => {
        console.log("yy")
        docs.forEach(doc=> {
            plans.push(doc.id)
        })
        
    })
    console.log(plans)
    return plans
}

async function getPlansHosting(userId) {
    const userRef = await db.collection(UsersTable).doc(userId)
    var plans = []
    var expireTime = Date()
    var info = await userRef.collection(PlansTable).where("status","==","host").get().then(docs => {
        docs.forEach(doc=> {
            plans.push(doc.id)
        })
        
    })
    console.log(plans)
    return plans
}

async function getPlansWithStatus(userId) {
    const userRef = await db.collection(UsersTable).doc(userId)
    var plans = []
    var expireTime = Date()
    await userRef.collection(PlansTable).get().then(docs => {
        docs.forEach(doc=> {
            plans.push([doc.data(),status])
        })
        
    })
    console.log(plans)
    return plans
}

async function getCalendarPlans(userId) {
    const userRef = await db.collection(UsersTable).doc(userId)
    var plans = []
    var expireTime = Date()
    await userRef.collection(PlansTable).get().then(async snapshot => {
        await snapshot.docs.forEach((doc)=>{
            if (doc.data() != null && doc.data()['status'] != "hidden" && doc.data()['status'] != "invited") {
                plans.push({id: doc.id, status: doc.data()["status"]})
                //plans.push([doc.id, doc.data().status])
            }
            
        })
    })
    console.log(plans)
    return plans

    var plans = 


    // await userRef.collection(PlansTable).where("createdAt",">=", expireTime).orderBy("c").get().then(docs => {
    //     docs.forEach(doc=> {
    //         plans.push([doc.data(),status])
    //     })
        
    // })
    console.log(plans)
    return plans
}

async function setUserDown(planId,userId) {
    const response = await changeStatus(planId,userId,"down")
    return response
}
async function setUserMaybe(planId,userId) {
    const response = await changeStatus(planId,userId,"maybe")
    return response
}






async function setUnseen(userId,planId) {
    var repUnseen = await db.collection(PlansTable).doc(planId).collection("seen").doc(userId).set({seen: false})
    return repUnseen
}
async function setSeen(userId,planId) {
    var repSeen = await db.collection(PlansTable).doc(planId).collection("seen").doc(userId).set({seen: true})
    return repSeen
}

async function setUserHost(planId, userId) {

    const response = await changeStatus(userId, planId, "host")
    return response
    

}

async function tagPlanPeople(userId, planId, peopleList) {
    //loop over each user
    console.log("tagging people")
    var newPlanStatus = {status: "invited", addedBy: userId}
    var peopleOut=[]
    for (person of peopleList) {
        var myStatus = await getPlanStatus(person, planId)
        if (myStatus == "uninvited") {
            console.log(person)
            peopleOut.push(person)
        }
    }
    console.log(`people out: ${peopleOut}`)

    const peopleRef = db.collection(UsersTable)
    const planDoc = db.collection(PlansTable).doc(planId)
    const subPeopleRef = planDoc.collection(UsersTable)
    for (person of peopleOut) {
        console.log("inside loop")
        console.log(person)
        var response = await peopleRef.doc(person).collection(PlansTable).doc(planId).set({status:"invited",  invitedBy: userId, updatedAt: new Date()})
        var response2 = await subPeopleRef.doc(person).set({status:"invited",  invitedBy: userId, updatedAt: new Date()})
        setUnseen(person,planId)
        console.log(response)
        console.log(response2)
    }
    return peopleOut

}

module.exports = { setUserHost,setUserDown,setUserMaybe,tagPlanPeople,changeStatus ,getPlanStatus, getPlansGoing, getPlansHosting, getPlansWithStatus, getCalendarPlans}




