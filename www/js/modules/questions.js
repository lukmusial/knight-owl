/**
 * Questions Module
 * Manages Polish vocabulary and grammar questions
 * Extensible: Use addQuestions() to add custom question sets
 */

const Questions = (function() {
  // Internal question storage
  let questions = [];
  let usedQuestionIds = new Set();

  /**
   * Initialize with default questions from data files
   */
  function init() {
    questions = [];
    usedQuestionIds.clear();

    // Load vocabulary questions if available
    if (typeof VOCABULARY_QUESTIONS !== 'undefined') {
      questions = questions.concat(VOCABULARY_QUESTIONS);
    }

    // Load reverse vocabulary questions if available
    if (typeof VOCABULARY_REVERSE_QUESTIONS !== 'undefined') {
      questions = questions.concat(VOCABULARY_REVERSE_QUESTIONS);
    }

    // Load grammar questions if available
    if (typeof GRAMMAR_QUESTIONS !== 'undefined') {
      questions = questions.concat(GRAMMAR_QUESTIONS);
    }
  }

  /**
   * Add new questions to the database
   * @param {Array} questionSet - Array of question objects
   */
  function addQuestions(questionSet) {
    if (!Array.isArray(questionSet)) {
      console.error('addQuestions expects an array');
      return;
    }

    questionSet.forEach(q => {
      // Validate question structure
      if (validateQuestion(q)) {
        // Avoid duplicates
        if (!questions.find(existing => existing.id === q.id)) {
          questions.push(q);
        }
      }
    });
  }

  /**
   * Validate question has required fields
   * @param {Object} question - Question to validate
   * @returns {boolean} Whether question is valid
   */
  function validateQuestion(question) {
    const required = ['id', 'difficulty', 'category', 'prompt', 'options', 'correctIndex'];
    return required.every(field => question.hasOwnProperty(field));
  }

  /**
   * Get a random question matching criteria
   * @param {number} difficulty - 1 (easy), 2 (medium), or 3 (hard)
   * @param {string} category - 'vocabulary', 'grammar', or null for any
   * @param {boolean} allowRepeats - Whether to allow previously used questions
   * @returns {Object|null} A question object or null if none available
   */
  function getQuestion(difficulty, category = null, allowRepeats = false) {
    let available = questions.filter(q => {
      // Match difficulty (allow +/- 1 for flexibility)
      const diffMatch = Math.abs(q.difficulty - difficulty) <= 1;

      // Match category if specified
      const catMatch = !category || q.category === category;

      // Check if already used (if not allowing repeats)
      const notUsed = allowRepeats || !usedQuestionIds.has(q.id);

      return diffMatch && catMatch && notUsed;
    });

    // If no unused questions, allow repeats
    if (available.length === 0 && !allowRepeats) {
      return getQuestion(difficulty, category, true);
    }

    // If still no questions, broaden difficulty range
    if (available.length === 0) {
      available = questions.filter(q => {
        const catMatch = !category || q.category === category;
        return catMatch;
      });
    }

    if (available.length === 0) {
      return null;
    }

    // Prefer exact difficulty match
    const exactMatch = available.filter(q => q.difficulty === difficulty);
    if (exactMatch.length > 0) {
      available = exactMatch;
    }

    // Select random question
    const selected = available[Math.floor(Math.random() * available.length)];
    usedQuestionIds.add(selected.id);

    // Shuffle options and track correct answer
    const correctAnswer = selected.options[selected.correctIndex];
    const shuffledOptions = [...selected.options];

    // Fisher-Yates shuffle
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    // Find new index of correct answer
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

    return {
      ...selected,
      options: shuffledOptions,
      correctIndex: newCorrectIndex
    };
  }

  /**
   * Get a question specifically for the dragon boss (harder questions)
   * @returns {Object|null} A hard question
   */
  function getDragonQuestion() {
    return getQuestion(3, null, true); // Allow repeats for boss
  }

  /**
   * Check if an answer is correct
   * @param {Object} question - The question object
   * @param {number} answerIndex - The index of the selected answer
   * @returns {boolean} Whether the answer is correct
   */
  function checkAnswer(question, answerIndex) {
    return question.correctIndex === answerIndex;
  }

  /**
   * Get all available categories
   * @returns {Array} List of unique category names
   */
  function getCategories() {
    const categories = new Set(questions.map(q => q.category));
    return Array.from(categories);
  }

  /**
   * Get question count by difficulty
   * @returns {Object} Counts per difficulty level
   */
  function getQuestionStats() {
    return {
      total: questions.length,
      easy: questions.filter(q => q.difficulty === 1).length,
      medium: questions.filter(q => q.difficulty === 2).length,
      hard: questions.filter(q => q.difficulty === 3).length,
      vocabulary: questions.filter(q => q.category === 'vocabulary').length,
      vocabulary_reverse: questions.filter(q => q.category === 'vocabulary_reverse').length,
      grammar: questions.filter(q => q.category === 'grammar').length,
      used: usedQuestionIds.size
    };
  }

  /**
   * Reset used questions (for new game)
   */
  function resetUsed() {
    usedQuestionIds.clear();
  }

  /**
   * Get used question IDs (for save/load)
   * @returns {Array} Array of used question IDs
   */
  function getUsedIds() {
    return Array.from(usedQuestionIds);
  }

  /**
   * Set used question IDs (for save/load)
   * @param {Array} ids - Array of question IDs
   */
  function setUsedIds(ids) {
    usedQuestionIds = new Set(ids);
  }

  /**
   * Calculate difficulty based on dungeon depth
   * @param {number} depth - Current room depth
   * @returns {number} Difficulty level 1-3
   */
  function getDifficultyForDepth(depth) {
    if (depth <= 7) return 1;  // Easy
    if (depth <= 14) return 2; // Medium
    return 3; // Hard
  }

  // Public API
  return {
    init,
    addQuestions,
    getQuestion,
    getDragonQuestion,
    checkAnswer,
    getCategories,
    getQuestionStats,
    resetUsed,
    getUsedIds,
    setUsedIds,
    getDifficultyForDepth
  };
})();

// Initialize on load
if (typeof window !== 'undefined') {
  // Browser environment - wait for data to load
  document.addEventListener('DOMContentLoaded', () => {
    Questions.init();
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Questions;
}
