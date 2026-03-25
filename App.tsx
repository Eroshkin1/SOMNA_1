import React from 'react';

const App = () => {
  return (
    <div style={{ 
      backgroundColor: '#050510', 
      color: '#00f3ff', 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>SOMNA</h1>
      <p style={{ color: 'white', opacity: 0.7 }}>Система ожила. Белый экран побежден.</p>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        border: '2px solid #00f3ff', 
        borderRadius: '20px',
        textAlign: 'center'
      }}>
        <p>Нажми F12 -> Console</p>
        <p>Если там нет красных ошибок — мы готовы возвращать 3D!</p>
      </div>
    </div>
  );
};

export default App;
