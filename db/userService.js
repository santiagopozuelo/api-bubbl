const { response } = require('express')
const {db }= require('./firebase.js')
const planService = require("./planService.js")


const PlansTable = process.env.PLANS_TABLE
const UsersTable = process.env.USERS_TABLE

//find or create User inn firebase

async function getUserById(userId) {
    const userRef = await db.collection(UsersTable).doc(userId)
    var content ={}
    var info = await userRef.get().then((userInfo)=> {
        content = userInfo.data()

    })
    console.log("info getting user")
    console.log(content)
    return content

}

async function createUser(userInfo) {
    console.log("adding user")
    const resp = await db
      .collection(UsersTable)
      .doc(userInfo.uid)
      .set({ ...userInfo }, { merge: true })
      
      ;
    return resp;

}


async function getPlansGoingHosting(userId) {

    try {
    const userRef = await db.collection(UsersTable).doc(userId).get()
    console.log("shesh")
    //console.log(userRef)
    const plansSubref = await userRef.ref.collection(PlansTable)
    //console.log(plansSubref)

    //get User Going and hosting planIds,
    //order plans and get actual info

    var finalPlans = []
    await plansSubref.get().then(querySnapshot=>{
        querySnapshot.forEach((snapshot) =>{
            console.log(snapshot.data())
            if (snapshot.data() != null) {
                //finalPlans.push([snapshot.id, snapshot.data().status])
                finalPlans.push(snapshot.id)
            }
        })
    })
    console.log(finalPlans)

    var completePlans = []
    for (var i = 0; i< finalPlans.length;i++) {
        var data = await planService.getPlanById(finalPlans[i])
        console.log("data in loop")
        console.log(data)
        completePlans.push(data)
    }
    completePlans.sort(function(a, b) {
        return new Date(a.createdAt) - new Date(b.createdAt) ;
      });

    ///const results = await Promise.all(completePlans);
    console.log("after")
    console.log(completePlans)
    return completePlans
    
    // for (var i = 0;i< finalPlans.length;i++){
    //     completePlans.push(new Promise((resolve,reject)=>{
    //         planService.getPlanById(finalPlans[i]).then((info)=>{
    //             if (info != null) {
    //                 console.log("info resolving")
    //                 resolve(info)
    //             }
    //         })
            
    //     }))
    // }

    // var result = await finalPlans.forEach(async (planId)  =>{
    //     console.log(planId)
    //     var info = await planService.getPlanById(planId)
    //     completePlans.push(info)

    // })
    //console.log(completePlans)
    // for (var i; i< finalPlans.length;i++) {
    //     console.log("yuh")
    //     console.log(finalPlans)
    //     var info = finalPlans[i]
    //     console.log(info)
    //     var info = await planService.getPlanById(value)
    //     completePlans.push(info)
    // }
    //iterate and get plan from Id
    //return answers
    console.log("end")
    console.log(completePlans)
    return completePlans

    } catch (err) {
        console.log(err)
        return err
    }
    
}

// async function getMyPlans(userId){
//     const userRef = await db.collection(UsersTable).doc(userId)
//     //[[planid, status]]
//     var plans = []
//     var info = await userRef.collection(PlansTable).get().then(snap=>{
//         for (doc in snap) {
            
//             plans.push([doc.id, doc.get().data()["status"]])
//         }

//     })
//     console.log(plans)

// }

async function getListPlansGoing(userId) {
    const userRef = await db.collection(UsersTable).doc(userId)
    var plans = []
    var info = await userRef.collection(PlansTable).where("status","==","going")
    .where("createdAt",">=", new Date()).get().then(docs => {
        console.log("yy")
        docs.forEach(doc=> {
            plans.push(doc.id)

            //plans.push(doc.data().uid)
        })
        
        //plans.push(doc.data().uid)
    })
    console.log(plans)
    return plans

}

async function getListPlansHosting(userId) {
    const userRef = await db.collection(UsersTable).doc(userId)
    var plans = []
    var info = await userRef.collection(PlansTable).where("status","==","host").get().then(docs=> {
        docs.forEach(doc=> {
            plans.push(doc.data().uid)
        })
        
    })
    console.log(plans)
    return plans

}

async function findOrCreateUser(data){
    try{
        const users = await firestore.collection("usersPrueba")
        const current = await users.where("username","==",data).get()
        if (!current.empty){
            return current.docs[0].id
        } else {
            const myDoc = await users.add({username: data})
            return myDoc.id
        }

    }
    catch(e){
        console.log(e)
    }
}

