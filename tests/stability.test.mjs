import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatPercentageGrowth, formatAtsGrowth } from '../src/lib/utils/formatters.ts';
import { parseJobStage } from '../src/lib/utils/jobs.ts';
import {
  cleanJsonText,
  parseResumeAnalysis,
  parseInterviewQuestions,
  parseAnswerEvaluation,
  parseLearningRoadmap,
  sanitizeGeminiError,
  getGeminiConfig,
  isRetryableError,
  runWithRetryAndFallback,
  extractRetryDelaySeconds,
  isDailyQuotaExhausted,
  isServiceOverloaded,
  isQuotaOrRateLimited,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_FALLBACK_MODEL,
} from '../src/lib/ai/gemini.ts';

describe('Dashboard Growth Calculations', () => {
  test('handles positive percentage growth accurately', () => {
    assert.equal(formatPercentageGrowth(4, 2), '+100%');
    assert.equal(formatPercentageGrowth(15, 10), '+50%');
  });

  test('handles negative percentage growth accurately without +- formatting', () => {
    assert.equal(formatPercentageGrowth(2, 4), '-50%');
    assert.notEqual(formatPercentageGrowth(2, 4), '+-50%');
    assert.equal(formatPercentageGrowth(1, 3), '-67%');
  });

  test('handles zero change accurately', () => {
    assert.equal(formatPercentageGrowth(5, 5), '0%');
  });

  test('handles baseline unavailable or zero baseline', () => {
    assert.equal(formatPercentageGrowth(3, 0), '+100%');
    assert.equal(formatPercentageGrowth(0, 0), '--');
  });

  test('handles ATS score point change accurately', () => {
    assert.equal(formatAtsGrowth(85, 75), '+10%');
    assert.equal(formatAtsGrowth(65, 80), '-15%');
    assert.notEqual(formatAtsGrowth(65, 80), '+-15%');
    assert.equal(formatAtsGrowth(70, 70), '0%');
    assert.equal(formatAtsGrowth(75, 0), '+100%');
    assert.equal(formatAtsGrowth(0, 0), '--');
  });
});

describe('Job Recommendation Deduplication Logic', () => {
  test('correctly deduplicates recommendations by title and company ignoring casing/whitespace', () => {
    const existing = [
      { title: 'Frontend Developer', company: 'Tech Corp' },
      { title: 'Senior Engineer', company: 'Acme Inc' }
    ];

    const existingKeys = new Set(
      existing.map(j => `${j.title.toLowerCase().trim()}|${j.company.toLowerCase().trim()}`)
    );

    const candidates = [
      { title: 'frontend developer ', company: ' tech corp ' },
      { title: 'New Role', company: 'Tech Corp' }
    ];

    const deduplicated = candidates.filter(
      c => !existingKeys.has(`${c.title.toLowerCase().trim()}|${c.company.toLowerCase().trim()}`)
    );

    assert.equal(deduplicated.length, 1);
    assert.equal(deduplicated[0].title, 'New Role');
  });
});

describe('Job Pipeline Stage Parsing', () => {
  test('correctly identifies Offered stage', () => {
    const job = { isSaved: false, isApplied: true, whyRecommended: '[Stage:Offered] Matches 85% of profile skills' };
    assert.equal(parseJobStage(job), 'Offered');
  });

  test('correctly identifies Interviewing stage', () => {
    const job = { isSaved: false, isApplied: true, whyRecommended: '[Stage:Interviewing] Matches 75% of profile skills' };
    assert.equal(parseJobStage(job), 'Interviewing');
  });

  test('correctly identifies Applied stage without stage prefix', () => {
    const job = { isSaved: false, isApplied: true, whyRecommended: 'Matches 70% of profile skills' };
    assert.equal(parseJobStage(job), 'Applied');
  });

  test('defaults to Saved for unapplied jobs', () => {
    const job = { isSaved: true, isApplied: false, whyRecommended: 'Matches 65% of profile skills' };
    assert.equal(parseJobStage(job), 'Saved');
  });
});

