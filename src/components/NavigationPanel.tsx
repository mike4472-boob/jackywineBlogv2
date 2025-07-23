import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface NavigationPanelProps {
  title: string;
  description: string;
  url: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function NavigationPanel({ 
  title, 
  description, 
  url, 
  icon, 
  className = '' 
}: NavigationPanelProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`
        relative group cursor-pointer
        bg-black border-2 transition-all duration-300 ease-in-out
        active:scale-95
        ${isClicked ? 'opacity-80' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        borderColor: '#44ffbb',
        boxShadow: isHovered 
          ? '0 0 20px rgba(68, 255, 187, 0.3), inset 0 0 20px rgba(68, 255, 187, 0.1)'
          : '0 0 10px rgba(68, 255, 187, 0.1)'
      }}
    >
      {/* Animated border glow */}
      <div 
        className={`
          absolute inset-0 border-2 opacity-0
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : ''}
        `}
        style={{
          borderColor: '#44ffbb',
          boxShadow: '0 0 15px rgba(68, 255, 187, 0.5)'
        }}
      />
      
      {/* Content */}
      <div className="relative p-6 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`
                transition-all duration-300
                ${isHovered ? 'scale-110' : ''}
              `}
              style={{
                color: isHovered ? '#44ffbb' : '#44ffbb'
              }}>
                {icon}
              </div>
            )}
            <h3 className={`
              font-mono text-lg font-bold
              transition-all duration-300
            `}
            style={{
              color: '#44ffbb'
            }}>
              {title}
            </h3>
          </div>
          <ExternalLink 
            className={`
              w-5 h-5 transition-all duration-300
              ${isHovered ? 'scale-110' : ''}
            `}
            style={{
              color: isHovered ? '#44ffbb' : '#44ffbb'
            }}
          />
        </div>
        
        {/* Description */}
        <p className={`
          font-mono text-sm leading-relaxed
          transition-all duration-300
        `}
        style={{
          color: isHovered ? '#44ffbb' : '#44ffbb',
          opacity: isHovered ? 0.9 : 0.8
        }}>
          {description}
        </p>
        
        {/* Terminal-style prompt */}
        <div className={`
          mt-4 pt-4 border-t font-mono text-xs
          transition-all duration-300
        `}
        style={{
          borderTopColor: '#44ffbb',
          color: '#44ffbb',
          opacity: isHovered ? 0.9 : 0.7
        }}>
          <span style={{ color: '#44ffbb' }}>$</span> 
          <span className={`
            transition-all duration-300
          `}
          style={{
            color: '#44ffbb',
            opacity: isHovered ? 1 : 0.8
          }}>
            access {title.toLowerCase().replace(' ', '_')}
          </span>
          <span className={`
            inline-block w-2 h-4 ml-1
            transition-all duration-500
            ${isHovered ? 'animate-pulse' : ''}
          `}
          style={{
            backgroundColor: '#44ffbb'
          }} />
        </div>
      </div>
      
      {/* Scan line effect */}
      <div 
        className={`
          absolute top-0 left-0 w-full h-0.5
          transition-all duration-1000 ease-in-out
          ${isHovered ? 'animate-pulse' : ''}
        `}
        style={{
          backgroundColor: '#44ffbb',
          boxShadow: '0 0 10px rgba(68, 255, 187, 0.8)'
        }}
      />
    </div>
  );
}