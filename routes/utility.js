const express = require('express');
const {db,admin} = require('../db/firebase.js')
const router = express();
//const {findOrCreate, users, } = require("../db/userService.js")
const userService = require("../db/userService.js")
const planService = require("../db/planService.js")





async function deleteSubCollection(collectionRef) {
    var collectionSnap = await collectionRef.get()
    if (collectionSnap.empty){
        console.log("is empty")
        return
    }
   await Promise.all(collectionSnap.docs.map(doc => doc.ref.delete()))
   //await Promise.all(collectionSnap.docs.map(doc => console.log(doc)))
}
async function deletePlanDoc(docRef) {
    const collections = await docRef.listCollections()
    if (collections.length > 0) {
        await Promise.all(collections.map(collection => deleteSubCollection(collection)))
    }
    
    var deletedDoc = await docRef.delete()
    return deletedDoc

}
exports.deleteDMs = async(request,response) => {
	db.collection("direct-messages").listDocuments().then(documentRefs => {
		
		return db.getAll(...documentRefs);
	 }).then(async documentSnapshots => {
		for (let documentSnapshot of documentSnapshots) {
			 console.log(`Found missing document: ${documentSnapshot.id}`);
			 await deletePlanDoc(documentSnapshot.ref)
		   
		}
	 });
	return response.status(200).json("beh")


}

exports.deleteGuestUsers = async(request,response) => {
	db.collection("bubbl-users").listDocuments().then(documentRefs => {
		
		return db.getAll(...documentRefs);
	 }).then(async documentSnapshots => {
		for (let documentSnapshot of documentSnapshots) {
		   if (documentSnapshot.exists) {
			 console.log(`Found document with data: ${documentSnapshot.id}`);
		   } else {
			 console.log(`Found missing document: ${documentSnapshot.id}`);
			 await deletePlanDoc(documentSnapshot.ref)
		   }
		}
	 });
	return response.status(200).json("beh")

}

exports.changeProfile = async(request,response) => {
    db.collection("bubbl-users").get().then(async querySnap => {
        if(!querySnap.empty) {
            await querySnap.forEach(async (doc)=> {
                // if (doc.id != userId) {
                //     console.log("updating")
                //     doc.ref.update({"seen": false})
                // }
                var currId = doc.id
                var info = doc.data()

                if (info["profilePicture"] != null) {
                    //console.log(info["profile-picture"])
                    doc.ref.update({
                        "profile-picture": info["profilePicture"]
                    })
                }

                // var currUser = await admin.auth().getUser(currId).then((userRecord)=> {
                //     console.log(`${userRecord.uid} phone: ${userRecord.phoneNumber}`)
                //     doc.ref.update({"phone": userRecord.phoneNumber})
                // }).catch(error => {
                //     console.log(`error for ${currId}`)
                // })

                
            })

        }
    })
    return response.status(200).json("beh")
}


exports.addPhones = async(request,response) => {
    db.collection("bubbl-users").get().then(async querySnap => {
        if(!querySnap.empty) {
            await querySnap.forEach(async (doc)=> {
                // if (doc.id != userId) {
                //     console.log("updating")
                //     doc.ref.update({"seen": false})
                // }
                var currId = doc.id
                var currUser = await admin.auth().getUser(currId).then((userRecord)=> {
                    console.log(`${userRecord.uid} phone: ${userRecord.phoneNumber}`)
                    doc.ref.update({"phone": userRecord.phoneNumber})
                }).catch(error => {
                    console.log(`error for ${currId}`)
                })

                
            })

        }
    })
    return response.status(200).json("beh")
}