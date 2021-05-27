const firestore = require('./firebase.js')

//find or create User inn firebase

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

    const plan = await firestore.collection("plans").add(planData)
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

module.exports = {findOrCreate, findById,findOrCreateUser, getPlans, createPlan}

//find by id