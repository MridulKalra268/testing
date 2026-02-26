const Topic = require('../models/Topic');

const TOPIC_SEED_DATA = [
  {
    name: 'Simplification',
    slug: 'simplification',
    minQuestions: 1,
    maxQuestions: 3,
    patterns: ['BODMAS', 'Fractions & Decimals', 'Surds & Indices', 'Approximation']
  },
  {
    name: 'Number System',
    slug: 'number-system',
    minQuestions: 0,
    maxQuestions: 2,
    patterns: ['Divisibility Rules', 'LCM & HCF', 'Unit Digit', 'Remainders', 'Factors']
  },
  {
    name: 'Percentage',
    slug: 'percentage',
    minQuestions: 1,
    maxQuestions: 3,
    patterns: ['Percentage Change', 'Percentage of a value', 'Population problems', 'Income-Expenditure']
  },
  {
    name: 'SI & CI',
    slug: 'si-ci',
    minQuestions: 1,
    maxQuestions: 2,
    patterns: ['Simple Interest', 'Compound Interest', 'Difference SI & CI', 'Half-yearly/Quarterly CI']
  },
  {
    name: 'Profit & Loss, Discount',
    slug: 'profit-loss',
    minQuestions: 1,
    maxQuestions: 3,
    patterns: ['Profit & Loss %', 'Successive Discount', 'Marked Price', 'Dishonest Dealer', 'CP SP']
  },
  {
    name: 'Quadratic Equation',
    slug: 'quadratic',
    minQuestions: 1,
    maxQuestions: 2,
    patterns: ['Roots finding', 'Comparing two equations', 'Nature of roots', 'Sum & Product of roots']
  },
  {
    name: 'Time & Work',
    slug: 'time-work',
    minQuestions: 1,
    maxQuestions: 2,
    patterns: ['Efficiency method', 'LCM method', 'Alternate day work', 'Work & wages', 'Man-day concept']
  },
  {
    name: 'Pipes',
    slug: 'pipes',
    minQuestions: 0,
    maxQuestions: 1,
    patterns: ['Filling tank', 'Emptying tank', 'Pipes & Cisterns combined', 'Leakage problems']
  },
  {
    name: 'Ratio & Proportion',
    slug: 'ratio-proportion',
    minQuestions: 1,
    maxQuestions: 2,
    patterns: ['Basic ratio', 'Proportion', 'Continued proportion', 'Mixing ratios', 'Variation']
  },
  {
    name: 'Partnership & Ratio',
    slug: 'partnership',
    minQuestions: 0,
    maxQuestions: 2,
    patterns: ['Simple partnership', 'Compound partnership', 'Sleeping vs Active partner', 'Profit sharing']
  },
  {
    name: 'Data Interpretation',
    slug: 'data-interpretation',
    minQuestions: 1,
    maxQuestions: 2,
    patterns: ['Bar Graph', 'Line Chart', 'Pie Chart', 'Table DI', 'Caselet DI']
  },
  {
    name: 'Mensuration',
    slug: 'mensuration',
    minQuestions: 1,
    maxQuestions: 2,
    patterns: ['Area of 2D shapes', 'Volume of 3D shapes', 'Surface Area', 'Perimeter problems']
  },
  {
    name: 'Statistics',
    slug: 'statistics',
    minQuestions: 0,
    maxQuestions: 2,
    patterns: ['Mean', 'Median', 'Mode', 'Range', 'Standard Deviation']
  },
  {
    name: 'Average',
    slug: 'average',
    minQuestions: 1,
    maxQuestions: 1,
    patterns: ['Simple Average', 'Weighted Average', 'Average speed', 'Removing/Adding a member']
  },
  {
    name: 'Time, Speed, Distance',
    slug: 'time-speed-distance',
    minQuestions: 1,
    maxQuestions: 2,
    patterns: ['Basic TSD', 'Relative Speed', 'Trains', 'Boats & Streams', 'Circular Track']
  }
];

const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ active: true }).select('-__v');
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const seedTopics = async (req, res) => {
  try {
    await Topic.deleteMany({});
    const topics = await Topic.insertMany(TOPIC_SEED_DATA);
    res.json({ success: true, message: `${topics.length} topics seeded`, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllTopics, seedTopics };