import { useState, useEffect } from 'react';
import { Calendar, Check, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import EntryModal from '../components/kpi/EntryModal';
import ResultModal from '../components/kpi/ResultModal';
import { getDaysForMonth } from '../utils/mockKpiData';

const KPIPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [streak, setStreak] = useState(5); 
  const [view, setView] = useState('list'); 
  const [currentDay, setCurrentDay] = useState(null);

  // Load data when month changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const generatedDays = getDaysForMonth(year, month);
    setDays(generatedDays);
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const today = new Date();
    // Don't go into future months
    if (currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleDaySelect = (day) => {
    if (day.status === 'locked') return; 
    setCurrentDay(day);
    setView('entry');
  };

  const handleEntryComplete = (status, score) => {
    if (status === 'met') {
      setStreak(s => s + 1);
      setView('result');
    } else {
      setStreak(0);
      handleLockDay(score); 
    }
  };

  const handleResultFinish = () => {
    handleLockDay(currentDay.score || '28.0'); // Use entered score (mocked as '28.0' if missing in logic, but standard flow passes it)
    // Actually EntryModal passes the metric, let's fix that connection if needed.
    // In handleEntryComplete, we didn't save the metric to state to pass here?
    // Let's assume EntryModal sets it on 'currentDay' or we need to pass it through.
    // For simplicity, handleEntryComplete calls handleLockDay directly or we trust logic.
    // Wait, handleResultFinish calls handleLockDay with 'currentDay.score' which is undefined for pending.
    // Better fix: handleEntryComplete should store the score temporarily or pass it.
    // For now, let's just use a fixed value or assume flow works since we are refactoring page structure.
    // Actually, let's fix handleLockDay to take the score and ResultModal just finishes.
    // We need to store the temporary score if we go to ResultModal.
    // Quick fix: Just lock it with a "Success" value for now or '29.5'.
  };

  // State to hold temp score during result view
  const [tempScore, setTempScore] = useState(null);

  const handleEntryCompleteFixed = (status, score) => {
    if (status === 'met') {
      setStreak(s => s + 1);
      setTempScore(score);
      setView('result');
    } else {
      setStreak(0);
      handleLockDay(score); 
    }
  };

  const handleResultFinishFixed = () => {
    handleLockDay(tempScore);
    setTempScore(null);
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
    height: '80vh', // Fixed height for scrolling
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  };

  return (
    <div style={containerStyle}>
      
      {/* VIEW: DAY LIST */}
      {view === 'list' && (
        <div style={listCardStyle}>
          
          {/* Header with Navigation */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <button onClick={handlePrevMonth} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem'}}>
               <ChevronLeft size={24} color="#64748b" />
            </button>
            <div style={{textAlign: 'center'}}>
              <h2 style={{fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0}}>Daily KPI Entry</h2>
              <span style={{color: '#64748b', fontSize: '1rem', fontWeight: '600'}}>{monthLabel}</span>
            </div>
            <button onClick={handleNextMonth} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem'}}>
               <ChevronRight size={24} color="#64748b" />
            </button>
          </div>

          <p style={{color: '#64748b', marginBottom: '1rem', textAlign: 'center'}}>Select a day to enter metrics.</p>

          <div style={{overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
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
                  transition: 'all 0.2s',
                  flexShrink: 0 // Prevent shrinking in flex container
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
          
          <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
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
          onSubmit={handleEntryCompleteFixed} 
        />
      )}

      {/* VIEW: RESULT MODAL */}
      {view === 'result' && (
        <ResultModal 
          streak={streak} 
          onFinish={handleResultFinishFixed} 
        />
      )}

    </div>
  );
};

export default KPIPage;
