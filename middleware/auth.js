//Authentication

const jwt = require('jsonwebtoken');
const config = require('config');
const dotenv = require('dotenv');
var express = require('express')
var cookieParser = require('cookie-parser')
const { User } = require('../models/user');
 
var app = express()
app.use(cookieParser())

dotenv.config();
//function that takes 'request', 'response' and 'next' (that we use to pass to the next middleware functon we will have in the pipeline)
//this function is to require the token to access what comes next

function auth(req, res, next) {
    const token = req.cookies.token || '';
    if (!token) return res.status(401).send('Access denied. No token provided. Please login first');

    try{
    //here we give the token and our privatekey to the verify function to be able to verify if it is valid.
    //
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();         //the next one will be our route handler
    }
    catch (ex) {
        res.status(400).send('Invalid token.');
    }
    return next();
    
    //in the middleware functions or we terminate te request life cicle (like in catch) or we pass to the next one (like in try)
}

//check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.token || '';
    if (!token){
        console.log('Access denied. No token provided. Please login first');
        res.locals.user = null;
    } else {
        jwt.verify(token, ('jwtPrivateKey'), async (err, decodedToken) => {
            if (err) {
                console.log('Invalid token.');
                res.locals.user = null;
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
            }
        });
    }
    return res.locals.user;
}

const checkUser2 = async (req, res, next) => {
    const token = req.cookies.token || '';
    if (!token) return res.status(401).send('Access denied. No token provided. Please login first');

    try{
    //here we give the token and our privatekey to the verify function to be able to verify if it is valid.
    //
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));  
        var userId = decoded.id;
        let user = await User.findById(decoded.id);
        res.locals.user = user;
        console.log(decoded);
        next();         //the next one will be our route handler
    }
    catch (ex) {
        res.status(400).send('Invalid token.');
    }
    return userId;
}

module.exports = { auth, checkUser, checkUser2};