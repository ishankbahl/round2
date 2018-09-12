const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require("express");

require('dotenv').config();

const routes = require('./src/routes');

mongoose.connect(process.env.DATABASE);
let db = mongoose.connection;

db.once('open', function() {
    console.log('Connected to Database');
});

//Check for db errors
db.on('error', function(e) {
    console.log(e);
});

// Initialize App
const app = express();

// bodyParser Middleware
app.use(bodyParser.json());

//Base Route
app.get('/', (req, res) => {
    res.send('Go to /api for using the application');
});

app.use('/api', routes);

// Server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server running on port' + port);
});
