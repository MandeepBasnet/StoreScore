import { useState, useEffect, useMemo } from 'react';
import { Calendar, Check, Lock, ChevronRight, ChevronLeft, Store } from 'lucide-react';
import EntryModal from '../components/kpi/EntryModal';
import ResultModal from '../components/kpi/ResultModal';
import { AppwriteService } from '../services/appwrite';
import { useAuth } from '../context/AuthContext';

const KPIPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [streak, setStreak] = useState(0);
  const [view, setView] = useState('list');
  const [activeWeek, setActiveWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(null);
  const [tempScore, setTempScore] = useState(null);
  
  // Store selection
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Target values (default, can be fetched from store_targets later)
  const [target] = useState(28.0);

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storeList = await AppwriteService.getStores();
        setStores(storeList);
        if (storeList.length > 0) {
          setSelectedStoreId(storeList[0].$id);
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load stores. Please check your Appwrite configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  // Load KPI data when month or store changes
  useEffect(() => {
    if (!selectedStoreId) return;
    
    const loadKPIData = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Fetch existing entries from Appwrite
        const entries = await AppwriteService.getKPIEntriesForMonth(selectedStoreId, year, month);
        
        // Generate calendar days for the month
        const generatedDays = generateDaysForMonth(year, month, entries, target);
        setDays(generatedDays);
        
        // Calculate streak
        calculateStreak(generatedDays);
        
      } catch (err) {
        console.error('Error loading KPI data:', err);
        setError('Failed to load KPI data');
      } finally {
        setLoading(false);
      }
    };
    
    loadKPIData();
  }, [currentDate, selectedStoreId, target]);

  // Generate days for a month and merge with existing entries
  const generateDaysForMonth = (year, month, existingEntries, targetValue) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const generatedDays = [];
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const currentDayNum = today.getDate();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Create a map of existing entries by date for quick lookup
    const entriesMap = {};
    existingEntries.forEach(entry => {
      entriesMap[entry.date] = entry;
    });

    for (let i = 1; i <= daysInMonth; i++) {
      // Skip future days in current month
      if (isCurrentMonth && i > currentDayNum) break;

      const dateObj = new Date(year, month, i);
      const dayOfWeek = dayNames[dateObj.getDay()];
      const monthName = monthNames[month];
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      // Check if entry exists for this date
      const existingEntry = entriesMap[dateStr];
      
      let status = 'pending';
      let score = undefined;
      
      if (existingEntry) {
        status = 'locked';
        score = existingEntry.dailyScore?.toString();
      }

      generatedDays.push({
        id: dateStr,
        date: dayOfWeek,
        fullDate: `${dayOfWeek.slice(0, 3)}, ${monthName} ${i}`,
        dateStr: dateStr,
        status: status,
        score: score,
        target: existingEntry?.target || targetValue,
        entryId: existingEntry?.$id
      });
    }

    return generatedDays.reverse(); // Newest first
  };

  // Calculate weeks for a given month
  const getWeeksForMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekCount = Math.ceil(daysInMonth / 7);
    const weeks = [];
    
    for (let i = 1; i <= weekCount; i++) {
      const startDay = (i - 1) * 7 + 1;
      const endDay = Math.min(i * 7, daysInMonth);
      weeks.push({
        weekNumber: i,
        label: `Week ${i}`,
        startDay,
        endDay
      });
    }
    return weeks;
  };

  // Filter days based on active week
  const filteredDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weeks = getWeeksForMonth(year, month);
    const activeWeekData = weeks[activeWeek - 1];
    
    if (!activeWeekData) return days;
    
    return days.filter(day => {
      const dayNum = parseInt(day.id.split('-')[2]);
      return dayNum >= activeWeekData.startDay && dayNum <= activeWeekData.endDay;
    });
  }, [days, activeWeek, currentDate]);

  // Calculate streak of consecutive days meeting target
  const calculateStreak = (daysList) => {
    let streakCount = 0;
    const sortedDays = [...daysList].reverse(); // Oldest first
    
    for (const day of sortedDays) {
      if (day.status === 'locked' && parseFloat(day.score) >= day.target) {
        streakCount++;
      } else if (day.status === 'locked') {
        streakCount = 0; // Reset on missed target
      }
    }
    setStreak(streakCount);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setActiveWeek(1); // Reset to Week 1
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setActiveWeek(1); // Reset to Week 1
  };

  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleDaySelect = (day) => {
    if (day.status === 'locked') return;
    setCurrentDay(day);
    setView('entry');
  };

  const handleEntryComplete = async (status, score) => {
    try {
      setError('');
      
      // Save to Appwrite
      const entryData = {
        date: currentDay.dateStr,
        storeId: selectedStoreId,
        dailyScore: parseFloat(score),
        status: status,
        userId: String(user?.id || user?.userId || user?.username || 'unknown').slice(0, 36),
        userRole: String(user?.role || 'unknown').slice(0, 20),
        target: target,
        warningThreshold: target - 2,
        criticalThreshold: target - 4
      };
      
      await AppwriteService.createKPIEntry(entryData);
      
      if (status === 'met') {
        setStreak(s => s + 1);
        setTempScore(score);
        setView('result');
      } else {
        setStreak(0);
        handleLockDay(score);
      }
    } catch (err) {
      console.error('Error saving KPI entry:', err);
      setError(`Failed to save entry: ${err.message}`);
      setView('list');
    }
  };

  const handleResultFinish = () => {
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
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '1rem'
  };

  const listCardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    width: '600px',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  };

  const storeSelectStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    fontSize: '0.9rem',
    minWidth: '200px',
    marginBottom: '1rem'
  };

  const weekTabsContainerStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem'
  };

  const getWeekTabStyle = (isActive) => ({
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: isActive ? 'none' : '1px solid #e2e8f0',
    background: isActive ? '#2563eb' : 'white',
    color: isActive ? 'white' : '#64748b',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  });

  if (loading && days.length === 0 && stores.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={listCardStyle}>
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      
      {/* VIEW: DAY LIST */}
      {view === 'list' && (
        <div style={listCardStyle}>
          
          {/* Store Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Store size={20} color="#64748b" />
            <select 
              value={selectedStoreId} 
              onChange={(e) => setSelectedStoreId(e.target.value)}
              style={storeSelectStyle}
            >
              {stores.length === 0 ? (
                <option value="">No stores available</option>
              ) : (
                stores.map(store => (
                  <option key={store.$id} value={store.$id}>
                    {store.name || store.storeName || store.$id}
                  </option>
                ))
              )}
            </select>
          </div>

          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: '#fee2e2', 
              color: '#dc2626', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
          
          {/* Header with Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
              <ChevronLeft size={24} color="#64748b" />
            </button>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Daily KPI Entry</h2>
              <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: '600' }}>{monthLabel}</span>
            </div>
            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
              <ChevronRight size={24} color="#64748b" />
            </button>
          </div>

          <p style={{ color: '#64748b', marginBottom: '1rem', textAlign: 'center' }}>Select a day to enter metrics.</p>

          {/* Week Tabs */}
          <div style={weekTabsContainerStyle}>
            {getWeeksForMonth(currentDate.getFullYear(), currentDate.getMonth()).map(week => (
              <button
                key={week.weekNumber}
                onClick={() => setActiveWeek(week.weekNumber)}
                style={getWeekTabStyle(activeWeek === week.weekNumber)}
              >
                {week.label}
              </button>
            ))}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading entries...</p>
            ) : days.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8' }}>No days available for this month.</p>
            ) : (
              filteredDays.map(day => (
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
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: day.status === 'locked' ? '#dcfce7' : '#dbeafe',
                      color: day.status === 'locked' ? '#166534' : '#1e40af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {day.status === 'locked' ? <Check size={20} /> : <Calendar size={20} />}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '600', color: '#0f172a', margin: 0 }}>{day.date}</h4>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{day.fullDate}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {day.status === 'locked' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.9rem', fontWeight: '600' }}>
                        <Lock size={16} />
                        <span>Locked</span>
                        <span style={{ color: '#64748b', fontWeight: '400' }}>({day.score})</span>
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
                        Enter Data <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Current Streak</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669' }}>{streak}</span>
              <span style={{ color: '#059669', fontWeight: '600' }}>Days</span>
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
