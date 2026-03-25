import React from 'react';

function App() {
  return (
    <div style={{ 
      background: '#050510', 
      color: '#00f3ff', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '40px', margin: '0' }}>SOMNA</h1>
      <p style={{ color: 'white', opacity: 0.6 }}>Система заведена</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px 20px', 
        border: '1px solid #00f3ff',
        borderRadius: '10px'
      }}>
        Если ты это видишь — мы победили черный экран.
      </div>
    </div>
  );
}

export default App;