async function findOrCreate(oAuthData) {
    try {
        //const users = await firestore.collection("usersPrueba")

        const users = await firestore.collection("usersPrueba")

        const current = await users.where("snapId","==",oAuthData.id).get()

        if (!current.empty){
            return current.docs[0].id
        } else {
            const myDoc = await users.add({snapId : oAuthData.id, name: oAuthData.displayName, bitmoji: oAuthData.bitmoji})
            return myDoc.id

        }

    } 
    catch (error){
        console.log(error)
        return Error('User not found');

    }
}

async function findById(oAuthData){
    try {
        const myUsers = await firestore.collection("usersPrueba")
        //console.log(users.doc(oAuthData).get())

        // const current = await myUsers.doc(oAuthData).get()
        // console.log(current)
        // console.log(current.getData())
        const yeet = await firestore.collection("usersPrueba").doc(oAuthData).get()
        console.log(yeet)
        var content = {}


        const myPerson = await firestore.collection("usersPrueba").doc(oAuthData).get().then((result)=>{

            content = result.data()
        })
        return content

        // if (!current.empty){
        //     return current.getData()
        // } 
        // return null

        // const current = await myUsers.doc(oAuthData).get().then(snapshot=>{
        //     if (snapshot.empty){
        //         console.log("no match")
        //     }
        //     return snapshot.data()
        // })
        // console.log(current)

        //return current;
    } catch (err){
        console.log(err)
    }
    

}
//also get status
async function getPlans(oAuthData){
    const planRef = await firestore.collection("plans")
    const finalPlans=[]

    const myPlansRef = await planRef.where('members','array-contains', oAuthData).get().then((querySnap)=>{
        querySnap.forEach(doc=>{
            //const data = doc.data()
            
            if(doc.data()){
                var status= ""

                // var document = doc.ref.collection("people").doc(oAuthData).get().then(res=>{
                //     console.log(res)
                //     status = res.data().status
                // })
                //.data().status
                var data = {
                    id: doc.id,
                    title: doc.data().title,
                    emoji: doc.data().emoji,
                    date: doc.data().date,
                    // status: status
                  }
                  finalPlans.push(data)
                
            }
        })
    })
    const plansHosting = await planRef.where("host","==",oAuthData).get();
    plansHosting.forEach(doc=>{
        var info = {
            id: doc.id,
            title: doc.data().title,
            emoji: doc.data().emoji,
            date: doc.data().date,
            isHosting: true
        }
        finalPlans.push(info)

    })
    

   


    return finalPlans

    
}

async function createPlan(planData){

    const plan = await db.collection("beta-plans").add(planData)
    console.log("plan")
    console.log(plan)
    return plan


} 

// async function getPlans(oAuthData){
//     //oauth is id
//     //const myUsers = await firestore.collection("usersPrueba")
//     content = {}
//     plans=[]


//     const thePlans = await firestore.collection("usersPrueba").doc(oAuthData).get().then(result=>{
//         plans = result.data().plans
//         console.log(plans)
//     })
//     var fullPlans = []

//     const fully = await firestore.collection("plans").get().then(result =>{

//         result.forEach(doc=>{
//             console.log(doc.id.toString())
//             if (doc.id.toString() in plans) {
//                 console.log(doc.id)
//                 console.log(doc.data())
//                 fullPlans.push({
//                     id: doc.id,
//                     title: doc.data().title,
//                     emoji: doc.data().emoji,
//                     date: doc.data().date,
//                 })
//             }

            


//         })


//     })

//     // for (planId in plans)

//     // for (planId in plans){
//     //     (await firestore.collection("plans").doc(planId).get().then(myDoc=>{
//     //         fullPlans.push({
//     //             id: myDoc.id,
//     //             title: myDoc.data().title,
//     //             emoji: myDoc.data().emoji,
//     //             date: myDoc.data().date,
//     //         })
//     //     })
//     //     )

//     // }

    

//     // const userPlans = await thePlans.get().then((snapshot)=>{
//     //     snapshot.forEach(async doc=>{
            
//     //         const myPlans = await doc.ref.collection("people").doc(oAuthData).get().then(result=>{
//     //             if (result.exists) {
//     //                 plans.push({
//     //                     id: result.id,
//     //                     title: result.data().title,
//     //                     emoji: result.data().emoji,
//     //                     date: result.data().date,
//     //                 })

//     //             }

//     //         })
            
//     //         console.log(myPlans)
//     //         //console.log(userDoc.exists)
            
//     //     })
//     // })
//     content["plans"] = fullPlans
//     return content
        
    

// }

// async function findById(oAuthData){
//     try{

//     }
// }

//ADD
//getMyPlans, 
module.exports = { createUser, getPlansGoingHosting,findOrCreate, findById,findOrCreateUser, getPlans, createPlan, getUserById,getListPlansHosting,getListPlansGoing}

//find by id