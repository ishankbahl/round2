const node = require('../models');
const handleError = require('../helpers').handleError;

const router = require('express').Router();

router.get('/read_node', (req, res) => {

    const { ownerName, ownerId, nodeId } = req.query;

    Node.readNode(ownerName, ownerId, nodeId)
        .then(response => {
            res.json(response);
        })
        .catch(e => handleError(e, res));

});

router.get('/read_nodes', (req, res) => {

    const { ownerName, ownerId, nodeId } = req.query;

    Node.readNodes(ownerName, ownerId, nodeId)
        .then(response => {
            res.json(response);
        })
        .catch(err => handleError(e, res));

})

router.get('/print_chain/:nodeId', (req, res) => {

    const { nodeId } = req.params;

    Node.printChain(nodeId)
        .then(response => {
            res.send(response);
        })
        .catch(e => handleError(e, res));

});

router.get('/read_longest_chain/:nodeId', (req, res) => {

    const { nodeId } = req.params;

    Node.readLongestChain(nodeId)
        .then(response => {
            res.json(response);
        })
        .catch(e => handleError(e, res));

});

router.post('/update_node', (req, res) => {

    const { ownerName, ownerId, value, nodeId } = req.body;

    Node.updateNode(ownerName, ownerId, value, nodeId)
        .then(result => {
            res.json(result);
        })
        .catch(e => handleError(e, res));

});

router.post('/make_genesis_node', (req, res) => {

    const { ownerName, ownerId, value } = req.body;
    
    Node.makeGenesisNode(ownerName, ownerId, value)
        .then(response => {
            res.json(response);
        })
        .catch(e => handleError(e, res));

});

router.post('/make_child_node', (req, res) => {

    const { ownerName, ownerId, value, nodeId } = req.body;

    Node.makeChildNode(ownerName, ownerId, value, nodeId)
        .then(response => {
            response.json(response);
        })
        .catch(e => handleError(e, res));

});

router.post('/make_child_nodes', (req, res) => {

    const { ownerName, ownerId, values, nodeId } = req.body;
    const promises = [];

    for(let value in values) {
        promises.push(Node.makeChildNode(ownerName, ownerId, value, nodeId));
    }

    Promise.all(promises)
        .then(response => {
            res.json(response);
        })
        .catch(e => handleError(e, res));

});

module.exports = router;