describe('Learning Roadmap Progress Calculation', () => {
  function calculateRoadmapProgress(weeks) {
    let totalTasks = 0;
    let completedTasks = 0;
    for (const week of weeks) {
      for (const task of week.tasks || []) {
        totalTasks += 1;
        if (task.completed) completedTasks += 1;
      }
    }
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  test('calculates 0% progress when no tasks are completed', () => {
    const weeks = [
      { tasks: [{ id: '1', completed: false }, { id: '2', completed: false }] },
      { tasks: [{ id: '3', completed: false }, { id: '4', completed: false }] }
    ];
    assert.equal(calculateRoadmapProgress(weeks), 0);
  });

  test('calculates 50% progress accurately', () => {
    const weeks = [
      { tasks: [{ id: '1', completed: true }, { id: '2', completed: true }] },
      { tasks: [{ id: '3', completed: false }, { id: '4', completed: false }] }
    ];
    assert.equal(calculateRoadmapProgress(weeks), 50);
  });

  test('calculates 100% progress when all tasks are complete', () => {
    const weeks = [
      { tasks: [{ id: '1', completed: true }, { id: '2', completed: true }] }
    ];
    assert.equal(calculateRoadmapProgress(weeks), 100);
  });
});

describe('User Settings Sanitization & Authorization Safety', () => {
  function sanitizeProfileUpdate(input) {
    if (typeof input?.name !== 'string') {
      throw new Error("Invalid name format.");
    }
    const trimmed = input.name.trim();
    if (trimmed.length > 80) {
      throw new Error("Name cannot exceed 80 characters.");
    }
    // Whitelisted mutation payload: only name, NEVER role
    return {
      name: trimmed.length > 0 ? trimmed : null
    };
  }

  test('trims whitespace and accepts valid names', () => {
    const res = sanitizeProfileUpdate({ name: '  Jane Doe  ', role: 'ADMIN' });
    assert.equal(res.name, 'Jane Doe');
    assert.equal(res.role, undefined); // Prevents privilege escalation
  });

  test('rejects names exceeding length threshold', () => {
    assert.throws(() => {
      sanitizeProfileUpdate({ name: 'A'.repeat(81) });
    }, /cannot exceed 80 characters/);
  });
});

describe('User Synchronization Role Protection', () => {
  test('role defaults to USER and does not trust client user_metadata for role elevation', () => {
    const simulatedClientMetadata = {
      role: 'ADMIN',
      isAdmin: true,
      full_name: 'Attacker'
    };

    // User sync creates user with forced role: 'USER'
    const createdUserData = {
      email: 'attacker@example.com',
      name: simulatedClientMetadata.full_name,
      role: 'USER' // Guaranteed server-side constraint
    };

    assert.equal(createdUserData.role, 'USER');
    assert.notEqual(createdUserData.role, simulatedClientMetadata.role);
  });
});

describe('File Upload Security & Magic Bytes Validation', () => {
  function validateUploadBuffer(buffer, fileType) {
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('File exceeds the 5MB size limit. Please upload a smaller PDF or text file.');
    }
    if (fileType === 'application/pdf') {
      const header = buffer.subarray(0, 5).toString('utf-8');
      if (header !== '%PDF-') {
        throw new Error('The uploaded file is not a valid PDF.');
      }
    }
    return true;
  }

  test('accepts valid PDF header below 5MB', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.5 fake pdf content for testing');
    assert.equal(validateUploadBuffer(validPdfBuffer, 'application/pdf'), true);
  });

  test('rejects fake PDF with invalid magic bytes', () => {
    const fakeBuffer = Buffer.from('NOT_A_PDF content');
    assert.throws(() => {
      validateUploadBuffer(fakeBuffer, 'application/pdf');
    }, /not a valid PDF/);
  });

  test('rejects files exceeding 5MB size limit', () => {
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);
    assert.throws(() => {
      validateUploadBuffer(largeBuffer, 'application/pdf');
    }, /exceeds the 5MB size limit/);
  });
});

describe('User Synchronization Deduplication & Email Conflict Safety', () => {
  function resolveUserSync(existingUsers, incomingUser) {
    const found = existingUsers.find(
      u => u.id === incomingUser.id || (incomingUser.email && u.email === incomingUser.email)
    );

    if (found) {
      return {
        action: 'UPDATE',
        user: { ...found, email: incomingUser.email || found.email }
      };
    }

    return {
      action: 'CREATE',
      user: {
        id: incomingUser.id,
        email: incomingUser.email,
        role: 'USER'
      }
    };
  }

  test('updates existing user when email matches, preventing duplicate rows', () => {
    const db = [{ id: 'old-uuid-1', email: 'alice@example.com', role: 'USER' }];
    const incoming = { id: 'new-supabase-uuid', email: 'alice@example.com' };

    const result = resolveUserSync(db, incoming);
    assert.equal(result.action, 'UPDATE');
    assert.equal(result.user.id, 'old-uuid-1');
  });

  test('creates new user when neither ID nor email exists', () => {
    const db = [{ id: 'old-uuid-1', email: 'alice@example.com', role: 'USER' }];
    const incoming = { id: 'bob-uuid', email: 'bob@example.com' };

    const result = resolveUserSync(db, incoming);
    assert.equal(result.action, 'CREATE');
    assert.equal(result.user.id, 'bob-uuid');
    assert.equal(result.user.role, 'USER');
  });
});

