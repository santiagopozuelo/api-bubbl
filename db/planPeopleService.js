const {db, admin}= require('./firebase.js')

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

async function deletePlanDoc(docRef) {
    const collections = await docRef.listCollections()
    if (collections.length > 0) {
        await Promise.all(collections.map(collection => deleteSubCollection(collection)))
    }
    
    var deletedDoc = await docRef.delete()
    return deletedDoc

}

async function deleteSubCollection(collectionRef) {
    var collectionSnap = await collectionRef.get()
    if (collectionSnap.empty){
        console.log("is empty")
        return
    }
    await Promise.all(collectionSnap.docs.map(doc => doc.ref.delete()))
}

async function deleteSubPlan(userTable, userId, planId) {
    var userRef = userTable.doc(userId)
    var userDeleted = await userRef.collection(PlansTable).doc(planId).delete()
    return userDeleted
}

async function deletePlanById(planId) {
    var userCollection = db.collection(UsersTable)

    var planRef = db.collection(PlansTable).doc(planId)
    var planPeople
    await planRef.get().then(snap => {
        if(snap.exists && snap.data() != null) {
            var info = snap.data()
            planPeople = info["people"]
        }
    })
    var deletedPlan = await deletePlanDoc(planRef)

    if (planPeople != null && planPeople.length > 0) {
        for (userId of planPeople) {
            var deletedSubPlan = await deleteSubPlan(userCollection,userId,planId)
        }

    }
    
    return true

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
                    //console.log("updating")
                    doc.ref.update({"seen": false})
                }
            })

        }
    })
    return update
}

async function setUndecided(userId,planId) {
    var userRef = await db.collection(UsersTable).doc(userId)
    var planRef =  await db.collection(PlansTable).doc(planId)
    
    await userRef.collection(PlansTable).doc(planId).delete()
    await planRef.collection(UsersTable).doc(userId).delete()
    console.log("after set undecided")
    return true

}

async function setHide(userId,planId) {
    var userRef = await db.collection(UsersTable).doc(userId)
    var planRef =  await db.collection(PlansTable).doc(planId)
    
    userRef.collection(PlansTable).doc(planId).delete()
    planRef.collection(UsersTable).doc(userId).delete()
    if (planRef != null) {
        await planRef.update({
            people: admin.firestore.FieldValue.arrayRemove(userId)
        })
    }

    return true

}


async function changeStatus(userId,planId,newStatus) {

    var userInfo = await userService.getUserById(userId)
    

    var currentStatus = await getPlanStatus(userId,planId)
    console.log(`old status : ${currentStatus}`)
    console.log(`new status : ${newStatus}`)
    if (currentStatus == newStatus) {
        console.log(planId)
        console.log("same status")
        return false
    } else {
        console.log("different status")
        
        //if newStatus == invited,going, host
        var change
        if (newStatus == "undecided") {
            change = await setUndecided(userId, planId)

        } else if (newStatus == "hide"){
            change = await setHide(userId, planId)
        }
        else {
            change = await setStatus(userId, userInfo, planId, currentStatus, newStatus)
        }
        

        if (change == true) {
            console.log("changed status")
            //create update
            var updateMessage 
            //new status == hide
            if (newStatus == "going") {
                var username = await userService.getUsernameById(userId)
                console.log(`username changing ${username}`)

                updateMessage = await updatePlan(userId,planId,`${username} is going`)

            } else if (newStatus == "interested") {
                var username = await userService.getUsernameById(userId)
                console.log(`username changing ${username}`)

                updateMessage = await updatePlan(userId,planId,`${username} is interested`)

            
            }else if (newStatus == "hide") {
                //remove plan from person 
                //remove user from subcollection of plan
                //remove user from array of plan

            } else if (newStatus == "undecided") {
                //remove user from subcollection of plan
                //remove plan from subcolleciton of user

            }
            else if (newStatus == "invited") {
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

async function setStatus(userId,userInfo ,planId, oldStatus,newStatus) {
   // if status is going, interested, hidden
   var userRef = await db.collection(UsersTable).doc(userId)
   var planRef =  await db.collection(PlansTable).doc(planId)

   //update message
   var info = {updatedAt: new Date(), status: newStatus, id: userId}
   if (userInfo["profilePicture"] !=null) {
       info["profilePicture"] = userInfo["profilePicture"]

   }
   if (userInfo["name"] !=null) {
    info["name"] = userInfo["name"]
    }   

    if (oldStatus == "uninvited") {
        console.log("user was uninvited")
        await planRef.update({
            people: admin.firestore.FieldValue.arrayUnion(userId)
        })

    }
  
   
   var subPlan = await userRef.collection(PlansTable).doc(planId).set(info,{merge:true})

   var subUser = await planRef.collection(UsersTable).doc(userId).set(info, {merge:true})
   return true
   
}

async function getPlanStatus(userId, planId) {
    console.log("plan Status")
    const userRef = await db.collection(UsersTable).doc(userId)
    const planRef = await db.collection(PlansTable).doc(planId)
    var status = await userRef.collection(PlansTable).doc(planId).get().then(async snap=>{
        if (snap.exists && snap.data() != null) {
            return snap.data()["status"]
        } else {
            //return null
            console.log("nostatus")
            var otherStatus = await planRef.get().then(snapshot => {
                if (snapshot.exists && snapshot.data() != null) {
                    var people = snapshot.data()["people"]
                    if (people.includes(userId)) {
                        console.log("person invited")
                        return "invited"
                    } else {
                        console.log("uninvited")
                        return "uninvited"
                    }
                }
            })
            return otherStatus
            
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
    var repSeen = await db.collection(PlansTable).doc(planId).collection("seen").doc(userId).set({seen: true,lastSeen: new Date()})
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

async function setInterested(planId, interestedList) {
    //loop over each user
    console.log("setting people interested") 

    const peopleRef = db.collection(UsersTable)
    const planDoc = db.collection(PlansTable).doc(planId)
    const subPeopleRef = planDoc.collection(UsersTable)
    var newUsers = []
    for (person of interestedList) {
        var doc = await peopleRef.doc(person).get()
        var personInfo = doc.data()
        var planStatus = {
            "id": planId,
            "name": personInfo["name"],
            "profilePictre": personInfo["profilePicture"],
            "status": "interested",
            "updatedAt": new Date()

        }
        newUsers.push(planStatus)
        var response2 = await subPeopleRef.doc(person).set(planStatus)

    }
    console.log(newUsers)
    return true

    

}

module.exports = { setInterested, deletePlanById, setUserHost,setUserDown,setUserMaybe,tagPlanPeople,changeStatus ,getPlanStatus, getPlansGoing, getPlansHosting, getPlansWithStatus, getCalendarPlans}




