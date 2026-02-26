const express = require('express');
const router = express.Router();
const { generateTest, submitTest } = require('../controllers/testController');

router.post('/generate', generateTest);
router.post('/submit', submitTest);

module.exports = router;