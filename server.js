const path = require('path');
const http = require('http');
const express = require('express');


const app = express();

const server = http.createServer(app);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));


const port = process.env.PORT || 3000;    

server.listen(port, () => console.log(`Listening on port ${port}...`));