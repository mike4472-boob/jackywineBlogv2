import React from 'react';

interface MatrixRainProps {
  className?: string;
}

export default function MatrixRain({ className = '' }: MatrixRainProps) {
  const chars = 'JACKYWINE'.split('');
  const columns = 80; // 固定列数
  
  // 生成随机字符串
  const generateRandomString = (length: number) => {
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  // 生成列数据
  const rainColumns = Array.from({ length: columns }, (_, i) => {
    const height = Math.floor(Math.random() * 20) + 10;
    const delay = Math.random() * 5;
    const duration = Math.random() * 3 + 2;
    const text = generateRandomString(height);
    
    return {
      id: i,
      text,
      delay,
      duration,
      left: (i * (100 / columns))
    };
  });

  return (
    <>
      <style>{`
        @keyframes matrixDrop {
          0% {
            transform: translateY(-100vh);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        
        .matrix-column {
          position: absolute;
          top: 0;
          color: #44ffbb;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.2;
          text-shadow: 0 0 10px #44ffbb;
          animation: matrixDrop linear infinite;
          white-space: pre;
          pointer-events: none;
        }
      `}</style>
      
      <div 
        className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
        style={{
          zIndex: -10,
          backgroundColor: '#000000',
          width: '100vw',
          height: '100vh'
        }}
      >
        {rainColumns.map((column) => (
          <div
            key={column.id}
            className="matrix-column"
            style={{
              left: `${column.left}%`,
              animationDelay: `${column.delay}s`,
              animationDuration: `${column.duration}s`
            }}
          >
            {column.text.split('').map((char, index) => (
              <div key={index} style={{ opacity: Math.max(0.1, 1 - (index / column.text.length)) }}>
                {char}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}