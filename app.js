const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const fire = require('./db/firebase.js')
const dotenv = require('dotenv');
dotenv.config();

console.log(`Your port is ${process.env.BUBBL_URL}`); // undefined
console.log(`Your port is ${process.env.BUBBL_URL}`); // 8626


const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

app.use(require('express-session')({
    secret: "whatever",
    resave: true,
    saveUninitialized: true,
  }));

app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
})

// app.use(passport.initialize());

// passport.serializeUser(function (user, cb) {
//   cb(null, user);
// });

const router = express.Router()

//PLANS
 const {
   modifyPlanStatus,
//   deletePlan,
//   loadFeedPlans,
   createPlan,
//   editPlanPeople,
//   getPlan,
 } = require('./routes/plans.js')

//PLANS
// app.get("/plans/publicfeed", loadFeedPlans)
app.put("/plans/:planId", modifyPlanStatus)
// app.get("/plans/:planId",getPlan)
 app.post("/plans", createPlan)
// app.delete("/plans/:planId", deletePlan)
//people
// app.put("/plans/people", editPlanPeople)


//CHAT'
// const {
//   getPlanChats,
//   editPlanChat,
//   addPlanChat
// } = require('./routes/chats.js')

// app.get("/chats" ,getPlanChats)
// app.post("/chats",addPlanChat)
// app.put("/chats",editPlanChat)


//CLUBS
// const {
//   createClub,
//   editClubDetails,
//   editClubFollowers,
//   deleteClub,
//   viewAllClubs,
// } = require('./routes/clubs.js')

// app.get("/clubs/all", viewAllClubs)
// app.post('/clubs', createClub)
// app.delete('/clubs/:clubId', deleteClub)
// app.put('/clubs/:clubId', editClubDetails)
// app.put('/clubs/followers', editClubFollowers)

//USER
const {
  //getUserProfile,
  //updateUserProfile,
  //editProfileImage,
  //getProfileImage,
  registerUser,
  CalendarPlans,
  getUserIfExists
} = require('./routes/user.js')

// app.get("user/plans", getMyBubblesFeed)
// app.get("/user/profileimage", getProfileImage)
// app.post("/user/profileimage",editProfileImage)
app.get("/user/calendarplans/:userId", CalendarPlans)
app.post("/user", registerUser)
// app.put("user/profile", updateUserProfile)
// app.get("user/profile",getUserProfile )
app.get("/user/:user_id",getUserIfExists)

//AUTH
// const {
//   signUpUser,
//   loginUser,
// } = require('./routes/auth')

// app.post('/login', loginUser);
// app.post('/signup', signUpUser);

//FRIENDS
 const {
   removeFriend,
   getPersonRelationship,
   addFriend,
   acceptFriendRequest,
   getFriends,
 } = require("./routes/people.js", )

 app.post("/people/friends/add", addFriend)
 //app.get("/people/all")
 app.post("/people/friends/accept",acceptFriendRequest)
 app.get("/people/friends", getFriends)
 app.get("/people/relationship", getPersonRelationship)
 app.delete("/people/friends", removeFriend)


//CLUB TO PLANS RELATIONSHIP

//app.use('/plans', )
//app.use('hostToken', require('./routes/hostToken'))

app.get('/',
  function(req, res) {
    res.send("yuh")
  });

// start server
app.listen(process.env.PORT || 3001, () => console.log("Server listening on http://localhost:3001"))