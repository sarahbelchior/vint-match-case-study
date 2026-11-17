/*
 * VINT Match — demonstração independente de portfólio.
 * Algoritmo didático com dados fictícios. Não é o código original do hackathon.
 * Pesos documentados na apresentação do VINT Match: skills 40%,
 * disponibilidade 25%, histórico 20%, aderência 15%.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.VINTDemoRanking = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const WEIGHTS = Object.freeze({ skills: 40, availability: 25, history: 20, fit: 15 });

  function cleanSkill(skill) {
    return String(skill || '').trim().toLocaleLowerCase('pt-BR');
  }

  function normalizeRequirement(input) {
    const skills = [...new Set((Array.isArray(input.skills) ? input.skills : [])
      .map(cleanSkill).filter(Boolean))];
    const availability = Math.max(0, Math.min(100, Number(input.availability) || 0));
    const months = Math.max(1, Math.min(12, Math.round(Number(input.months) || 1)));
    return { skills, availability, months, level: String(input.level || 'all') };
  }

  function rankProfile(profile, input) {
    const r = normalizeRequirement(input);
    const owned = new Set((profile.skills || []).map(cleanSkill));
    const matching = r.skills.filter(s => owned.has(s));
    const missing = r.skills.filter(s => !owned.has(s));
    const skillPart = r.skills.length ? matching.length / r.skills.length : 1;
    const monthWindow = Array.isArray(profile.monthlyAvailability)
      ? profile.monthlyAvailability.slice(0, r.months) : [];
    const effectiveAvailability = monthWindow.length === r.months
      ? Math.min(...monthWindow.map(x => Math.max(0, Math.min(100, Number(x) || 0)))) : 0;
    const available = effectiveAvailability >= r.availability;
    const levelMatch = r.level === 'all' || profile.level === r.level;
    const availablePart = r.availability === 0 ? 1 : Math.min(effectiveAvailability / r.availability, 1);
    const historyPart = Math.max(0, Math.min(100, Number(profile.historyScore) || 0)) / 100;
    const fitPart = Math.max(0, Math.min(100, Number(profile.fitScore) || 0)) / 100;
    const score = Math.round(
      WEIGHTS.skills * skillPart +
      WEIGHTS.availability * availablePart +
      WEIGHTS.history * historyPart +
      WEIGHTS.fit * fitPart
    );
    const notes = [];
    notes.push(`${matching.length} de ${r.skills.length} competências solicitadas`);
    notes.push(`disponibilidade mínima de ${effectiveAvailability}% durante ${r.months} mês(es)`);
    if (missing.length) notes.push(`faltam: ${missing.join(', ')}`);
    if (!available) notes.push('abaixo da disponibilidade exigida');
    if (!levelMatch) notes.push('nível diferente do solicitado');
    return {
      id: profile.id, name: profile.name, level: profile.level,
      score, eligible: available && levelMatch,
      matching, missing, effectiveAvailability, notes,
      breakdown: {
        skills: Math.round(WEIGHTS.skills * skillPart),
        availability: Math.round(WEIGHTS.availability * availablePart),
        history: Math.round(WEIGHTS.history * historyPart),
        fit: Math.round(WEIGHTS.fit * fitPart)
      }
    };
  }

  function rankAll(profiles, requirement) {
    return profiles.map(p => rankProfile(p, requirement)).sort((a, b) =>
      Number(b.eligible) - Number(a.eligible) || b.score - a.score || a.name.localeCompare(b.name, 'pt-BR'));
  }
  return { WEIGHTS, normalizeRequirement, rankProfile, rankAll };
});
