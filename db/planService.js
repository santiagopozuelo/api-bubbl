const {db}= require('./firebase.js')

//const userService = require("./userService.js")
//const planPeopleService = require("./planPeopleService.js")
const PlansTable = process.env.PLANS_TABLE
const UsersTable = process.env.USERS_TABLE
const PlansPeople = process.env.PLANS_PEOPLE
//const {changeStatus} = planPeopleService



async function createPlan(planData) {
//return planId

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
            console.log("in snap of plan by id")
            //format into plan struct
            console.log(info)
            return info
        } else {
            return null
        }
    })
    //return ans
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


module.exports = { getPlanById, createPlan, getListPlans}