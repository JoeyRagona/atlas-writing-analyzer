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
  if (!text) {
    alert('Please enter some text.');
    return;
  }
  // Clear previous
  resultsDiv.classList.remove('full');
  // Show loading then run analysis
  resultsDiv.innerHTML = '<p class="loading">Analyzing your copy...</p>';
  setTimeout(() => {
    try {
      const analysis = performDetailedAnalysis(text);
      renderResults(analysis);
    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = '<p class="error">Analysis failed. Check console.</p>';
    }
  }, 200);
});

function performDetailedAnalysis(text) {
  const lower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const words = lower.split(/\s+/).filter(w => w).length;
  let fullIssues = [], fullSuggestions = [], fullStrengths = [], score = 100;

  // Audience-first framing
  const af = analyzeAudienceFirst(text);
  fullIssues.push(...af.issues);
  fullSuggestions.push(...af.suggestions);
  score -= af.issues.length * 10;
  score += af.strengths.length * 5;

  // Undesired tone
  const ut = detectUndesiredTone(text);
  fullIssues.push(...ut.issues);
  fullSuggestions.push(...ut.suggestions);
  score -= ut.issues.length * 10;

  // Jargon
  const j = detectJargon(text);
  fullIssues.push(...j.issues);
  fullSuggestions.push(...j.suggestions);
  score -= j.issues.length * 5;

  // Business-first opening
  const bf = detectBusinessFirst(text);
  fullIssues.push(...bf.issues);
  fullSuggestions.push(...bf.suggestions);
  score -= bf.issues.length * 10;

  // Transactional tone
  const tr = detectTransactionalTone(text);
  fullIssues.push(...tr.issues);
  fullSuggestions.push(...tr.suggestions);
  score -= tr.issues.length * 5;

  // Core analyses
  const opening = analyzeOpening(text);
  const atlas = analyzeATLAS(text);
  const emo = analyzeEmotions(text);
  fullIssues.push(...opening.issues, ...atlas.issues, ...emo.issues);
  fullSuggestions.push(...opening.suggestions, ...atlas.suggestions, ...emo.suggestions);
  fullStrengths.push(...opening.strengths, ...atlas.strengths, ...emo.strengths);
  score -= (opening.issues.length + atlas.issues.length + emo.issues.length) * 5;
  score += fullStrengths.length * 2;

  score = Math.max(0, Math.min(100, score));
  return {
    score, words, sentences,
    issues: fullIssues.slice(0,3), fullIssues,
    suggestions: fullSuggestions.slice(0,3), fullSuggestions,
    strengths: fullStrengths.slice(0,2), fullStrengths
  };
}

// Define detector functions (omitted for brevity, assume same as v2.5)
function analyzeAudienceFirst(text) { /*...*/ }
function detectUndesiredTone(text) { /*...*/ }
function detectJargon(text) { /*...*/ }
function detectBusinessFirst(text) { /*...*/ }
function detectTransactionalTone(text) { /*...*/ }
function analyzeOpening(text) { /*...*/ }
function analyzeATLAS(text) { /*...*/ }
function analyzeEmotions(text) { /*...*/ }

function renderResults(a) {
  const cls = a.score < 60 ? 'needs-work' : a.score < 80 ? 'good' : 'excellent';
  const proTips = [...proWritingTipsPool].sort(() => 0.5 - Math.random()).slice(0,4);
  resultsDiv.innerHTML = `
    <div class="score ${cls}">${a.score}/100</div>
    <div class="label">${cls==='needs-work'? 'Needs Work':'Good'}</div>
    <div>${a.words} words • ${a.sentences} sentences</div>
    <h3>What’s Hurting Your Score</h3>
    <ul class="feedback-list">${a.issues.map(i=>`<li data-icon="⚠️">${i}</li>`).join('')}</ul>
    <h3>Quick Wins — Try This Next</h3>
    <ul class="feedback-list">${a.suggestions.map(s=>`<li data-icon="💡">${s}</li>`).join('')}</ul>
    <h3>What’s Working</h3>
    <ul class="feedback-list">${a.strengths.map(s=>`<li data-icon="✅">${s}</li>`).join('')}</ul>
    <h3>Pro Writing Tips</h3>
    <ul class="feedback-list">${proTips.map(t=>`<li data-icon="✍️">${t}</li>`).join('')}</ul>
    <div class="toggle" onclick="resultsDiv.classList.toggle('full')">Show Full Analysis</div>
    <div class="detailed">
      <h3>All Issues</h3><ul class="feedback-list">${a.fullIssues.map(i=>`<li data-icon="⚠️">${i}</li>`).join('')}</ul>
      <h3>All Suggestions</h3><ul class="feedback-list">${a.fullSuggestions.map(s=>`<li data-icon="💡">${s}</li>`).join('')}</ul>
      <h3>All Strengths</h3><ul class="feedback-list">${a.fullStrengths.map(s=>`<li data-icon="✅">${s}</li>`).join('')}</ul>
    </div>
  `;
}
