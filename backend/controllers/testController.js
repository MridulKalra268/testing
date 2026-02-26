const axios = require('axios');
const Topic = require('../models/Topic');
const TestHistory = require('../models/TestHistory');

const TOTAL_QUESTIONS = 20;
const DIFFICULTY_DIST = { easy: 8, moderate: 8, hard: 4 };

// Build a blueprint: which topic gets how many questions
function buildTestBlueprint(topics) {
  const blueprint = [];
  let totalAssigned = 0;

  // Assign min questions to each topic first
  for (const topic of topics) {
    const count = topic.minQuestions > 0 ? topic.minQuestions : 0;
    blueprint.push({ topic, count });
    totalAssigned += count;
  }

  // Distribute remaining questions up to max
  let remaining = TOTAL_QUESTIONS - totalAssigned;
  let iterations = 0;
  while (remaining > 0 && iterations < 100) {
    for (const entry of blueprint) {
      if (remaining <= 0) break;
      if (entry.count < entry.topic.maxQuestions) {
        entry.count++;
        remaining--;
      }
    }
    iterations++;
    // If all at max, distribute round-robin
    if (blueprint.every(e => e.count >= e.topic.maxQuestions)) {
      for (const entry of blueprint) {
        if (remaining <= 0) break;
        entry.count++;
        remaining--;
      }
      break;
    }
  }

  return blueprint.filter(e => e.count > 0);
}

// Assign difficulty to each question slot
function assignDifficulties(totalCount) {
  const difficulties = [];
  const counts = { ...DIFFICULTY_DIST };
  // Scale to totalCount
  const scale = totalCount / TOTAL_QUESTIONS;
  let easy = Math.round(counts.easy * scale);
  let moderate = Math.round(counts.moderate * scale);
  let hard = totalCount - easy - moderate;
  if (hard < 0) { moderate += hard; hard = 0; }

  for (let i = 0; i < easy; i++) difficulties.push('easy');
  for (let i = 0; i < moderate; i++) difficulties.push('moderate');
  for (let i = 0; i < hard; i++) difficulties.push('hard');

  // Shuffle
  for (let i = difficulties.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [difficulties[i], difficulties[j]] = [difficulties[j], difficulties[i]];
  }
  return difficulties;
}

// Build the Grok prompt
function buildPrompt(blueprint, difficultyList) {
  let qIndex = 0;
  const topicRequirements = blueprint
    .map(({ topic, count }) => {
      const diffs = difficultyList.slice(qIndex, qIndex + count);
      qIndex += count;
      const patternList = topic.patterns.join(', ');
      return `- ${topic.name} (${count} question${count > 1 ? 's' : ''}): 
    Difficulties: [${diffs.join(', ')}]
    Must cover patterns from: ${patternList}
    Vary the pattern used for each question in this topic.`;
    })
    .join('\n');

  return `You are a TCS NQT Quantitative Aptitude question generator.

Generate exactly ${TOTAL_QUESTIONS} MCQ questions for a test with the following topic distribution:

${topicRequirements}

RULES:
1. Each question must have exactly 4 options labeled A, B, C, D
2. Provide the correct answer letter
3. Include a brief solution/explanation
4. Questions must be numerically solvable with specific values
5. Do NOT repeat question patterns within the same topic
6. Make questions realistic, similar to TCS NQT exam style
7. Use varied numbers to ensure uniqueness each generation
8. Strictly follow the difficulty: easy = straightforward 1-2 step, moderate = 2-3 steps, hard = multi-step or tricky

Respond ONLY with a valid JSON array. No markdown, no explanation outside JSON.

Format:
[
  {
    "id": 1,
    "topic": "Topic Name",
    "pattern": "pattern used",
    "difficulty": "easy|moderate|hard",
    "question": "Full question text",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "answer": "A",
    "solution": "Step-by-step solution"
  }
]`;
}

const generateTest = async (req, res) => {
  try {
    const { topicSlugs } = req.body;

    if (!topicSlugs || topicSlugs.length === 0) {
      return res.status(400).json({ success: false, message: 'No topics selected' });
    }

    // Fetch selected topics from DB
    const topics = await Topic.find({ slug: { $in: topicSlugs }, active: true });

    if (topics.length === 0) {
      return res.status(404).json({ success: false, message: 'Topics not found' });
    }

    // Build blueprint and difficulties
    const blueprint = buildTestBlueprint(topics);
    const difficultyList = assignDifficulties(TOTAL_QUESTIONS);
    const prompt = buildPrompt(blueprint, difficultyList);

    // Call Grok API
    const response = await axios.post(
      process.env.GROK_API_URL,
      {
        model: 'grok-3-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9, // High temp for question variety
        max_tokens: 8000
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const rawContent = response.data.choices[0].message.content;

    // Clean and parse JSON
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in Grok response');
    }

    const questions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from API');
    }

    res.json({
      success: true,
      questions,
      blueprint: blueprint.map(b => ({ topic: b.topic.name, count: b.count })),
      totalQuestions: questions.length,
      timeLimit: 25 * 60 // 25 minutes in seconds
    });
  } catch (err) {
    console.error('Test generation error:', err.message);

    // Fallback: return error with details
    if (err.response) {
      console.error('Grok API error:', err.response.data);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate test. Check your Grok API key.',
      error: err.message
    });
  }
};

const submitTest = async (req, res) => {
  try {
    const { questions, userAnswers, timeTaken, topics } = req.body;

    let score = 0;
    const results = questions.map((q, idx) => {
      const isCorrect = userAnswers[idx] === q.answer;
      if (isCorrect) score++;
      return {
        ...q,
        userAnswer: userAnswers[idx],
        isCorrect
      };
    });

    // Save to history
    await TestHistory.create({
      topics,
      questions,
      score,
      totalQuestions: questions.length,
      timeTaken
    });

    res.json({
      success: true,
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      timeTaken,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateTest, submitTest };