const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const { User } = require('../models/user');
const {auth, checkUser, checkUser2} = require('../middleware/auth');


module.exports = function(app){

router.get("/test", (req, res) => {
    res.json(["john", "tom"]);
})

/******************* PAGES ROUTINGS **************************/


router.get('/',function(req,res){
    res.sendFile(path.join('../public/index.html'));
});

router.get("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});


router.get('/register',function(req,res){
    res.sendFile(path.join(__dirname+'../public/register.html'));
});

router.get("/chat", auth, (req, res) => {
    res.sendFile(path.join(__dirname+'../public/chat.html'));
});

router.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname+'../public/edit.html'));
});

router.get('/me', async (req, res) => {
    const user = checkUser2;
    console.log(user.name);
});

app.use(express.static(path.join(__dirname, '../public')));

app.use('/', router);

/******************* ************** **************************/
}