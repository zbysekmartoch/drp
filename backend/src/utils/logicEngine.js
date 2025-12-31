/**
 * Form Logic Engine
 * Evaluates conditional rules for questionnaire display logic
 */

/**
 * Available condition operators
 */
const OPERATORS = {
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>': (a, b) => Number(a) > Number(b),
  '<': (a, b) => Number(a) < Number(b),
  '>=': (a, b) => Number(a) >= Number(b),
  '<=': (a, b) => Number(a) <= Number(b),
  'in': (a, b) => Array.isArray(b) && b.includes(a),
  'not_in': (a, b) => Array.isArray(b) && !b.includes(a),
  'isEmpty': (a) => a === null || a === undefined || a === '' || (Array.isArray(a) && a.length === 0),
  'notEmpty': (a) => a !== null && a !== undefined && a !== '' && (!Array.isArray(a) || a.length > 0),
  'contains': (a, b) => Array.isArray(a) && a.includes(b),
  'not_contains': (a, b) => !Array.isArray(a) || !a.includes(b)
};

/**
 * Evaluate a single condition
 */
const evaluateCondition = (condition, answers) => {
  const { questionId, operator, value } = condition;
  const answer = answers[questionId];
  
  if (!OPERATORS[operator]) {
    console.warn(`Unknown operator: ${operator}`);
    return false;
  }
  
  // Unary operators
  if (operator === 'isEmpty' || operator === 'notEmpty') {
    return OPERATORS[operator](answer);
  }
  
  return OPERATORS[operator](answer, value);
};

/**
 * Evaluate a group of conditions with AND/OR logic
 */
const evaluateConditionGroup = (group, answers) => {
  const { conditions, logic = 'and' } = group;
  
  if (!conditions || conditions.length === 0) {
    return true;
  }
  
  if (logic === 'or') {
    return conditions.some(cond => {
      if (cond.conditions) {
        return evaluateConditionGroup(cond, answers);
      }
      return evaluateCondition(cond, answers);
    });
  }
  
  // Default: AND logic
  return conditions.every(cond => {
    if (cond.conditions) {
      return evaluateConditionGroup(cond, answers);
    }
    return evaluateCondition(cond, answers);
  });
};

/**
 * Evaluate all rules and return visibility/state for each question and block
 */
const evaluateRules = (rules, answers) => {
  const result = {
    hiddenBlocks: new Set(),
    hiddenQuestions: new Set(),
    disabledQuestions: new Set(),
    requiredQuestions: new Set(),
    clearedQuestions: new Set()
  };
  
  if (!rules || !Array.isArray(rules)) {
    return result;
  }
  
  for (const rule of rules) {
    const { condition, actions } = rule;
    
    if (!condition || !actions) {
      continue;
    }
    
    const conditionMet = condition.conditions 
      ? evaluateConditionGroup(condition, answers)
      : evaluateCondition(condition, answers);
    
    if (conditionMet) {
      for (const action of actions) {
        const { type, target, targetType = 'question' } = action;
        
        switch (type) {
          case 'hide':
            if (targetType === 'block') {
              result.hiddenBlocks.add(target);
            } else {
              result.hiddenQuestions.add(target);
            }
            break;
          case 'show':
            if (targetType === 'block') {
              result.hiddenBlocks.delete(target);
            } else {
              result.hiddenQuestions.delete(target);
            }
            break;
          case 'disable':
            result.disabledQuestions.add(target);
            break;
          case 'enable':
            result.disabledQuestions.delete(target);
            break;
          case 'require':
            result.requiredQuestions.add(target);
            break;
          case 'unrequire':
            result.requiredQuestions.delete(target);
            break;
          case 'clear':
            result.clearedQuestions.add(target);
            break;
        }
      }
    }
  }
  
  return {
    hiddenBlocks: Array.from(result.hiddenBlocks),
    hiddenQuestions: Array.from(result.hiddenQuestions),
    disabledQuestions: Array.from(result.disabledQuestions),
    requiredQuestions: Array.from(result.requiredQuestions),
    clearedQuestions: Array.from(result.clearedQuestions)
  };
};

/**
 * Get all visible questions based on current answers
 */
const getVisibleQuestions = (definition, answers) => {
  const { blocks, logic } = definition;
  const ruleResult = evaluateRules(logic, answers);
  
  const visibleQuestions = [];
  
  for (const block of blocks) {
    if (ruleResult.hiddenBlocks.includes(block.id)) {
      continue;
    }
    
    for (const question of block.questions) {
      if (!ruleResult.hiddenQuestions.includes(question.id)) {
        visibleQuestions.push({
          ...question,
          blockId: block.id,
          blockTitle: block.title,
          isDisabled: ruleResult.disabledQuestions.includes(question.id),
          isRequired: question.required || ruleResult.requiredQuestions.includes(question.id)
        });
      }
    }
  }
  
  return visibleQuestions;
};

/**
 * Validate answers against required fields
 */
const validateAnswers = (definition, answers) => {
  const visibleQuestions = getVisibleQuestions(definition, answers);
  const errors = [];
  
  for (const question of visibleQuestions) {
    if (question.isRequired && !question.isDisabled) {
      const answer = answers[question.id];
      const isEmpty = answer === null || 
                      answer === undefined || 
                      answer === '' || 
                      (Array.isArray(answer) && answer.length === 0);
      
      if (isEmpty) {
        errors.push({
          questionId: question.id,
          blockId: question.blockId,
          message: `Pole "${question.label || question.id}" je povinné`
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  evaluateCondition,
  evaluateConditionGroup,
  evaluateRules,
  getVisibleQuestions,
  validateAnswers
};
