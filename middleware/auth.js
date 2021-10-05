//Authentication

const jwt = require('jsonwebtoken');
const config = require('config');
const dotenv = require('dotenv');

dotenv.config();
//function that takes 'request', 'response' and 'next' (that we use to pass to the next middleware functon we will have in the pipeline)
//this function is to require the token to access what comes next
module.exports = function auth(req, res, next) {
    const token = req.cookies.token || '';
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try{
    //here we give the token and our privatekey to the verify function to be able to verify if it is valid.
    //
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();         //the next one will be our route handler
    }
    catch (ex) {
        res.status(400).send('Invalid token.')
    }
    return next();
    
    //in the middleware functions or we terminate te request life cicle (like in catch) or we pass to the next one (like in try)
}
