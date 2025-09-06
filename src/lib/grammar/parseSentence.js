// src/lib/grammar/parseSentence.js
const AUX_BE = /\b(am|is|are|was|were|be|been|being)\b/i;
const AUX_HAVE = /\b(have|has|had)\b/i;
const WILL = /\b(will|'ll)\b/i;
const GOING_TO = /\b(am|is|are|was|were)\s+going\s+to\b/i;
const NEG = /\b(not|n't)\b/i;
const MODAL = /\b(can|could|may|might|should|would|must|ought\s+to|need)\b/i;
const THERE_IS = /\bthere\s+(is|are|was|were|has\s+been|have\s+been)\b/i;
const USED_TO = /\bused\s+to\b/i;
const HAVE_GOT = /\b(have|has)\s+got\b/i;
const QUESTION_AUX_FIRST = /^(am|is|are|was|were|do|does|did|have|has|had|will|can|could|may|might|should|would|must)\b/i;
const IF = /\bif\b/i;

const TIME_MARKERS_PAST = /\b(yesterday|ago|last\s+(night|week|month|year)|in\s+\d{4})\b/i;
const TIME_MARKERS_PRESENT = /\b(always|usually|often|sometimes|every\s+(day|week|month|year)|nowadays)\b/i;

const V_ING = /\b\w+ing\b/i;
const V_ED = /\b\w+ed\b/i;
const V_EN = /\b\w+(en|ed|wn)\b/i;

export function parseSentence(raw) {
  const text = (raw || "").trim();
  const lowered = text.toLowerCase();

  const res = {
    tense: "none", aspect: "none", voice: "active",
    mood: "indicative", modal: "none", neg: NEG.test(lowered),
    interrogative: QUESTION_AUX_FIRST.test(lowered) || lowered.endsWith("?"),
    construction: null, confidence: 0.6, debug: []
  };

  if (THERE_IS.test(lowered)) res.construction = "there_is";
  if (USED_TO.test(lowered))  res.construction = "used_to";
  if (HAVE_GOT.test(lowered)) res.construction = "have_got";

  const m = lowered.match(MODAL); if (m) res.modal = m[1];

  if (AUX_BE.test(lowered) && V_EN.test(lowered)) { res.voice="passive"; }
  if (AUX_HAVE.test(lowered) && /\bbeen\b/i.test(lowered) && V_ING.test(lowered)) res.aspect="perfect-progressive";
  else if (AUX_BE.test(lowered) && V_ING.test(lowered)) res.aspect="progressive";
  else if (AUX_HAVE.test(lowered) && V_EN.test(lowered)) res.aspect="perfect";
  else res.aspect="simple";

  if (WILL.test(lowered)) { res.tense="future"; if (res.modal==="none") res.modal="will"; res.debug.push("will"); }
  else if (GOING_TO.test(lowered)) { res.tense="future"; res.construction="going_to"; }
  else {
    if (/\bwas|were|had\b/i.test(lowered)) res.tense="past";
    if (/\bam|is|are|have|has\b/i.test(lowered)) res.tense="present";
    if (res.tense==="none") {
      if (TIME_MARKERS_PAST.test(lowered) || V_ED.test(lowered)) res.tense="past";
      else if (TIME_MARKERS_PRESENT.test(lowered)) res.tense="present";
      else res.tense="present";
    }
  }

  if (IF.test(lowered)) {
    if (/\bhad\b\s+\w+(ed|en)\b/i.test(lowered) && /\bwould\s+have\b/i.test(lowered)) res.construction="conditional_3";
    else if (/\bwould\b/i.test(lowered) && /\b(if).*\b\w+ed\b/i.test(lowered)) res.construction="conditional_2";
    else if (/\b(if).*\b(am|is|are|do|does)\b/i.test(lowered) && /\bwill\b/i.test(lowered)) res.construction="conditional_1";
    else res.construction="conditional_0";
    res.mood="conditional";
  }

  if (res.construction || res.modal!=="none" || res.voice==="passive" || res.aspect!=="simple") res.confidence=0.8;
  if (res.tense!=="none" && res.aspect!=="none") res.confidence+=0.1;
  res.confidence=Math.min(1,res.confidence);

  return res;
}
