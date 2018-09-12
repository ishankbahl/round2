const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// For unique incremental integral value
const AutoIncrement = require('mongoose-sequence')(mongoose);

// For enabling encryption on schema fields in mongoose
const encrypt = require('mongoose-encryption');

// For using Double in mongoose. Refer https://stackoverflow.com/questions/33557730/mongoose-float-values
const Double = require('@mongoosejs/double');

const helpers = require('../helpers');

require('dotenv').config();

//Schema for Node Data
const DataSchema = mongoose.Schema({
    ownerName: {
        type: String,
        required: true,
    },
    ownerId: {
        type: String,
        required: true,
    },
    value: {
        type: Double,
        required: true,
    },
    hashValue: {
        type: String,
    },
}, {_id: false});

// Schema for Node
const NodeSchema = mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    data: {
        type: DataSchema,
        required: true,
    },
    nodeId: {
        type: String,
        required: true,
    },
    referenceNodeId: {
        type: String,
    },
    childReferenceNodeId: {
        type: [String],
        required: true,
    },
    genesisReferenceNodeId: {
        type: String,
    },
    hashValue: {
        type: String,
    },
    limit: {
        type: String,
        required: true,
        validate: [helpers.checkLimit, 'Aborted Operation, trickle down property not satisfied'],
    }
});

NodeSchema.plugin(encrypt, {
    secret: process.env.ENCRYPTION_KEY,
    encryptedFields: ['data'],
    decryptPostSave: false,
});

NodeSchema.plugin(AutoIncrement, {inc_field: 'id'});

NodeSchema.pre('validate', function(callBack) {

    if(!this.referenceNodeId) {
        return callBack();
    }

    Node.editLimit(this.referenceNodeId, 0 - parseFloat(this.data.value))
        .then(res => {
            callBack();
        })
        .catch(e => {
            callBack(e);
        });

});

// Things done before saving
NodeSchema.pre('save', function(callBack) {

    if(this.referenceNodeId) {

        Node.addChildToNode(this.referenceNodeId, this.nodeId)
            .then(res => {

                this.hashValue = helpers.generateHash(JSON.stringify([
                    this.genesisReferenceNodeId,
                    this.childReferenceNodeId,
                    this.referenceNodeId,
                    this.nodeId,
                    this.data,
                    this.timestamp,
                ]));

                callBack();

            })
            .catch(e => {
                callBack(e);
            })
    }
    else {

        this.hashValue = helpers.generateHash(JSON.stringify([
            this.genesisReferenceNodeId,
            this.childReferenceNodeId,
            this.referenceNodeId,
            this.nodeId,
            this.data,
            this.timestamp,
        ]));

        callBack();

    }

});

const Node = module.exports = mongoose.model('Node', NodeSchema);

Node.makeGenesisNode = (ownerName, ownerId, value) => {

    const node = new Node({
        limit: value,
        nodeId: helpers.create32BitId(),
        data: {
            ownerName,
            ownerId,
            value,
            hashValue: helpers.generateHash(JSON.stringify([
                value,
                ownerId,
                ownerName,
            ])),
        }
    })

    return node.save()

}

Node.makeChildNode = (ownerName, ownerId, value, referenceNodeId) => {

    const node = new Node();
    let genesisReferenceNodeId;

    return new promise((resolve, reject) => {

        Node.findOne({
            nodeId: referenceNodeId
        })
        .exec()
        .then(response => {

            if(!response) {

                let e = new Error("id didn't match");
                e.statusCode = 400;
                throw err

            }

            genesisReferenceNodeId = response.genesisReferenceNodeId || referenceNodeId;

            let newChild = new Node({
                genesisReferenceNodeId,
                referenceNodeId,
                nodeId: helpers.create32BitId(),
                data: {
                    ownerName,
                    ownerId,
                    value,
                    hashValue: helpers.generateHash(JSON.stringify([
                        value,
                        ownerId,
                        ownerName,
                    ])),
                }
            });

            return newChild.save();

        })
        .then(node => {
            resolve(node);
        })
        .catch(e => {
            console.log('Error', e);
            reject(err);
        })

    });

}

Node.addChildToNode = (nodeId, childId) => {
    return Node.findOneAndEdit({nodeId}, {$push: {childReferenceNodeId: childId}}).exec();
}

Node.editLimit = (nodeId, value) => {
    return new Promise((resolve, reject) => {
        Node.findOne({nodeId}).exec()
            .then(node => {

                node.limit = parseFloat(node.limit) + parseFloat(value);
                
                return node.save();

            })
            .then(node => {
                return resolve(node);
            })
            .catch(e => {
                return reject(e);
            })
    })
}

Node.readNode = (ownerName, ownerId, nodeId) => {
    return new Promise((resolve, reject) => {
        Node.findOne({nodeId}).exec()
            .then(node => {

                if(!node) {
                    throw new Error("node not found");
                }

                if(ownerId === node.data.ownerId && ownerName === node.data.ownerName) {
                    return resolve(node);
                }
                else {
                    throw new Error('authorization required to access the resource');
                }

            })
            .catch(e => {

                console.log('Error: ', err);
                return reject(err);
            })
    })
}

Node.getNodes = (ownerName, ownerId, nodeId) => {

    return new Promise((resolve, reject) => {
        Node.findOne({nodeId})
            .then(node => {

                const childPromises = [];

                if(ownerId != node.data.ownerId || ownerName != node.data.ownerName) {
                    throw new Error('authorization required to access the resource');
                }

                for(let childId of node.childReferenceNodeId) {
                    childPromises.push(Node.findOne({nodeId: childId}));
                }

                return Promise.all(childPromises);

            })
            .then(nodes => {
                const response = [];
                for(let current of nodes) {
                    let current = {...currentNode._doc}
                    if(ownerId == current.data.ownerId && ownerName == current.data.ownerName) {
                        response.push(current);
                    }
                    else {
                        console.log("owner doesn't match");
                        delete current['data'];
                        current['info'] ="You cannot access data on this node because you are not its owner",
                        response.push(current);
                    }
                }
                return resolve(response);
            })
            .catch(e => {
                return reject(e);
            });
    });
    
}