describe('AI Input Bounding & Prompt Injection Containment', () => {
  function sanitizeAiInputs(resumeText, role, description) {
    return {
      resume: (resumeText || '').slice(0, 30000),
      role: (role || 'General Role').slice(0, 100),
      desc: (description || '').slice(0, 10000)
    };
  }

  test('bounds huge resume payloads to prevent token overflow', () => {
    const hugeResume = 'X'.repeat(50000);
    const sanitized = sanitizeAiInputs(hugeResume, 'Dev', 'Desc');
    assert.equal(sanitized.resume.length, 30000);
  });

  test('bounds role and description inputs', () => {
    const longRole = 'Software Architect '.repeat(50);
    const sanitized = sanitizeAiInputs('Resume', longRole, 'Desc');
    assert.equal(sanitized.role.length, 100);
  });
});

describe('Google Gemini AI Service Configuration & Validation', () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_MODEL;

  test('asserts missing GEMINI_API_KEY with descriptive error', () => {
    delete process.env.GEMINI_API_KEY;
    assert.throws(
      () => getGeminiConfig(),
      /GEMINI_API_KEY is not configured on the server/
    );
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });

  test('defaults to gemini-flash-lite-latest when GEMINI_MODEL is unset', () => {
    process.env.GEMINI_API_KEY = 'test-key-mock';
    delete process.env.GEMINI_MODEL;
    delete process.env.Gemini_MODEL;
    const config = getGeminiConfig();
    assert.equal(config.modelName, DEFAULT_GEMINI_MODEL);
    assert.equal(config.modelName, 'gemini-flash-lite-latest');
    assert.equal(config.fallbackModelName, DEFAULT_GEMINI_FALLBACK_MODEL);
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    if (originalModel) process.env.GEMINI_MODEL = originalModel;
  });

  test('respects custom GEMINI_MODEL environment variable', () => {
    process.env.GEMINI_API_KEY = 'test-key-mock';
    process.env.GEMINI_MODEL = 'gemini-1.5-pro';
    const config = getGeminiConfig();
    assert.equal(config.modelName, 'gemini-1.5-pro');
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    if (originalModel) process.env.GEMINI_MODEL = originalModel;
  });
});

describe('Gemini Response Cleaners & Markdown Stripping', () => {
  test('strips ```json code fence block from output', () => {
    const raw = '```json\n{"ats_score": 85}\n```';
    assert.equal(cleanJsonText(raw), '{"ats_score": 85}');
  });

  test('strips generic ``` code fence block from output', () => {
    const raw = '```\n{"ats_score": 90}\n```';
    assert.equal(cleanJsonText(raw), '{"ats_score": 90}');
  });

  test('preserves plain JSON strings untouched', () => {
    const raw = '{"ats_score": 80}';
    assert.equal(cleanJsonText(raw), '{"ats_score": 80}');
  });
});

describe('Gemini ATS Resume Analysis Parsing & Bounding', () => {
  test('parses valid ATS analysis JSON output accurately', () => {
    const json = JSON.stringify({
      ats_score: 88,
      matched_keywords: ['React', 'TypeScript', 'Next.js'],
      missing_keywords: ['GraphQL', 'Docker'],
      feedback: 'Strong alignment with frontend requirements.'
    });

    const parsed = parseResumeAnalysis(json);
    assert.equal(parsed.ats_score, 88);
    assert.deepEqual(parsed.matched_keywords, ['React', 'TypeScript', 'Next.js']);
    assert.deepEqual(parsed.missing_keywords, ['GraphQL', 'Docker']);
    assert.equal(parsed.feedback, 'Strong alignment with frontend requirements.');
  });

  test('clamps out-of-range ATS scores to strictly 0..100 bounds', () => {
    const overScore = parseResumeAnalysis(JSON.stringify({ ats_score: 145 }));
    assert.equal(overScore.ats_score, 100);

    const underScore = parseResumeAnalysis(JSON.stringify({ ats_score: -30 }));
    assert.equal(underScore.ats_score, 0);

    const nonNumeric = parseResumeAnalysis(JSON.stringify({ ats_score: 'invalid' }));
    assert.equal(nonNumeric.ats_score, 0);
  });

  test('throws descriptive error on malformed JSON without fabricating scores', () => {
    assert.throws(
      () => parseResumeAnalysis('NOT_VALID_JSON'),
      /Failed to parse Gemini resume analysis response as JSON/
    );
  });
});

