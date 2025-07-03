const analyzeBtn = document.getElementById('analyzeBtn');
const textInput = document.getElementById('textInput');
const resultsDiv = document.getElementById('results');

analyzeBtn.addEventListener('click', () => {
  const text = textInput.value.trim();
  if (!text) return alert('Please enter some text.');
  const analysis = performAnalysis(text);
  renderResults(analysis);
});

function performAnalysis(text) {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).length;
  const sentences = (text.match(/[.!?]+/g) || []).length;

  const issues = [];
  const tips = [];
  const strengths = [];

  // 1) Whole-word grammar/spelling patterns:
  const grammarPatterns = [
    '\\bu\\b',    // single “u”
    '\\bur\\b',   // single “ur”
    '\\bbisness\\b',
    '\\bgonna\\b',
    '\\bgotta\\b',
    '\\bwanna\\b',
    '\\bdunno\\b',
    '\\balot\\b',
    '\\bcant\\b',
    '\\bdont\\b',
    '\\bwont\\b',
    '\\bisnt\\b',
    '\\bhasnt\\b'
  ];
  const foundGrammar = [];
  grammarPatterns.forEach(pat => {
    const rx = new RegExp(pat, 'gi');
    if (rx.test(lower)) {
      // strip out the \\b so we display the raw word
      foundGrammar.push(pat.replace(/\\\\b/g, ''));
    }
  });
  if (foundGrammar.length) {
    issues.push(
      `Poor grammar/spelling detected. Found: "${[...new Set(foundGrammar)].join('", "')}"`
    );
    tips.push('Use proper whole-word spelling for credibility');
  }

  // 2) Vague language (same as before, but with word boundaries)
  const vagueWords = ['stuff','things','whatever','i guess','maybe','kinda','sorta','probably','might be'];
  const foundVague = vagueWords.filter(w => {
    const pattern = '\\b' + w.replace(/ /g,'\\s+') + '\\b';
    return new RegExp(pattern,'gi').test(lower);
  });
  if (foundVague.length > 3) {
    issues.push(`Language is too vague. Found: "${foundVague.join('", "')}"`);
    tips.push('Swap vague terms for specific, confident statements');
  }

  // ... the rest of your checks (hype, hook, etc.) go here unchanged ...

  // Score calc
  let score = 100 - issues.length * 20 + strengths.length * 5;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    words,
    sentences,
    issues: issues.slice(0,3),
    tips: tips.slice(0,3),
    strengths: strengths.slice(0,2)
  };
}


function renderResults(a) {
  resultsDiv.innerHTML = \`
    <div class="score">\${a.score}/100</div>
    <div class="label">\${a.score<60? 'Needs Work: See tips below': a.score<80? 'Good': 'Excellent'}</div>
    <div>\${a.words} words • \${a.sentences} sentences</div>

    <h3>What’s Hurting Your Score</h3>
    <ul class="feedback-list">
      \${a.issues.map(i=>\`<li data-icon="⚠️">\${i}</li>\`).join('') || '<li>No major issues</li>'}
    </ul>

    <h3>Quick Wins — Try This Next</h3>
    <ul class="feedback-list">
      \${a.tips.map(t=>\`<li data-icon="💡">\${t}</li>\`).join('') || '<li>Keep it up!</li>'}
    </ul>

    <h3>What’s Working</h3>
    <ul class="feedback-list">
      \${a.strengths.map(s=>\`<li data-icon="✅">\${s}</li>\`).join('') || '<li>Clear copy detected</li>'}
    </ul>

    <h3>Pro Writing Tips</h3>
    <ul class="feedback-list">
      <li data-icon="✍️">Use short, punchy sentences (8–12 words).</li>
      <li data-icon="✍️">Start with a personal story or hook question.</li>
      <li data-icon="✍️">Show, don’t tell: use sensory language.</li>
      <li data-icon="✍️">Speak to one reader, not everyone.</li>
    </ul>

    <div class="toggle" onclick="resultsDiv.classList.toggle('full')">Show Full Analysis</div>
  \`;
}
