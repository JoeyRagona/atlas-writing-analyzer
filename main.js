const analyzeBtn = document.getElementById('analyzeBtn');
const textInput = document.getElementById('textInput');
const resultsDiv = document.getElementById('results');

// Pro writing tips pool (shuffled)
const proWritingTipsPool = [
  'Use short, punchy sentences (8–12 words).',
  'Start with a personal story or hook question.',
  'Show, don’t tell: use sensory, emotional language.',
  'Speak to one reader, not everyone.',
  'Cut filler words like “very,” “really,” and “just.”',
  'Use active voice to strengthen your message.',
  'Address the reader directly (use “you”).',
  'Keep paragraphs short for readability.'
];

analyzeBtn.addEventListener('click', () => {
  const text = textInput.value.trim();
  if (!text) return alert('Please enter some text.');
  resultsDiv.classList.remove('full');
  resultsDiv.innerHTML = '<p class="loading">Analyzing your copy...</p>';
  setTimeout(() => {
    const analysis = performDetailedAnalysis(text);
    renderResults(analysis);
  }, 200);
});

function performDetailedAnalysis(text) {
  const lower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const words = lower.split(/\s+/).length;
  let fullIssues = [];
  let fullSuggestions = [];
  let fullStrengths = [];
  let score = 100;

  // 1. Audience-first framing
  const af = analyzeAudienceFirst(text);
  fullIssues.push(...af.issues);
  fullSuggestions.push(...af.suggestions);
  score -= af.issues.length * 10;
  score += af.strengths.length * 5;

  // 2. Undesired tone (condescending, guilt-shaming)
  const ut = detectUndesiredTone(text);
  fullIssues.push(...ut.issues);
  fullSuggestions.push(...ut.suggestions);
  score -= ut.issues.length * 10;

  // 3. Jargon & clichés
  const j = detectJargon(text);
  fullIssues.push(...j.issues);
  fullSuggestions.push(...j.suggestions);
  score -= j.issues.length * 5;

  // 4. Expert-first/business-first perspective
  const bf = detectBusinessFirst(text);
  fullIssues.push(...bf.issues);
  fullSuggestions.push(...bf.suggestions);
  score -= bf.issues.length * 10;

  // 5. Transactional/results-driven language
  const tr = detectTransactionalTone(text);
  fullIssues.push(...tr.issues);
  fullSuggestions.push(...tr.suggestions);
  score -= tr.issues.length * 5;

  // Retain prior analyses
  const opening = analyzeOpening(text);
  const atlas = analyzeATLAS(text);
  const emo = analyzeEmotions(text);
  fullIssues.push(...opening.issues, ...atlas.issues, ...emo.issues);
  fullSuggestions.push(...opening.suggestions, ...atlas.suggestions, ...emo.suggestions);
  fullStrengths.push(...opening.strengths, ...atlas.strengths, ...emo.strengths);
  score -= (opening.issues.length + atlas.issues.length + emo.issues.length) * 5;
  score += fullStrengths.length * 2;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  return {
    score, words, sentences,
    issues: fullIssues.slice(0,3), fullIssues,
    suggestions: fullSuggestions.slice(0,3), fullSuggestions,
    strengths: fullStrengths.slice(0,2), fullStrengths
  };
}

// 1. Audience-first: flags copy that starts with 'we', 'our', 'I' vs 'you'
function analyzeAudienceFirst(text) {
  const issues = [];
  const suggestions = [];
  const strengths = [];
  const firstWords = text.trim().split(/\s+/).slice(0,2).join(' ').toLowerCase();
  if (/^(we|i|our|my)\b/.test(firstWords)) {
    issues.push('Business/expert-first opening');
    suggestions.push('Start from your audience’s perspective (use “you”).');
  } else {
    strengths.push('Audience-focused opening');
  }
  return { issues, suggestions, strengths };
}

// 2. Undesired tone detection
function detectUndesiredTone(text) {
  const issues = [];
  const suggestions = [];
  ['shame','guilt','should','must'].forEach(word => {
    if (text.toLowerCase().includes(word)) {
      issues.push('Potentially condescending or guilt-inducing tone');
      suggestions.push('Avoid making readers feel shamed or forced.');
    }
  });
  return { issues, suggestions, strengths: [] };
}

// 3. Jargon & clichés
function detectJargon(text) {
  const issues = [];
  const suggestions = [];
  const jargonList = ['synergy','leverage','world-class','best-in-class','cutting-edge','proprietary'];
  let found = jargonList.filter(w => text.toLowerCase().includes(w));
  if (found.length) {
    issues.push(`Overused jargon/clichés: ${found.join(', ')}`);
    suggestions.push('Use simple, specific language instead of jargon.');
  }
  return { issues, suggestions, strengths: [] };
}

// 4. Business-first perspective utilizes analyzeAudienceFirst
function detectBusinessFirst(text) {
  return analyzeAudienceFirst(text);
}

// 5. Transactional/results-driven language
function detectTransactionalTone(text) {
  const issues = [];
  const suggestions = [];
  const transactional = ['buy now','sign up','limited time','offer ends','get started'];
  let found = transactional.filter(phrase => text.toLowerCase().includes(phrase));
  if (found.length) {
    issues.push(`Transactional language detected: ${found.join(', ')}`);
    suggestions.push('Focus on connection and transformation, not just conversion.');
  }
  return { issues, suggestions, strengths: [] };
}

// Reuse analyzeOpening, analyzeATLAS, analyzeEmotions as before

function renderResults(a) {
  const cls = a.score < 60 ? 'needs-work' : a.score < 80 ? 'good' : 'excellent';
  const proTips = [...proWritingTipsPool].sort(() => 0.5 - Math.random()).slice(0,4);
  resultsDiv.innerHTML = `
    <div class="score ${cls}">${a.score}/100</div>
    <div class="label">${cls==='needs-work'? 'Needs Work' : cls==='good'? 'Good':'Excellent'}</div>
    <div>${a.words} words • ${a.sentences} sentences</div>

    <h3>What’s Hurting Your Score</h3>
    <ul class="feedback-list">
      ${a.issues.map(i=>`<li data-icon="⚠️">${i}</li>`).join('')||'<li>No major issues</li>'}
    </ul>

    <h3>Quick Wins — Try This Next</h3>
    <ul class="feedback-list">
      ${a.suggestions.map(s=>`<li data-icon="💡">${s}</li>`).join('')||'<li>Great job!</li>'}
    </ul>

    <h3>What’s Working</h3>
    <ul class="feedback-list">
      ${a.strengths.map(s=>`<li data-icon="✅">${s}</li>`).join('')||'<li>Clear copy detected</li>'}
    </ul>

    <h3>Pro Writing Tips</h3>
    <ul class="feedback-list">
      ${proTips.map(t=>`<li data-icon="✍️">${t}</li>`).join('')}
    </ul>

    <div class="toggle" onclick="resultsDiv.classList.toggle('full')">Show Full Analysis</div>
    <div class="detailed">
      <h3>All Issues</h3>
      <ul class="feedback-list">
        ${a.fullIssues.map(i=>`<li data-icon="⚠️">${i}</li>`).join('')||'<li>None</li>'}
      </ul>
      <h3>All Suggestions</h3>
      <ul class="feedback-list">
        ${a.fullSuggestions.map(s=>`<li data-icon="💡">${s}</li>`).join('')||'<li>None</li>'}
      </ul>
      <h3>All Strengths</h3>
      <ul class="feedback-list">
        ${a.fullStrengths.map(s=>`<li data-icon="✅">${s}</li>`).join('')||'<li>None</li>'}
      </ul>
    </div>
  `;
}
