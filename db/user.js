const firestore = require('./firebase.js')

//find or create User inn firebase

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

// async function findById(oAuthData){
//     try{

//     }
// }

module.exports = {findOrCreate, findById}

//find by id