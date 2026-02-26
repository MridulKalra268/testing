const express = require('express');
const router = express.Router();
const { getAllTopics, seedTopics } = require('../controllers/topicController');

router.get('/', getAllTopics);
router.post('/seed', seedTopics);

module.exports = router;