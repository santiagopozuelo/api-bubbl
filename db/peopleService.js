const {db}= require('./firebase.js')


const PlansTable = process.env.PLANS_TABLE
const UsersTable = process.env.USERS_TABLE
const PlansPeople = process.env.PLANS_PEOPLE
const FriendsTable = process.env.FRIENDS_TABLE

async function getUserFriends(userId) {
    var results = []
    var friendsRef = db.collection(FriendsTable).doc(userId)
    friendsRef.collection("friends-sub").get().then(querySnapshot =>{
            console.log("printing users friends")
            if (querySnapshot.empty) {
                console.log("no friendss")
                results = []
                return
            }
            querySnapshot.forEach(doc =>{
                
                if (doc.exists && doc.data() != null) {
                    var friendInfo = doc.data()
                    if (info["status"] == accepted) {
                        results.push()
                    }
                } 
            })


        })
}

async function deleteFriend(userId, otherId) {
    console.log(`deleteing friend ${otherId} from ${userId}`)
    var userRef = db.collection(FriendsTable).doc(userId).collection("friends-sub").doc(otherId).delete()
    var otherUserRef = db.collection(FriendsTable).doc(otherId).collection("friends-sub").doc(userId).delete()
    console.log("friend deleted")
    return true

    //check for error


}

async function getFriendStatus(userId, otherId) {
    console.log("getting status")
    var friendsRef = db.collection(FriendsTable).doc(userId)

    var info = await friendsRef.collection("friends-sub").doc(otherId).get().then(snapshot=> {
        if (snapshot.exists && snapshot.data()!=null) {
            var info = snapshot.data()            
            var status = info["status"]
            console.log(status)
            return status
        }
        else {
            return null
        }

    })
    console.log(`response is ${info}`)
    return info


}

async function sendRequest(sender,senderUsername,receiver,receiverUsername) {
    //check if following already
    var senderRef = db.collection(FriendsTable).doc(sender)
    var receiverRef = db.collection(FriendsTable).doc(receiver)

    //get relationship
    //if not friends send request
    console.log("sending request")
    var friendStatus = await senderRef.collection("friends-sub").doc(receiver).get().then(friendDoc=> {
        if (friendDoc.exists && friendDoc.data() != null) {
            var status = friendDoc.data()["status"]
            console.log(friendDoc)
            console.log(status)
            return status

        } else {
            console.log(`no doc for friend ${receiver}`)
            return null

        }
        var result = friendDoc.data()
    })

    if (!friendStatus || (friendStatus != "accepted" && friendStatus != "pending")) {
        //add friend request with pending
        

        var dataFriend = {
            id: receiver,
	        username: receiverUsername,
	        status: "pending",
	        sentByMe: true
        }
        console.log(dataFriend)


        var senderResult = await senderRef.collection("friends-sub").doc(receiver).set(dataFriend)
        console.log(senderResult)
        console.log("after sender create")

        var dataFriend2 = {
            id: sender,
	        username: senderUsername,
	        status: "pending",
	        sentByMe: false

        }
        var senderResult2 = await receiverRef.collection("friends-sub").doc(sender).set(dataFriend2)
        console.log(senderResult2)

        return true

    } else {
        return false
    }

}

async function acceptFriendRequest() {

}


async function getUserFriends(userId) {
    var friendsRef = db.collection(FriendsTable).doc(userId)
    var people =[]

    var friends = await friendsRef.collection("friends-sub")
        .where("status","==","accepted").get().then(querySnapshot=>{
            querySnapshot.forEach(doc =>{
                var info = doc.data()
                people.push({userId:info["id"], username: info["username"]})
                //people.push(info["id"])
                return doc.data()

            })
        }) 
    console.log(people)
    return people
        
}
    
    


async function getFriendRequests(userId) {
    var friendsRef = db.collection(FriendsTable).doc(userId)
    var people =[]

    var friends = await friendsRef.collection("friends-sub")
        .where("status","==","pending").get().then(querySnapshot=>{
            querySnapshot.forEach(doc =>{
                var info = doc.data()
                console.log("friend data")
                console.log(info)
                //check if sent by them
                if (!doc.data()["sentByMe"]) {

                    people.push({userId:info["id"], username: info["username"]})
                    return doc.data()
                }
                
            })
        }) 
        console.log(people)
    return people

}

//add accept friend request
async function acceptRequest(userId,otherId) {
    var friendsRef = await db.collection(FriendsTable).doc(userId)
    var otherRef = await friendsRef.collection("friends-sub").doc(otherId)
    var result = await otherRef.get().then(async snapshot=> {
        if (snapshot.exists && snapshot.data()!= null) {
            var status = snapshot.data()["status"]
            var sender = snapshot.data()["sentByMe"]
            if (status == "pending" && sender == false ) {
                await otherRef.update({
                    "status": "accepted"
                })
                await db.collection(FriendsTable).doc(otherId).collection("friends-sub")
                    .doc(userId).update({"status": "accepted"})
                return true
                console.log("succesfully updated to acceepted")
                

            }
        }
        return false
    })

    if (result) {
        console.log("result true")
        return true
    } else {
        console.log("result false")
        return false
    }

}


module.exports = { sendRequest, getFriendRequests, getUserFriends, getFriendStatus, acceptRequest, deleteFriend}