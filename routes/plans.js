const express = require('express');
const {db} = require('../db/firebase.js')
const router = express();
const planService = require("../db/planService")


const {findOrCreate, users, } = require("../db/userService.js")


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
        info = await planService.setUserDown(planId, userId)
    }else if (newStatus == "maybe"){
        console.log("setting maybe")
        info = await planService.setUserMaybe(planId, userId)
    } else if (newStatus == "host") {
        console.log("setting maybe")
        info = await planService.setUserHost(planId, userId)
    }

    if (info != null){
        console.log(`responding ${info}`)
        return res.status(200).json({response: info})
    }
    return res.status(500)
    

}

exports.createPlan = async (req, res) => {
    try {
        //receives body with plan info
        //receives userId of host
        var hostId = req.query.host_id

        console.log(req.body)
        var planInfo = {
            host: hostId,
            createdAt: Date(),
            ...req.body
        }
        var plan = await planService.createPlan(planInfo)
        
        //var info = await planService.duplicateMembership(plan, user)
        var info = await planService.setUserHost(plan.id, hostId)
        //create update message on join

        //affiliate member To Plan
        //affiliate plan to user
        return res.status(200).json({response: info})

      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
}



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