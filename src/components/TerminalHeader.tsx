import { useState, useEffect } from 'react';
import { Terminal, Wifi, Battery, Clock } from 'lucide-react';

export default function TerminalHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [typedText, setTypedText] = useState('');
  const fullText = 'JACKYWINE MATRIX CONSOLE v2.0.25';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let index = 0;
    const typeTimer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeTimer);
      }
    }, 100);

    return () => clearInterval(typeTimer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* Main terminal window */}
      <div 
        className="
          bg-black border-2 
          shadow-lg
          backdrop-blur-sm
        "
        style={{
          borderColor: '#44ffbb',
          boxShadow: '0 0 30px rgba(68, 255, 187, 0.3), inset 0 0 30px rgba(68, 255, 187, 0.05)'
        }}
      >
        {/* Terminal title bar */}
        <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#44ffbb', backgroundColor: 'rgba(68, 255, 187, 0.05)' }}>
          <div className="flex items-center space-x-3">
            <Terminal className="w-5 h-5" style={{ color: '#44ffbb' }} />
            <span className="font-mono text-sm" style={{ color: '#44ffbb' }}>MATRIX_CONSOLE.exe</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4" style={{ color: '#44ffbb' }} />
              <Battery className="w-4 h-4" style={{ color: '#44ffbb' }} />
              <Clock className="w-4 h-4" style={{ color: '#44ffbb' }} />
            </div>
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#44ffbb' }}></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>
        
        {/* Terminal content */}
        <div className="p-6 space-y-4">
          {/* System info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono" style={{ color: '#44ffbb' }}>$</span>
              <span className="font-mono text-lg" style={{ color: '#44ffbb' }}>
                {typedText}
                <span className="inline-block w-2 h-5 ml-1 animate-pulse" style={{ backgroundColor: '#44ffbb' }} />
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 font-mono text-sm">
              <div className="space-y-1">
                <div style={{ color: '#44ffbb', opacity: 0.9 }}>SYSTEM STATUS:</div>
                <div className="ml-4" style={{ color: '#44ffbb' }}>● ONLINE</div>
                <div className="ml-4" style={{ color: '#44ffbb' }}>● SECURE CONNECTION</div>
                <div className="ml-4" style={{ color: '#44ffbb' }}>● MATRIX PROTOCOL ACTIVE</div>
              </div>
              
              <div className="space-y-1">
                <div style={{ color: '#44ffbb', opacity: 0.9 }}>TIMESTAMP:</div>
                <div className="ml-4" style={{ color: '#44ffbb' }}>{formatDate(currentTime)}</div>
                <div className="ml-4" style={{ color: '#44ffbb' }}>{formatTime(currentTime)}</div>
                <div className="ml-4" style={{ color: '#44ffbb' }}>UTC+{-currentTime.getTimezoneOffset()/60}</div>
              </div>
            </div>
          </div>
          
          {/* Welcome message */}
          <div className="border-t pt-4 mt-6" style={{ borderTopColor: '#44ffbb' }}>
            <div className="font-mono text-sm leading-relaxed" style={{ color: '#44ffbb' }}>
              <div className="mb-2">
                <span style={{ color: '#44ffbb', opacity: 0.9 }}>[INFO]</span> Welcome to the Matrix Console
              </div>
              <div className="mb-2">
                <span style={{ color: '#44ffbb', opacity: 0.9 }}>[INFO]</span> Select a navigation panel to access external systems
              </div>
              <div>
                <span style={{ color: '#44ffbb', opacity: 0.9 }}>[INFO]</span> All connections are secured and encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glowing border effect */}
      <div 
        className="absolute inset-0 border-2 opacity-50 animate-pulse pointer-events-none"
        style={{
          borderColor: '#44ffbb',
          boxShadow: '0 0 20px rgba(68, 255, 187, 0.4)'
        }}
      />
    </div>
  );
}