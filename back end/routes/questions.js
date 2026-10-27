const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const auth = require('../middleware/auth');

// @route    GET api/questions
// @desc     Get all questions (optionally filter by difficulty)
// @access   Private (or Public, but we require login to start coding)
router.get('/', auth, async (req, res) => {
  try {
    const { difficulty } = req.query;
    let query = {};
    if (difficulty) {
      query.difficulty = difficulty.toLowerCase();
    }
    const questions = await Question.find(query).select('-testCases'); // Hide full test cases from list endpoint to prevent cheating
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/questions/:id
// @desc     Get question by ID (includes sample test cases)
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.id || req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
