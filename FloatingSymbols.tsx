import React from 'react';

const FloatingSymbols = () => {
  const symbols = ['+', '−', '×', '÷', '√', 'π', '∑', '∫', 'ƒ', '≈'];
  const colors = ['#a78bfa', '#7dd3fc', '#f472b6', '#fde047', '#86efac']; // violet, sky, pink, yellow, green

  return (
    <div className="absolute inset-0 overflow-hidden">
      {symbols.map((symbol, index) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 2 + 1}rem`,
          animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
          opacity: 0.3,
          color: colors[index % colors.length],
        };
        return (
          <span key={index} style={style}>
            {symbol}
          </span>
        );
      })}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-30px) translateX(20px) rotate(180deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FloatingSymbols;