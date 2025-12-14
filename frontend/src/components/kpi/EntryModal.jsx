import { useState, useEffect } from 'react';

const EntryModal = ({ day, onSubmit }) => {
  const [metric, setMetric] = useState('0.0');
  const [submitted, setSubmitted] = useState(false);
  
  // Reset when day changes
  useEffect(() => {
    setMetric('0.0');
    setSubmitted(false);
  }, [day]);

  // Mock Target Logic (Default 28.0)
  const target = day?.target || 28.0;
  const lastWeek = '28.0'; // Mocked last week data

  const getStatusColor = (val) => {
    const num = parseFloat(val);
    if (!submitted) return '#4472C4'; // Blue (Default)
    if (num >= target) return '#00B050'; // Green (Success)
    // if (num >= target - 2) return '#ED7D31'; // Warning
    return '#FF0000'; // Red (Failure)
  };

  const getMessage = (val) => {
    const num = parseFloat(val);
    if (!submitted) return 'Please Enter Metric';
    if (num >= target) return 'TARGET ACHIEVED';
    return 'Target Missed, Immediate Action Required';
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    // Determine status
    const num = parseFloat(metric);
    const status = num >= target ? 'met' : 'missed';
    onSubmit(status, metric);
  };

  // Styles reused from previous implementation
  const cardStyle = {
    background: '#F2F6FC',
    border: '2px solid #5B9BD5',
    width: '500px',
    height: '600px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  };

  const metricBoxStyle = (bgColor) => ({
    width: '180px',
    height: '100px',
    background: bgColor,
    color: 'white',
    fontSize: '3rem',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1rem auto'
  });

  const buttonStyle = {
    padding: '0.5rem 2rem',
    background: '#A5A5A5',
    color: 'white',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    alignSelf: 'flex-end',
    marginTop: 'auto'
  };

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-muted)'}}>Daily Score Entry</h3>
        <h1 style={{fontSize: '2rem', fontWeight: '800', margin: '0.5rem 0', color: 'black'}}>
          {day?.date?.toUpperCase() || 'TODAY'}
        </h1>
      </div>

      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        
        {/* THIS WEEK */}
        <div>
          <div style={{color: '#4472C4', fontWeight: '700', fontSize: '1.1rem', marginBottom: '5px'}}>THIS WEEK</div>
          <div style={metricBoxStyle(getStatusColor(metric))}>
            {!submitted ? (
               <input 
                autoFocus
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '100%',
                  outline: 'none'
                }}
               />
            ) : (
              <div>{metric}</div>
            )}
          </div>
        </div>

        {/* Message */}
        <div style={{ color: '#2F5597', fontWeight: '700', fontSize: '1.2rem', minHeight: '3rem' }}>
          {getMessage(metric)}
        </div>

        {/* LAST WEEK */}
        <div>
          <div style={{color: '#2F5597', fontWeight: '700', fontSize: '1.1rem', marginBottom: '5px'}}>LAST WEEK</div>
          <div style={metricBoxStyle('#00B050')}>
            {lastWeek}
          </div>
        </div>
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} style={buttonStyle}>Submit</button>
      ) : (
        <button onClick={handleNext} style={buttonStyle}>Next</button>
      )}
    </div>
  );
};

export default EntryModal;
