
import React, { useState, useEffect } from 'react';
import { CalcMode, TimeParts, PaceParts } from './types';
import { COMMON_DISTANCES } from './constants';
import { toTotalSeconds, fromTotalSeconds, paceToSecondsPerKm, secondsPerKmToPace } from './utils/calcLogic';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>('PACE');
  
  // Inputs
  const [distance, setDistance] = useState<string>('');
  const [time, setTime] = useState<TimeParts>({ hours: '', minutes: '', seconds: '' });
  const [pace, setPace] = useState<PaceParts>({ minutes: '', seconds: '' });
  
  // Result
  const [result, setResult] = useState<string | null>(null);

  // Clear inputs when mode changes
  useEffect(() => {
    setResult(null);
  }, [mode]);

  const handleCalculate = () => {
    setResult(null);

    // Logic: 
    // Time (s) = Distance (km) * Pace (s/km)
    
    if (mode === 'PACE') {
      // Calculate Pace = Time / Distance
      const dist = parseFloat(distance);
      const timeSec = toTotalSeconds(time);
      
      if (!dist || dist <= 0) { alert('请输入有效的距离'); return; }
      if (timeSec <= 0) { alert('请输入有效的时间'); return; }

      const paceSec = timeSec / dist;
      const p = secondsPerKmToPace(paceSec);
      setResult(`${p.minutes}'${p.seconds}" /公里`);
    } 
    else if (mode === 'TIME') {
      // Calculate Time = Distance * Pace
      const dist = parseFloat(distance);
      const paceSec = paceToSecondsPerKm(pace);

      if (!dist || dist <= 0) { alert('请输入有效的距离'); return; }
      if (paceSec <= 0) { alert('请输入有效的配速'); return; }

      const timeSec = dist * paceSec;
      const t = fromTotalSeconds(timeSec);
      // Format nicely
      let str = '';
      if (parseInt(t.hours) > 0) str += `${t.hours}小时 `;
      str += `${t.minutes}分 ${t.seconds}秒`;
      setResult(str);
    } 
    else if (mode === 'DISTANCE') {
      // Calculate Distance = Time / Pace
      const timeSec = toTotalSeconds(time);
      const paceSec = paceToSecondsPerKm(pace);

      if (timeSec <= 0) { alert('请输入有效的时间'); return; }
      if (paceSec <= 0) { alert('请输入有效的配速'); return; }

      const dist = timeSec / paceSec;
      setResult(`${dist.toFixed(2)} 公里`);
    }
  };

  const setCommonDistance = (val: number) => {
    setDistance(val.toString());
  };

  // Helper component for Time Input
  const TimeInput = ({ value, onChange, label }: { value: TimeParts, onChange: (v: TimeParts) => void, label: string }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
      <label className="block text-sm font-bold text-orange-900 mb-2">{label}</label>
      <div className="flex gap-2 items-center">
        <input 
          type="number" placeholder="00" className="flex-1 bg-orange-50/50 text-center py-3 rounded-xl text-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
          value={value.hours} onChange={e => onChange({...value, hours: e.target.value})}
        />
        <span className="text-orange-300 font-bold">:</span>
        <input 
          type="number" placeholder="00" className="flex-1 bg-orange-50/50 text-center py-3 rounded-xl text-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
          value={value.minutes} onChange={e => onChange({...value, minutes: e.target.value})}
        />
        <span className="text-orange-300 font-bold">:</span>
        <input 
          type="number" placeholder="00" className="flex-1 bg-orange-50/50 text-center py-3 rounded-xl text-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
          value={value.seconds} onChange={e => onChange({...value, seconds: e.target.value})}
        />
      </div>
      <div className="flex text-xs text-orange-400 mt-1 justify-around px-2">
        <span>时</span><span>分</span><span>秒</span>
      </div>
    </div>
  );

  // Helper component for Pace Input
  const PaceInput = ({ value, onChange }: { value: PaceParts, onChange: (v: PaceParts) => void }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
      <label className="block text-sm font-bold text-orange-900 mb-2">配速 (分/公里)</label>
      <div className="flex gap-2 items-center">
        <input 
          type="number" placeholder="00" className="flex-1 bg-orange-50/50 text-center py-3 rounded-xl text-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
          value={value.minutes} onChange={e => onChange({...value, minutes: e.target.value})}
        />
        <span className="text-orange-300 font-bold">'</span>
        <input 
          type="number" placeholder="00" className="flex-1 bg-orange-50/50 text-center py-3 rounded-xl text-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
          value={value.seconds} onChange={e => onChange({...value, seconds: e.target.value})}
        />
        <span className="text-orange-300 font-bold">"</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-orange-500 text-white p-6 pb-12 shadow-lg rounded-b-[2.5rem] relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black tracking-tight italic">OrangePace</h1>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🏃</div>
        </div>
        
        {/* Mode Switcher */}
        <div className="bg-orange-600/50 p-1 rounded-xl flex">
          {[
            { id: 'PACE', label: '求配速' },
            { id: 'TIME', label: '求时间' },
            { id: 'DISTANCE', label: '求距离' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as CalcMode)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                mode === m.id 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-orange-100 hover:bg-white/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 -mt-6 z-20 pb-24 overflow-y-auto">
        <div className="space-y-4">
          
          {/* Input: Distance */}
          {mode !== 'DISTANCE' && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 animate-in fade-in slide-in-from-bottom-4">
              <label className="block text-sm font-bold text-orange-900 mb-2">距离 (公里)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="例如 10.0" 
                  className="w-full bg-orange-50/50 px-4 py-3 rounded-xl text-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
                  value={distance}
                  onChange={e => setDistance(e.target.value)}
                />
              </div>
              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {COMMON_DISTANCES.map(d => (
                  <button
                    key={d.label}
                    onClick={() => setCommonDistance(d.value)}
                    className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100 active:bg-orange-200"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input: Time */}
          {mode !== 'TIME' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 delay-75">
              <TimeInput value={time} onChange={setTime} label="用时" />
            </div>
          )}

          {/* Input: Pace */}
          {mode !== 'PACE' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 delay-100">
              <PaceInput value={pace} onChange={setPace} />
            </div>
          )}

          {/* Calculate Button */}
          <button 
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-orange-500/30 active:scale-95 transition-all mt-4"
          >
            开始计算
          </button>

          {/* Result Display */}
          {result && (
            <div className="mt-6 p-6 bg-slate-900 rounded-3xl text-center shadow-2xl animate-in zoom-in duration-300">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">计算结果</p>
              <p className="text-4xl font-black text-white">{result}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Branding */}
      <footer className="py-6 text-center text-orange-200 text-xs font-medium">
        Powered by OrangePace
      </footer>
    </div>
  );
};

export default App;
