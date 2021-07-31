const express = require('express');
const {db} = require('../db/firebase.js')
const router = express();
const planService = require("../db/planService")
const userService = require("../db/userService")
const planPeopleService = require("../db/planPeopleService")
var planClubService = require("../db/clubService")


const {findOrCreate, users, } = require("../db/userService.js")

exports.addPlanPeople = async (req, res) => {
    //body:
        //userId
        //planId
        //people
    var userId = req.body.userId
    var planId = req.body.planId
    var peopleList = req.body.peopleList
    var myUser = await userService.getUserById(userId)
    if (myUser == null) {
        return res.status(500).json({response: "error no userId exists"})
    }
    var info = await planPeopleService.tagPlanPeople(userId,planId,peopleList)
    
    return res.status(200).json({response: info})

    //tagPlanPeople

    //check plan exists
    //addPlanPeople service
        //add plans to users status:invited, lead: personId, updatedAt
    //check plan exists
    //


}

exports.getPlan= async (req,res)=> {
    var planId = req.params.planId

    var result = await planService.getPlanById(planId)
    if (result != null) {
        return res.status(200).json({response: result})
    } else {
        return res.status(500).json({response: null})
    }

}

exports.loadMyPlans = async (req, res) => {
    try {
        console.log("loading plans from feed")
        var userId = req.params.userId
        var userRef = await db.collection('beta-users').doc(userId)
        var myPlans = []
        var plans = await userRef.collection("beta-plans").get().then((querySnap) =>{

            var info = querySnap.docs.forEach((doc)=> {
                if (doc.exists && doc.data()!=null) {
                    console.log("first plan")
                    console.log("status")

                    myPlans.push([doc.id, doc.data()["status"]])
                }

            })

        })
        return res.status(200).json({response: myPlans, success: true})
    } catch (error) {
        console.log("error ocurred")
        console.log(error)
        return res.status(500).json({success: false})

    }

    //db.collection('beta-users').doc()

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

exports.modifyPlanStatus = async (req,res)=> {
    var planId = req.params.planId
    var userId = req.body.userId
    var newStatus = req.body.status
    var info;
    if (newStatus == "down"){
        console.log("setting down")
        info = await planPeopleService.setUserDown(planId, userId)
    }else if (newStatus == "maybe"){
        console.log("setting maybe")
        info = await planPeopleService.setUserMaybe(planId, userId)
    } else if (newStatus == "host") {
        console.log("setting maybe")
        info = await planPeopleService.setUserHost(planId, userId)
    }

    if (info != null){
        console.log(`responding ${info}`)
        return res.status(200).json({response: info})
    }
    return res.status(500)
    

}

exports.createPublicPlan = async (req,res) => {
    try {
        //validate info with schema
        //title cant be null
        var host = req.body.host
        console.log(req.body)
        var date = new Date(req.body.date)
        var planInfo = {
            createdAt: new Date(),
            updatedAt: new Date(),
            title: req.body.title,
            emoji: req.body.emoji,
            description: req.body.description,
            date: date,
            host: req.body.host,
            visibility: req.body.visibility

        }
        var plan = await planService.createPlan(planInfo)
        //add plan to public list in location
        
        //var info = await planService.duplicateMembership(plan, user)
        var info = await planPeopleService.setUserHost(plan.id, host)
        //add people to plan

        //create update message on join
        if (info == true) {
            //var mess = {response: info,  }
            return res.status(200).json({success: info, response: plan.id})
        } else {
            var mess = {success:info}
            return res.status(500).send(mess);
        }
        //affiliate member To Plan
        //affiliate plan to user
        

      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }

}

exports.createClubPlan = async (req,res) => {
    var host = req.body.host
    console.log(req.body)
    var date = new Date(req.body.date)
    var planInfo = {
        createdAt: new Date(),
        updatedAt: new Date(),
        title: req.body.title,
        emoji: req.body.emoji,
        description: req.body.description,
        date: date,
        host: req.body.host,
        visibility: req.body.visibility || null,
        club: req.body.club || null
        
    }
    var plan = await planService.createPlan(planInfo)
    var club = req.body.club
    console.log(club)

    var info = await planPeopleService.setUserHost(plan.id, host)
    var added
    if (club != null) {
        added = await planClubService.tagPlanClub(club,host,plan.id)
        console.log("cub added")
        console.log(added)
    }


}

exports.createPlan = async (req, res) => {
    try {
        //validate info with schema
        //title cant be null
        var host = req.body.host
        console.log(req.body)
        var date = new Date(req.body.date)
        var planInfo = {
            createdAt: new Date(),
            updatedAt: new Date(),
            title: req.body.title,
            emoji: req.body.emoji,
            description: req.body.description,
            date: date,
            host: req.body.host,
            visibility: req.body.visibility || null,
            
        }
        var plan = await planService.createPlan(planInfo)
        var people = req.body.people
        console.log("printing peopole")
        console.log(people)
        console.log(plan)
        
        //var info = await planService.duplicateMembership(plan, user)
        
        var info = await planPeopleService.setUserHost(plan.id, host)
        var added
        if (people != null) {
            added = await planPeopleService.tagPlanPeople(host,plan.id, people)
            console.log("people added")
            console.log(added)
        }
        //create update message on join
        if (info == true) {
            //var mess = {response: info, }
            //var resp = {planId: plan.id, peopleIds: added}
            return res.status(200).json({success: info, response: plan.id})
        } else {
            var mess = {success:info}
            return res.status(500).send(mess);
        }
        //affiliate member To Plan
        //affiliate plan to user
        

      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
}


//delete plam


router.get("/", (req,res,next) => {
    const { info } = req.query;
    const data = JSON.stringify(info)
    res.send({yeet: "2"})
});


// router.post('/api/create', (req, res) => {
//     (async () => {
//         try {
//           await db.collection('beta-plans').doc('/' + req.body.id + '/')
//               .create({item: req.body.item});
//           return res.status(200).send();
//         } catch (error) {
//           console.log(error);
//           return res.status(500).send(error);
//         }
//       })();
//   });

  

// read item

router.get('/api/plans/:plan_id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('beta-plans').doc(req.params.plan_id);
            let item = await document.get();
            let response = item.data();
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        })();
    });


