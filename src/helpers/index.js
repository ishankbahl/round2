const crypto = require('crypto');

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
    create32BitId: create32BitId,
    checkLimit: checkLimit,
    generatehash: generateHash,
};