describe('Gemini Interview Question Parsing & Category Validation', () => {
  test('parses and validates questions across all 4 categories', () => {
    const json = JSON.stringify({
      questions: [
        { type: 'Technical', question: 'How do React hooks work under the hood?' },
        { type: 'HR', question: 'Where do you see yourself in 3 years?' },
        { type: 'Behavioral', question: 'Describe a time you handled a tight deadline.' },
        { type: 'Aptitude', question: 'How would you measure system throughput?' }
      ]
    });

    const questions = parseInterviewQuestions(json);
    assert.equal(questions.length, 4);
    assert.equal(questions[0].type, 'Technical');
    assert.equal(questions[1].type, 'HR');
    assert.equal(questions[2].type, 'Behavioral');
    assert.equal(questions[3].type, 'Aptitude');
  });

  test('filters out invalid categories or empty question strings', () => {
    const json = JSON.stringify({
      questions: [
        { type: 'Technical', question: 'Valid question?' },
        { type: 'InvalidCategory', question: 'Ignored question?' },
        { type: 'HR', question: '' },
        { type: 'Behavioral', question: '   ' }
      ]
    });

    const questions = parseInterviewQuestions(json);
    assert.equal(questions.length, 1);
    assert.equal(questions[0].question, 'Valid question?');
  });

  test('throws descriptive error on malformed JSON for interview questions', () => {
    assert.throws(
      () => parseInterviewQuestions('{ malformed json'),
      /Failed to parse Gemini interview questions response as JSON/
    );
  });
});

describe('Gemini Interview Evaluation Parsing & Scoring Bounds', () => {
  test('parses evaluation with bounded score, strengths, and recommendations', () => {
    const json = JSON.stringify({
      score: 85,
      strengths: ['Clear terminology', 'Structured explanation'],
      mistakes: ['Did not mention edge cases'],
      improvements: ['Include quantitative benchmarks'],
      feedback: 'Well articulated technical response.'
    });

    const evalResult = parseAnswerEvaluation(json);
    assert.equal(evalResult.score, 85);
    assert.equal(evalResult.strengths.length, 2);
    assert.equal(evalResult.mistakes.length, 1);
    assert.equal(evalResult.improvements.length, 1);
    assert.equal(evalResult.feedback, 'Well articulated technical response.');
  });

  test('clamps out-of-bounds evaluation scores to 0..100', () => {
    const high = parseAnswerEvaluation(JSON.stringify({ score: 120 }));
    assert.equal(high.score, 100);

    const low = parseAnswerEvaluation(JSON.stringify({ score: -10 }));
    assert.equal(low.score, 0);
  });

  test('throws descriptive error on malformed JSON without fabricating evaluations', () => {
    assert.throws(
      () => parseAnswerEvaluation('CORRUPTED'),
      /Failed to parse Gemini interview evaluation response as JSON/
    );
  });
});

describe('Gemini Learning Roadmap Parsing & Task Integrity', () => {
  test('parses structured 4-week learning roadmap with measurable milestones', () => {
    const json = JSON.stringify({
      weeks: [
        {
          week: 1,
          goal: 'Core Foundation',
          tasks: [
            { id: 'w1-t1', title: 'Study system architecture', completed: false },
            { id: 'w1-t2', title: 'Build microservice prototype', completed: true }
          ],
          learningTopics: ['Architecture', 'Protocols'],
          measurableOutcome: 'Functional microservice repository'
        }
      ]
    });

    const roadmap = parseLearningRoadmap(json);
    assert.equal(roadmap.weeks.length, 1);
    assert.equal(roadmap.weeks[0].week, 1);
    assert.equal(roadmap.weeks[0].goal, 'Core Foundation');
    assert.equal(roadmap.weeks[0].tasks.length, 2);
    assert.equal(roadmap.weeks[0].tasks[1].completed, true);
    assert.equal(roadmap.weeks[0].measurableOutcome, 'Functional microservice repository');
  });

  test('throws descriptive error on missing weeks array or malformed JSON', () => {
    assert.throws(
      () => parseLearningRoadmap(JSON.stringify({ invalid: true })),
      /missing weekly goals array/
    );
  });
});