//get all plans
// router.get('/loadFeedPlans', (req,res) => {
// (
//     async()=> {
//         try {
//             const plansRef = db.collection('beta-plans')
//             let response = []

//             await plansRef.get().then(querySnapshot => {
//                 let docs = querySnapshot.docs;
//                 for (let doc of docs) {
//                     const selectedItem = {
//                         id: doc.id,
//                         item: doc.data().item
//                     };
//                     response.push(selectedItem);
//                 }
//                 });
//             return res.status(200).send(response);
//         }

//         catch (error) {
//             console.log(error);
//             return res.status(500).send(error);
//         }
//     }
// )()
// })


// router.post('/create', (req,res)=> {
//     //title, emoji, date,host,code, people, createdAt

//     if (req.body.title.trim() == '') {
//         return response.status(400).json({ title: 'Must not be empty' });
//     }

//     const newPlan = {
//         title: request.body.title,
//         body: request.body.body,
//         createdAt: new Date().toISOString()
//     }
    
// })

router.delete('/delete/:plan_id', (req,res)=> {
    const document = db.doc(`/plans/${request.params.todoId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return response.status(404).json({ error: 'Todo not found' })
            }
            return document.delete();
        })
        .then(() => {
            response.json({ message: 'Delete successfull' });
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        });
})


// router.put('/update/:plan_id',(req,res)=> {

//     (async () => {
//         try {
//             const document = firestore.collection('items').doc(req.params.item_id);
//             await document.update({
//                 item: req.body.item
//             });
//             return res.status(200).send();
//         } catch (error) {
//             console.log(error);
//             return res.status(500).send(error);
//         }
//         })();

// })

//app.delete('/api/delete/:item_id', (req, res) => {











  //module.exports = router;