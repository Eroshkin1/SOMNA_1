import React, { useState } from 'react';

// Чистый компонент без внешних зависимостей (lucide, framer-motion и т.д.)
function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      backgroundColor: '#050510', 
      color: 'white', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'sans-serif' 
    }}>
      <h1 style={{ color: '#00f3ff' }}>SOMNA PROJECT</h1>
      <p>Если ты видишь этот текст, значит система ожила!</p>
      
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '15px 30px',
          fontSize: '20px',
          borderRadius: '50px',
          border: '1px solid #00f3ff',
          background: 'transparent',
          color: 'white',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Счетчик кликов: {count}
      </button>

      <div style={{ marginTop: '40px', color: 'gray', fontSize: '12px' }}>
        Сейчас мы проверили базу. Если это работает, будем добавлять 3D-куб по частям.
      </div>
    </div>
  );
}

export default App;
