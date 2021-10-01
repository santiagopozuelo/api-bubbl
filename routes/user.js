const express = require('express');
const {db} = require('../db/firebase.js')
const router = express();
//const {findOrCreate, users, } = require("../db/userService.js")
const userService = require("../db/userService.js")
const planService = require("../db/planService.js")

// interface User {
//     firstName: String,
//     lastName: String,
//     email: String,
//     areaNumber: String,
//     department: String,
//     id:String,
//     contactNumber:String
// }




exports.getUsersNoId = async(request,response) => {
	var userOut = {}
	await db.collection("bubbl-users").get().then(querySnap =>{
		querySnap.forEach(doc => {
			var info = doc.data()
			if (info["uid"] == null) {
				userOut = info
				console.log(info)
				console.log("yeet")
			}
		})

	})
	return response.status(200).json(userOut)



}

// exports.deleteGuestUsers2 = async(request,response) => {
// 	db.collection("bubbl-users").get().then(async querySnap=> {
// 		var betaUsers = []
// 		var guestUsers = []


// 		querySnap.forEach(async doc => {
// 			var info = doc.data()
// 			//console.log(info)
// 			if (info["uid"] != null) {
// 				console.log(` ${info["name"]}: has beta user`)
// 				betaUsers.push(info["name"])

// 			} else {
// 				//db.collection("bubbl-users").doc(doc.id).delete()
// 				//doc.ref.delete()
// 				console.log("other")
// 				var subPlanRef = await doc.ref.collection("bubbl-plans")
// 				console.log(subPlanRef.docs.length)
// 				await deleteSubCollection(subPlanRef)
				
// 				guestUsers.push(info["name"])

// 				console.log(`${info["name"]}: has no account`)
// 			}
// 		})
// 		return response.status(200).json({"betaUsers":betaUsers, "guestUsers": guestUsers})

// 	})
// }

exports.getUserIfExists = async(request, response ) => {
	const userId = request.params.user_id
	console.log("GETTINGUSER")
	console.log(userId)
	var user = await userService.getUserById(userId)
	console.log(user)
	
	return response.status(200).json(user)
}

exports.registerUser = async(request, response) => {
	//format the information
	console.log("registering")
	var info = request.body
	console.log(info)
	var myUser = {
		uid: info.uid,
		email: info.email,
		name: info.name,
		username: info.username
	}

	const curr = await userService.getUserById(myUser.uid)

	if (curr != null) {
		console.log("existing")
		console.log(curr)
		return response.status(500).json({response: "error"})
	} else {
		//create the user
		const created = await userService.createUser(myUser)
		if (created) {
			console.log(created)
			return response.status(200).json({response: created})
		} else {
			console.log("erroor creating")
			return response.status(500).json({response: "error"})
			
		}

		
	}
	//find by ID
	//if found return error

	//else create
}

//hosting and going
exports.CalendarPlans = async (request,response)=> {
	const userId = request.params.userId
	//get plansId going and hosting 
	//get those plans objects
	//order
	//const plansCalendar = await userService.getPlansGoingHosting(userId) 
	const plansCalendar = await userService.getPlansProfile(userId) 
	if (plansCalendar) {
		return response.status(200).json({response: plansCalendar, success: true})
	} else {
		return response.status(500).json({response: error, success: false})
	}
	//return planIds

	
}

exports.getCalendarPlans = async (request, response)=> {
	const userId = request.params.user_id
	console.log("getting user calendar plans")
	var user = await userService.getUserById(userId)
	//getListPlansFuture
	//getStatus for each
	var plansListStatus = await userService.getMyPlans(userId)

	//var plansGoing = await userService.getListPlansGoing(userId)
	//var plansHosting = await userService.getListPlansHosting(userId)
	var plansList = []
	for (plan in plansListStatus) {
		if (plan[1]["status"] == "going" || plan[1]["status"] == "host") {
			//get sortedPlans withId
			//plans
			var planTemp= planService.getPlanById(plan[0])
			console.log(plan[1])
			planTemp["status"] = plan[1]
			plansList.push(planTemp)
		}
	}
	plansList.orderBy("date")
	return response.status(200).json(plansList) 

	// var planIds = plansGoing.concat(plansHosting)
	console.log(planIds)

	var calendarPlans = await planService.getListPlans(planIds)
	//order by date
	return response.status(200).json({content: calendarPlans})


	//get list of plans going or hosting



}


exports.getAllPlans = (request, response) => {
	db
        .collection('beta-plans')
        .where('username', '==', request.user.username)
		.orderBy('createdAt', 'desc')
		.get()
		.then((data) => {
			let todos = [];
			data.forEach((doc) => {
				todos.push({
                    todoId: doc.id,
                    title: doc.data().title,
                    username: doc.data().username,
					body: doc.data().body,
					createdAt: doc.data().createdAt,
				});
			});
			return response.json(todos);
		})
		.catch((err) => {
			console.error(err);
			return response.status(500).json({ error: err.code});
		});
};




