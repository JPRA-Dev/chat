/****** USER MODEL ******/


//We require the npm 'joi' to validate the data and 'mongoose' to create the 'User MongoDB 'Schema.
const Joi = require('joi');
const mongoose = require('mongoose');





//Here we create the User Schema with the requirements for name, email and password
const User = mongoose.model('User', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        select: false,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    confirmPassword: {
        type: String,
        select: false,
        required: true,
        minlength: 5,
        maxlength: 1024
    }
}));

//here we use 'joi' to make the validation of our data
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        confirmPassword: Joi.any().equal(Joi.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} needs to be the same as the password!' })
    });
    
    
    return schema.validate(user);
}




exports.User = User;
exports.validate = validateUser;