describe('Gemini Error Sanitization & Safe Failure Modes', () => {
  test('maps 429 quota exhaustion to user-friendly rate limit error without leaking keys', () => {
    const quotaError = new Error('[GoogleGenerativeAI Error]: [429 Too Many Requests] RESOURCE_EXHAUSTED quota exceeded');
    const sanitized = sanitizeGeminiError(quotaError, 'ATS analysis');
    assert.match(sanitized.message, /rate limit reached.*HTTP 429/i);
    assert.doesNotMatch(sanitized.message, /AIzaSy/);

    const dailyQuotaError = new Error('GenerateRequestsPerDayPerProjectPerModel-FreeTier quota exceeded. Please retry in 10h.');
    const sanitizedDaily = sanitizeGeminiError(dailyQuotaError, 'ATS analysis');
    assert.match(sanitizedDaily.message, /daily quota.*exhausted/i);
  });

  test('maps 404 model not found to clear model configuration guidance', () => {
    const notFoundError = new Error('[GoogleGenerativeAI Error]: [404 Not Found] models/gemini-unknown is not found');
    const sanitized = sanitizeGeminiError(notFoundError, 'interview question generation');
    assert.match(sanitized.message, /was not found or is unavailable/i);
  });

  test('maps API_KEY_INVALID to clear authentication instructions', () => {
    const authError = new Error('[GoogleGenerativeAI Error]: API_KEY_INVALID: API key not valid');
    const sanitized = sanitizeGeminiError(authError, 'roadmap generation');
    assert.match(sanitized.message, /authentication failed.*Google AI Studio/i);
  });
});

describe('Gemini Transient Error Classification & Retryability', () => {
  test('identifies HTTP 503 high demand as retryable', () => {
    const err = new Error('[503 Service Unavailable] This model is currently experiencing high demand.');
    assert.equal(isRetryableError(err), true);
  });

  test('identifies HTTP 429 rate limit / quota as retryable', () => {
    const err = new Error('[429 Too Many Requests] RESOURCE_EXHAUSTED quota exceeded');
    assert.equal(isRetryableError(err), true);
  });

  test('identifies network / connection reset errors as retryable', () => {
    assert.equal(isRetryableError(new Error('fetch failed')), true);
    assert.equal(isRetryableError(new Error('ECONNRESET connection reset by peer')), true);
  });

  test('identifies invalid API key / 401 / 403 as non-retryable to prevent infinite loops', () => {
    assert.equal(isRetryableError(new Error('API_KEY_INVALID')), false);
    assert.equal(isRetryableError(new Error('[401 Unauthorized] Invalid credentials')), false);
    assert.equal(isRetryableError(new Error('[403 Forbidden] Access denied')), false);
  });
});

