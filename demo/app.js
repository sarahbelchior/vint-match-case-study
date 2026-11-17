'use strict';
// Perfis completamente fictícios. Não são pessoas nem registros da VINT_GLOBAL.
const profiles = [
  { id: 'P-101', name: 'Perfil A · Engenharia de software', level: 'sênior', skills: ['Node.js', 'AWS', 'Docker', 'PostgreSQL'], monthlyAvailability: [75, 75, 50, 75, 75, 75], historyScore: 88, fitScore: 90 },
  { id: 'P-102', name: 'Perfil B · Cloud', level: 'sênior', skills: ['AWS', 'Terraform', 'Python'], monthlyAvailability: [100, 80, 80, 80, 80, 60], historyScore: 92, fitScore: 84 },
  { id: 'P-103', name: 'Perfil C · Backend', level: 'pleno', skills: ['Node.js', 'AWS', 'Express', 'SQL'], monthlyAvailability: [100, 100, 100, 50, 50, 50], historyScore: 81, fitScore: 82 },
  { id: 'P-104', name: 'Perfil D · Full-stack', level: 'sênior', skills: ['Node.js', 'AWS', 'React', 'Docker'], monthlyAvailability: [100, 30, 70, 70, 70, 70], historyScore: 95, fitScore: 87 },
  { id: 'P-105', name: 'Perfil E · Arquitetura', level: 'sênior', skills: ['Node.js', 'AWS', 'Kubernetes'], monthlyAvailability: [50, 50, 50, 50, 50, 50], historyScore: 79, fitScore: 94 }
];
const form = document.getElementById('form');
const list = document.getElementById('results-list');
const count = document.getElementById('result-count');
function element(tag, className, txt) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (txt !== undefined) e.textContent = String(txt);
  return e;
}
function render() {
  const data = new FormData(form);
  const skills = String(data.get('skills') || '').split(',').map(s=>s.trim()).filter(Boolean);
  const results = VINTDemoRanking.rankAll(profiles, {
    skills, availability: Number(data.get('availability')),
    months: Number(data.get('months')), level: data.get('level')
  });
  list.replaceChildren();
  count.textContent = `${results.filter(x=>x.eligible).length} compatíveis de ${results.length}`;
  results.forEach((item, idx) => {
    const article = element('article', 'candidate');
    const heading = element('div', 'candidate-heading');
    const left = element('div');
    left.append(element('span', 'candidate-id', `${idx + 1}º · ${item.id}`), element('h3', null, item.name));
    const right = element('div', 'score');
    right.append(element('strong', null, `${item.score}/100`), element('span', item.eligible ? 'eligible' : 'ineligible', item.eligible ? 'Compatível' : 'Revisar critérios'));
    heading.append(left, right); article.append(heading);
    const features = element('div', 'chips');
    features.append(element('span', '', item.level), element('span', '', `${item.effectiveAvailability}% disponíveis`));
    article.append(features);
    const explainTitle = element('p', 'why-title', 'Por que esta posição?');
    const explain = element('p', 'explanation', item.notes.join(' · '));
    article.append(explainTitle, explain);
    const breakdown = element('div', 'breakdown');
    Object.entries(item.breakdown).forEach(([key, value]) => {
      const names = {skills:'Skills',availability:'Disponib.',history:'Histórico',fit:'Aderência'};
      const span = element('span', null, `${names[key]} ${value}`);
      breakdown.append(span);
    });
    article.append(breakdown);
    list.append(article);
  });
}
form.addEventListener('submit', e=>{ e.preventDefault(); render(); });
render();
