const {db}= require('./firebase.js')


const PlansTable = process.env.PLANS_TABLE
const UsersTable = process.env.USERS_TABLE
const PlansPeople = process.env.PLANS_PEOPLE



async function createPlan(planData) {
    console.log(planData)
    const val = await db.collection(PlansTable).add(planData).then(plan=>{
        if (plan != null) {
            console.log(plan)
            return plan
        }

    })

    return val;
}

async function getPlanById(planId) {
    console.log(`plan id is: ${planId}`)
    var ans = await db.collection(PlansTable).doc(planId).get().then(snap=>{
        if (snap.data() != null) {
            var info = snap.data()
            //format into plan struct
            console.log(info)
            return info
        }
    })
    return ans
}

async function getPlanRef(planId) {
    try {
        const info = await db.collection(PlansTable).doc(planId).get()
        return info
    } catch (err) {
        console.log(err)
    }
}

async function getUserRef(userId) {
    try {
        const info = await db.collection(UsersTable).doc(userId).get()
        return info
    } catch (err) {
        console.log(err)
    }
}


async function changeStatus(planId, userId, status) {
    console.log("inside changestatus")
    const planRef = await getPlanRef(planId)
    const memberSubref = await planRef.ref.collection(UsersTable).doc(userId)
    const userRef = await getUserRef(userId)
    const planSubref = await userRef.ref.collection(PlansTable).doc(planId)

    const answer = await memberSubref.get().then(async snapshot=> {
        if (snapshot.data()!=null && snapshot.data()["status"] == status) {
            console.log("same status return false")
            return false
            //await memberSubref.set({status:"host"},{merge:true})
        } else {
            //maybe null, maybe other
            console.log("diff status")
            memberSubref.set({status: status},{merge: true})

            var res = await planSubref.get().then(snap=>{
                //if condition where status conflict
                    //return false
                planSubref.set({status: status},{merge:true})
                console.log("setting planSubRef")
                return true
                
            })
            return res
        }



    })
    console.log(`returning ${answer}`)
    
    return answer
    //if (snapsho)

}

async function setUserDown(planId,userId) {
    const response = await changeStatus(planId,userId,"down")
    return response
}
async function setUserMaybe(planId,userId) {
    const response = await changeStatus(planId,userId,"maybe")
    return response
}

async function setUserHost(planId, userId) {

    const response = await changeStatus(planId, userId, "host")
    return response
    // const planRef = await getPlanRef(planId)
    // const memberSubref = await planRef.ref.collection(UsersTable).doc(userId)


    // const userRef = await getUserRef(userId)
    // const planSubref = await userRef.ref.collection(PlansTable).doc(planId)
    //var changedStatus = 


    // const answer = memberSubref.get().then(async snapshot=> {

    //     if (snapshot.data() != null) {
    //         if (snapshot.data()["status"] != "host" ) {
    //             //change status in other ref
    //             memberSubref.set({status: "host"},{merge: true})
    //             console.log("setting member subref")
                
    //             var ans = await planSubref.get().then(snap=> {
    //                 if (snap.data() == null || snap.data()["status"]!= "host") {
    //                     planSubref.set({status: "host"},{merge:true})
    //                     console.log("setting planSubRef")
    //                     return true
    //                 }
    //                 return false
    //             })
    //         } else {
    //             return false
    //         }
            
    //     } else {
    //         await memberSubref.set({status:"host"},{merge:true})
    //         var ans = await planSubref.get().then(snap=> {
    //             if (snap.data() == null || snap.data()["status"]!= "host") {
    //                 planSubref.set({status: "host"},{merge:true})
    //                 console.log("setting planSubRef2")
    //                 return true
    //             } else {
    //                 return false
    //             }
    //         })
    //         return ans
            
    //         //change status in other ref
    //     }

    // })
    // return answer


    // const info = {
    //     userId: userId,
    //     planId: planRelation.id,
    //     status: "host",
    //     seen: "true"
    // }

    // var ans = await this.duplicateMembership(info)
    // console.log(info)
    // return ans
    

}

async function duplicateMembership(info) {
    const planRelationRef = await db.collection(PlansPeople).add(info)
    if (planRelationRef != null) {
        return planRelationRef

    }

}

async function getListPlans(listIds) {
    console.log("getting plan objs")
    //var info = await db.collection(plansTable).where()
    var content = []
    for (planId in listIds) {
        var plan = await db.collection(plansTable).doc(planId).get().then(doc =>{
            var planInfo = doc.data()
            content.push(planInfo)
        })
        
        //get specific
        
    }
    // listIds.forEach(async (planId )=> {
    //     var plan = await db.collection(plansTable).doc(planId).get()
    //     var planInfo = plan.data()
    //     //get specific
    //     content.push(planInfo)
    // })
    console.log(content)
    return content
}

// async function getPlanById(planId) {
//     db.collection(plansTable).doc(planId).get().then(doc=> {
//         if (doc.exists && doc.data()!= null) {
//             return doc.data()
//         }
//     })
// }

module.exports = {getPlanById, createPlan, getListPlans, setUserHost, setUserDown, setUserMaybe,setUserDown,changeStatus}