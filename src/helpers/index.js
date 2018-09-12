const crypto = require('crypto');

function handleError(e, res) {
    console.log(e);
    if(e && e.statusCode) {
        res.status(e.statusCode).end(e.message);
    }
    else {
        res.status(500).end(JSON.stringify(e));
    }
}

function create32BitId() {
    return crypto.randomBytes(16).toString('hex');
}

function generateHash(data) {
    return crypto.createHash('sha1').update(data).digest("hex");
}

function checkLimit(num) {
    return parseFloat(val) > -1;
}

module.exports = {
    handleError: handleError,
    create32BitId: create32BitId,
    checkLimit: checkLimit,
    generatehash: generateHash,
};