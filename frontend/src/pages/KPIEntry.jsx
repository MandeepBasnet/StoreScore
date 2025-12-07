import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const KPIEntry = () => {
  const [step, setStep] = useState(1); // 1: Input, 2: Result, 3: Excellence, 4: Ranking
  const [metric, setMetric] = useState('0.0');
  const [lastWeek] = useState('28.0');
  
  // Mock targets
  const target = 28.0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else setStep(1); // Reset
  };

  const getStatusColor = (val) => {
    const num = parseFloat(val);
    if (val === '0.0') return '#4472C4'; // Blue (Default)
    if (num >= target) return '#00B050'; // Green (Success)
    if (num >= target - 2) return '#ED7D31'; // Amber (Warning) (e.g. 26-27.9)
    return '#FF0000'; // Red (Failure)
  };

  const getMessage = (val) => {
    const num = parseFloat(val);
    if (val === '0.0') return 'Please Enter Metric';
    if (num >= target) return 'TARGET ACHIEVED';
    if (num >= target - 2) return 'NEEDS IMPROVEMENT';
    return 'Target Missed, Immediate Action Required';
  };

  // Common Styles
  const containerStyle = {
    // minHeight: '100vh', // Handled by layout
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Take full height of main area
    // backgroundColor: '#fff', // Transparent to let layout bg show
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const cardStyle = {
    background: '#F2F6FC', // Very light blueish grey
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

  const headerBoxStyle = {
    marginBottom: '1rem'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '0.5rem 0',
    color: 'black'
  };

  const subTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#444'
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

  const labelStyle = {
    color: '#4472C4',
    fontWeight: '700',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    marginBottom: '5px'
  };

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
    <div style={containerStyle}>
      
      {/* View 1 & 2: Data Entry / Result */}
      {(step === 1 || step === 2) && (
        <div style={cardStyle}>
          
          <div style={headerBoxStyle}>
            <h3 style={{fontSize: '1.2rem', fontWeight: '700'}}>Drive Thru Metrics:</h3>
            <h1 style={titleStyle}>SATURDAY</h1> 
            {/* Hardcoded 7am-10am from screenshot */}
          </div>

          <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            
            {/* THIS WEEK */}
            <div>
              <div style={labelStyle}>THIS WEEK</div>
              {step === 1 ? (
                 <div style={metricBoxStyle(getStatusColor(metric))}>
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
                 </div>
              ) : (
                <div style={metricBoxStyle(getStatusColor(metric))}>
                  {metric}
                </div>
              )}
            </div>

            {/* Message */}
            <div style={{ color: '#2F5597', fontWeight: '700', fontSize: '1.2rem', minHeight: '3rem' }}>
              {step === 1 ? 'Please Enter Metric' : getMessage(metric)}
            </div>

            {/* LAST WEEK */}
            <div>
              <div style={{...labelStyle, color: '#2F5597'}}>LAST WEEK</div>
              <div style={metricBoxStyle('#00B050')}>
                {lastWeek}
              </div>
            </div>

          </div>

          {step === 1 ? (
            <button onClick={handleSubmit} style={buttonStyle}>Submit</button>
          ) : (
            <button onClick={handleNext} style={buttonStyle}>Next</button>
          )}

        </div>
      )}

      {/* View 3: Achievement Excellence */}
      {step === 3 && (
        <div style={cardStyle}>
          <div style={headerBoxStyle}>
            <h3 style={{fontSize: '1.2rem', fontWeight: '700'}}>Achievement</h3>
            <h1 style={{...titleStyle, fontSize: '3rem'}}>Excellence</h1>
            <h3 style={{fontSize: '1.5rem', color: '#4472C4', fontWeight: '600'}}>OSAT</h3> {/* Assuming OSAT from screenshot, or Drive Thru */}
            <h3 style={{fontSize: '1.2rem', color: '#4472C4', fontWeight: '600'}}>KPI Targets met for</h3>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
             <div style={{
               width: '150px',
               height: '100px',
               background: '#00B050',
               color: 'white',
               fontSize: '4rem',
               fontWeight: 'bold',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center'
             }}>
               5
             </div>
             <div style={{textAlign: 'left', color: '#4472C4', fontWeight: '700', fontSize: '1.5rem'}}>
               Days in a <br/> Row
             </div>
          </div>

          <div style={{ margin: '2rem 0', color: '#4472C4', fontSize: '1.5rem', fontWeight: '600' }}>
            Displayed after 5+ days <br/> of meeting KPIs
          </div>

          <button onClick={handleNext} style={buttonStyle}>Next</button>
        </div>
      )}

      {/* View 4: Ranking */}
      {step === 4 && (
        <div style={cardStyle}>
          <div style={headerBoxStyle}>
             <h3 style={{fontSize: '1.2rem', fontWeight: '700'}}>Achievement</h3>
             <h1 style={{...titleStyle, fontSize: '2.5rem'}}>Weekly Ranking</h1>
             <h3 style={{fontSize: '1.5rem', color: '#4472C4', fontWeight: '600'}}>Our Store is Ranking</h3>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{
               width: '150px',
               height: '100px',
               background: '#00B050',
               color: 'white',
               fontSize: '3rem',
               fontWeight: 'bold',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center'
             }}>
               #1
             </div>
             <div style={{textAlign: 'left', color: '#4472C4', fontWeight: '700', fontSize: '1.5rem'}}>
               Of X# Stores
             </div>
          </div>

          <div style={{ margin: '2rem 0', color: '#4472C4', fontSize: '1.5rem', fontWeight: '600' }}>
             Top 10 in Region
          </div>

          <button onClick={handleNext} style={buttonStyle}>Finish</button>
        </div>
      )}

    </div>
  );
};

export default KPIEntry;
