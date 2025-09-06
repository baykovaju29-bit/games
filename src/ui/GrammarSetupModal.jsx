import React, { useState } from "react";

export default function GrammarSetupModal({ open, initial = {}, onClose, onApply }) {
  const [tense, setTense] = useState(initial.tense || "");
  const [construction, setConstruction] = useState(initial.construction || "");
  const [aspect, setAspect] = useState(initial.aspect || "");
  const [voice, setVoice] = useState(initial.voice || "");
  const [difficultyMin, setDiffMin] = useState(initial.difficultyMin ?? 1);
  const [difficultyMax, setDiffMax] = useState(initial.difficultyMax ?? 5);

  if (!open) return null;

  function apply() {
    onApply({ 
      tense: tense || undefined, 
      aspect: aspect || undefined, 
      voice: voice || undefined,
      construction: construction || undefined, 
      difficultyMin, 
      difficultyMax 
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Choose what to practice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label>
            <div className="sub">Tense</div>
            <select className="input w-full" value={tense} onChange={e => setTense(e.target.value)}>
              <option value="">Any</option>
              <option value="present">Present</option>
              <option value="past">Past</option>
              <option value="future">Future</option>
            </select>
          </label>
          <label>
            <div className="sub">Construction</div>
            <select className="input w-full" value={construction} onChange={e => setConstruction(e.target.value)}>
              <option value="">Any</option>
              <option value="conditional_0">Zero Conditional</option>
              <option value="conditional_1">1st Conditional</option>
              <option value="conditional_2">2nd Conditional</option>
              <option value="conditional_3">3rd Conditional</option>
              <option value="going_to">Going to</option>
              <option value="used_to">Used to</option>
              <option value="there_is">There is/are</option>
            </select>
          </label>
          <label>
            <div className="sub">Aspect</div>
            <select className="input w-full" value={aspect} onChange={e => setAspect(e.target.value)}>
              <option value="">Any</option>
              <option value="simple">Simple</option>
              <option value="progressive">Progressive</option>
              <option value="perfect">Perfect</option>
              <option value="perfect-progressive">Perfect Progressive</option>
            </select>
          </label>
          <label>
            <div className="sub">Voice</div>
            <select className="input w-full" value={voice} onChange={e => setVoice(e.target.value)}>
              <option value="">Any</option>
              <option value="active">Active</option>
              <option value="passive">Passive</option>
            </select>
          </label>
          <label>
            <div className="sub">Difficulty Min</div>
            <input 
              type="number" 
              min="1" 
              max="5" 
              className="input w-full"
              value={difficultyMin} 
              onChange={e => setDiffMin(+e.target.value)} 
            />
          </label>
          <label>
            <div className="sub">Difficulty Max</div>
            <input 
              type="number" 
              min="1" 
              max="5" 
              className="input w-full"
              value={difficultyMax} 
              onChange={e => setDiffMax(+e.target.value)} 
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>
  );
}
