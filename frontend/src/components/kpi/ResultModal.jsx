import { useState } from 'react';

const ResultModal = ({ streak, onFinish }) => {
  const [step, setStep] = useState(1); // 1: Excellence, 2: Ranking

  const handleNext = () => {
    if (step === 1) setStep(2);
    else onFinish();
  };

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

  const headerBoxStyle = { marginBottom: '1rem' };
  const titleStyle = { fontSize: '2rem', fontWeight: '800', margin: '0.5rem 0', color: 'black' };
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
      {step === 1 && (
        <>
          <div style={headerBoxStyle}>
            <h3 style={{fontSize: '1.2rem', fontWeight: '700'}}>Achievement</h3>
            <h1 style={{...titleStyle, fontSize: '3rem'}}>Excellence</h1>
            <h3 style={{fontSize: '1.5rem', color: '#4472C4', fontWeight: '600'}}>OSAT</h3>
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
               {streak}
             </div>
             <div style={{textAlign: 'left', color: '#4472C4', fontWeight: '700', fontSize: '1.5rem'}}>
               Days in a <br/> Row
             </div>
          </div>

          <div style={{ margin: '2rem 0', color: '#4472C4', fontSize: '1.5rem', fontWeight: '600' }}>
            Displayed after 5+ days <br/> of meeting KPIs
          </div>
        </>
      )}

      {step === 2 && (
        <>
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
               Of 12 Stores
             </div>
          </div>

          <div style={{ margin: '2rem 0', color: '#4472C4', fontSize: '1.5rem', fontWeight: '600' }}>
             Top 10 in Region
          </div>
        </>
      )}

      <button onClick={handleNext} style={buttonStyle}>
        {step === 1 ? 'Next' : 'Finish'}
      </button>
    </div>
  );
};

export default ResultModal;
