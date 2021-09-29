const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
//here we require the 'userReg.js' file so we can use it more down
const users = require('./routes/userReg');
//here we require the 'userAuth.js' file so we can use it more down
const auth = require('./routes/userAuth');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost/mongo-games')
    .then(() => console.log('Now connected to MongoDB!'))
    .catch(err => console.error('Something went wrong', err));

app.use(express.json());

//here we set up the route to the userReg.js
app.use('/api/users', users);
app.use('/api/auth', auth);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
 
 
