//Here we require our 'User and the Validade Schema' and express
const { User, validate} = require('../models/user');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('config');
const express = require('express');
const router = express.Router();

//we require 'bcrypt' to do the hashing of the password
const bcrypt = require('bcrypt');

// const sanitizeHtml = require('sanitize-html');

// function sanitizeUser(user) {
//     const cleanUser = sanitizeHtml(user, {
//         allowedTags: [],
//         allowedAttributes: {},
//       });
//       return cleanUser;
// };

// let userTest = sanitizeUser("<script>OLE");

// console.log(userTest);




//The router.post() function does all the heavy work here
router.post('/', async (req, res) => {
    // First Validate The Request
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Check if this user already exists
    let user = await User.findOne({ name: req.body.email });
    let email = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('This username is already in use!');
    } else if (email) {
        return res.status(400).send('This email is already in use!');
    } else {
        // Insert the new user if they do not exist yet
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        });
        
        //here we encrypt the password with bcrypt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        user.confirmPassword = await bcrypt.hash(user.confirmPassword, salt);
        

        await user.save();
        //it will generate the token to the user 'x-auth-token'
        const token = jwt.sign({ _id: user._id }, config.get('PrivateKey'));
        res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
    }
});

module.exports = router;
 