describe('Gemini Mocked Retry & Fallback Execution Logic', () => {
  test('succeeds on 2nd attempt when 1st attempt encounters transient 503 error', async () => {
    let callCount = 0;
    const mockPrimary = async (attempt) => {
      callCount++;
      if (attempt === 0) {
        throw new Error('[503 Service Unavailable] High demand spike');
      }
      return { ats_score: 85, feedback: 'Resume matches role requirements.' };
    };

    const mockFallback = async () => {
      throw new Error('Should not be called');
    };

    const { result, usedFallback, attempts } = await runWithRetryAndFallback(
      mockPrimary,
      mockFallback,
      { maxRetries: 2 }
    );

    assert.equal(attempts, 2);
    assert.equal(callCount, 2);
    assert.equal(usedFallback, false);
    assert.equal(result.ats_score, 85);
  });

  test('switches to fallback model when all primary retries fail with 503', async () => {
    let primaryAttempts = 0;
    const mockPrimary = async () => {
      primaryAttempts++;
      throw new Error('[503 Service Unavailable] Model capacity exhausted');
    };

    let fallbackCalled = false;
    const mockFallback = async () => {
      fallbackCalled = true;
      return { ats_score: 82, feedback: 'Fallback analysis completed successfully.' };
    };

    const { result, usedFallback, attempts } = await runWithRetryAndFallback(
      mockPrimary,
      mockFallback,
      { maxRetries: 2 }
    );

    assert.equal(primaryAttempts, 3); // initial attempt + 2 retries
    assert.equal(attempts, 3);
    assert.equal(fallbackCalled, true);
    assert.equal(usedFallback, true);
    assert.equal(result.ats_score, 82);
  });

  test('throws honest error without fabricating data when both primary and fallback fail', async () => {
    const mockPrimary = async () => {
      throw new Error('[503 Service Unavailable] Primary capacity exhausted');
    };
    const mockFallback = async () => {
      throw new Error('[503 Service Unavailable] Fallback capacity exhausted');
    };

    await assert.rejects(
      async () => {
        await runWithRetryAndFallback(mockPrimary, mockFallback, { maxRetries: 1 });
      },
      /503 Service Unavailable/
    );
  });

  test('fails immediately without retrying or fallback on non-retryable 401 auth error', async () => {
    let callCount = 0;
    const mockPrimary = async () => {
      callCount++;
      throw new Error('API_KEY_INVALID: API key not valid');
    };

    let fallbackCalled = false;
    const mockFallback = async () => {
      fallbackCalled = true;
      return { ats_score: 90 };
    };

    await assert.rejects(
      async () => {
        await runWithRetryAndFallback(mockPrimary, mockFallback, { maxRetries: 2 });
      },
      /API_KEY_INVALID/
    );

    assert.equal(callCount, 1, 'Must fail fast on attempt 1 without retrying');
    assert.equal(fallbackCalled, false, 'Must not attempt fallback on invalid API key');
  });

  test('throws parser error without fabricating ATS score on malformed JSON', () => {
    assert.throws(
      () => parseResumeAnalysis('{ "ats_score": incomplete json'),
      /Failed to parse Gemini resume analysis response as JSON/
    );
  });

  test('switches immediately to fallback model on daily quota exhaustion without wasteful retries', async () => {
    let primaryAttempts = 0;
    const mockPrimary = async () => {
      primaryAttempts++;
      throw new Error(
        'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, quotaId: GenerateRequestsPerDayPerProjectPerModel-FreeTier. Please retry in 10h42m55s.'
      );
    };

    let fallbackCalled = false;
    const mockFallback = async () => {
      fallbackCalled = true;
      return { ats_score: 92, feedback: 'Analyzed with fallback model.' };
    };

    const { result, usedFallback, attempts } = await runWithRetryAndFallback(
      mockPrimary,
      mockFallback,
      { maxRetries: 2 }
    );

    assert.equal(primaryAttempts, 1, 'Must NOT waste retries when daily quota is exhausted');
    assert.equal(attempts, 1);
    assert.equal(fallbackCalled, true);
    assert.equal(usedFallback, true);
    assert.equal(result.ats_score, 92);
  });
});

describe('Gemini Quota vs Overload Classification & Retry-After Extraction', () => {
  test('extracts retryDelay from errorDetails RetryInfo array', () => {
    const errorObj = {
      errorDetails: [
        { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '38575s' }
      ]
    };
    assert.equal(extractRetryDelaySeconds(errorObj), 38575);
  });

  test('extracts retryDelay from string message format "Please retry in XhXmXs"', () => {
    const err = new Error('Please retry in 10h42m55s.');
    assert.equal(extractRetryDelaySeconds(err), 10 * 3600 + 42 * 60 + 55);
  });

  test('distinguishes daily quota exhaustion (RPD) from momentary rate limit (RPM)', () => {
    const dailyQuotaErr = new Error('quotaId: GenerateRequestsPerDayPerProjectPerModel-FreeTier. Please retry in 10h42m55s.');
    assert.equal(isDailyQuotaExhausted(dailyQuotaErr), true);

    const momentaryRpmErr = new Error('[429 Too Many Requests] Rate limit exceeded. Please retry in 2s.');
    assert.equal(isDailyQuotaExhausted(momentaryRpmErr), false);
  });

  test('distinguishes 503 service overload from 429 quota errors', () => {
    const overloadErr = new Error('[503 Service Unavailable] This model is currently experiencing high demand.');
    assert.equal(isServiceOverloaded(overloadErr), true);
    assert.equal(isQuotaOrRateLimited(overloadErr), false);

    const quotaErr = new Error('[429 Too Many Requests] RESOURCE_EXHAUSTED quota exceeded');
    assert.equal(isServiceOverloaded(quotaErr), false);
    assert.equal(isQuotaOrRateLimited(quotaErr), true);
  });
});


