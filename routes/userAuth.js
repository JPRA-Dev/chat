const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
var cookieParser = require('cookie-parser')
 
var app = express()
app.use(cookieParser())


router.post('/', async (req, res) => {
    // First Validate The HTTP Request
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //  Now find the user by their user and check if email is there
    let user = await User.findOne({ name: req.body.name });
    if (!user) {
        return res.status(400).send('Incorrect user or password.');
    }

    // Then we check if the password that the user did provide matches the one of the database
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send('Incorrect user or password.');
    }

    const room = await User.findOne({ room: req.body.room });

    //as all matches, we give a token to the user to be able to login with their account
    //const token = jwt.sign({ _id: user._id }, 'PrivateKey');

    //Now that we have the config files, instead of referencing the private key directly, we reference it using the config.get() function that is inside the user.generateAuthToken();
    const token = user.generateAuthToken();

    // res.header('x-auth-token', token);
    // res.send(token);
    //time of cookies last 2 hours
    res.cookie('token', token, { maxAge: 7.2e+6, secure: false, // set to true if your using https
        httpOnly: true,
    });
    res.redirect("/chat")
    res.end();
});

router.get('/me', async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -confirmPassword');     //in the 'select' we are saying to explude the property "password" and "confirmPassword", do the user can't see them
    res.send(user);
});

function validate(req) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        password: Joi.string().min(5).max(255).required(),
        room: Joi.string().min(3).max(50).required()
    });
    return schema.validate(req);
}

module.exports = router; 