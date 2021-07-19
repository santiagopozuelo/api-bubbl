const {db}= require('./firebase.js')


const PlansTable = process.env.PLANS_TABLE
const UsersTable = process.env.USERS_TABLE
const PlansPeople = process.env.PLANS_PEOPLE
const FriendsTable = process.env.FRIENDS_TABLE


async function getFriendStatus(userId, otherUser) {
    var friendsRef = db.collection(FriendsTable).doc(userId)

    friendsRef.collection("friends-sub").doc(otherUser).get().then(snapshot=> {
        if (snapshot.exists && snapshot.data()!=null) {
            var info = snapshot.data()

            var status = info["status"]
            return status
        }
        else {
            return null
        }

    })


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

    if (!friendStatus || friendStatus != "accepted") {
        //add friend request with pending

        var dataFriend = {
            id: receiver,
	        username: receiverUsername,
	        status: "pending",
	        sentByMe: true
        }


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


async function getFriends(userId) {

    var friendsRef = db.collection(FriendsTable).doc(userId)

    var people =[]

    var friends = await friendsRef.collection("friends-sub")
        .where("status","==","accepted").get().then(querySnapshot=>{
            querySnapshot.forEach(doc =>{
                var info = doc.data()
                console.log("friend data")
                console.log(info)
                people.push(info["id"])
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
                    people.push(info["id"])
                    return doc.data()
                }
                
            })
        }) 
        console.log(people)
    return people

}

module.exports = { sendRequest}