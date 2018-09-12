const bodyParser = require('body-parser');
const express = require("express");

require('dotenv').config();

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
