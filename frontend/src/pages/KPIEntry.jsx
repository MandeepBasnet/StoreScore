import { useState } from 'react';
import { Calendar, Check, Lock, ChevronRight } from 'lucide-react';
import EntryModal from '../components/kpi/EntryModal';
import ResultModal from '../components/kpi/ResultModal';

const KPIPage = () => {
  // Mock Data: Past 4 days + Today
  const [days, setDays] = useState([
    { id: 1, date: 'Wednesday', fullDate: 'Wed, Oct 23', status: 'locked', score: 28.5, target: 28.0 },
    { id: 2, date: 'Thursday', fullDate: 'Thu, Oct 24', status: 'locked', score: 29.0, target: 28.0 },
    { id: 3, date: 'Friday', fullDate: 'Fri, Oct 25', status: 'pending', target: 28.0 }, // MISSED DAY
    { id: 4, date: 'Saturday', fullDate: 'Sat, Oct 26', status: 'pending', target: 28.0 }, // TODAY
  ]);

  const [streak, setStreak] = useState(5); // Mock starting streak
  const [view, setView] = useState('list'); // 'list', 'entry', 'result'
  const [currentDay, setCurrentDay] = useState(null);

  const handleDaySelect = (day) => {
    if (day.status === 'locked') return; // Cannot edit locked days
    setCurrentDay(day);
    setView('entry');
  };

  const handleEntryComplete = (status, score) => {
    // status: 'met' | 'missed'
    if (status === 'met') {
      setStreak(s => s + 1);
      setView('result');
    } else {
      setStreak(0); // Reset streak on miss
      setView('list'); // Or show failure modal? For now back to list or maybe just close
      // Actually, let's just lock it and go back to list for now if missed, 
      // or maybe show "Improvement Needed" screen. 
      // Spec said "Target Missed" is shown in validation. 
      // Let's assume on "Next" after failure we just go back.
      handleLockDay(score); 
    }
  };

  const handleResultFinish = () => {
    handleLockDay(currentDay.score || '28.0'); // Use entered score
  };

  const handleLockDay = (finalScore) => {
    setDays(prev => prev.map(d => 
      d.id === currentDay.id 
        ? { ...d, status: 'locked', score: finalScore }
        : d
    ));
    setView('list');
    setCurrentDay(null);
  };

  // Styles
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const listCardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    width: '600px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  };

  return (
    <div style={containerStyle}>
      
      {/* VIEW: DAY LIST */}
      {view === 'list' && (
        <div style={listCardStyle}>
          <h2 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a'}}>Daily KPI Entry</h2>
          <p style={{color: '#64748b', marginBottom: '2rem'}}>Select a day to enter metrics. Previous days must be completed.</p>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {days.map(day => (
              <div 
                key={day.id}
                onClick={() => handleDaySelect(day)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: day.status === 'pending' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: day.status === 'pending' ? '#eff6ff' : '#f8fafc',
                  cursor: day.status === 'pending' ? 'pointer' : 'default',
                  opacity: day.status === 'locked' ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: day.status === 'locked' ? '#dcfce7' : '#dbeafe',
                    color: day.status === 'locked' ? '#166534' : '#1e40af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {day.status === 'locked' ? <Check size={20}/> : <Calendar size={20}/>}
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#0f172a', margin: 0}}>{day.date}</h4>
                    <span style={{fontSize: '0.875rem', color: '#64748b'}}>{day.fullDate}</span>
                  </div>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                   {day.status === 'locked' ? (
                     <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.9rem', fontWeight: '600'}}>
                       <Lock size={16} />
                       <span>Locked</span>
                       <span style={{color: '#64748b', fontWeight: '400'}}>({day.score})</span>
                     </div>
                   ) : (
                     <div style={{
                       padding: '0.5rem 1rem', 
                       background: '#2563eb', 
                       color: 'white', 
                       borderRadius: '8px', 
                       fontSize: '0.875rem', 
                       fontWeight: '600',
                       display: 'flex', alignItems: 'center', gap: '0.5rem'
                     }}>
                       Enter Data <ChevronRight size={16}/>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{color: '#64748b', fontSize: '0.9rem'}}>Current Streak</span>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
               <span style={{fontSize: '1.5rem', fontWeight: '800', color: '#059669'}}>{streak}</span>
               <span style={{color: '#059669', fontWeight: '600'}}>Days</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ENTRY MODAL */}
      {view === 'entry' && (
        <EntryModal 
          day={currentDay} 
          onSubmit={handleEntryComplete} 
        />
      )}

      {/* VIEW: RESULT MODAL */}
      {view === 'result' && (
        <ResultModal 
          streak={streak} 
          onFinish={handleResultFinish} 
        />
      )}

    </div>
  );
};

export default KPIPage;
