import { MessageCircle, BookOpen, Inbox, Camera, Twitter } from 'lucide-react';
import NavigationPanel from '@/components/NavigationPanel';
import TerminalHeader from '@/components/TerminalHeader';
import ShaderBackground from '@/components/ShaderBackground';

export default function Home() {
  const navigationPanels = [
    {
      title: 'WeChat',
      description: 'Connect via WeChat QR code for instant messaging and updates',
      url: 'https://fastly.jsdelivr.net/gh/bucketio/img9@main/2025/03/03/1741006399641-4ff4fa1c-4c2d-44ba-827a-26bf3e5bb3f9.png',
      icon: <MessageCircle className="w-6 h-6" />
    },
    {
      title: 'Blog',
      description: 'Explore thoughts, tutorials, and insights on technology and design',
      url: 'https://dqxf1izhlm.feishu.cn/wiki/J4PCwCBmEipifUkxglQcu40qnhg',
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      title: '1nbox',
      description: 'Access the knowledge base and wiki for comprehensive resources',
      url: 'https://dqxf1izhlm.feishu.cn/wiki/SHXUwGYeQiuStdkOTjucuzifnRe',
      icon: <Inbox className="w-6 h-6" />
    },
    {
      title: 'Rednote',
      description: 'Follow creative content and lifestyle updates on Rednote platform',
      url: 'https://cutt.ly/zrdVvl5k',
      icon: <Camera className="w-6 h-6" />
    },
    {
      title: 'Twitter',
      description: 'Stay updated with latest thoughts and tech discussions on Twitter',
      url: 'https://x.com/Jackywine',
      icon: <Twitter className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ color: '#44ffbb' }}>
      {/* Shader Background */}
      <ShaderBackground />
      
      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Blog Title */}
        <div className="w-full flex justify-center" style={{ paddingTop: '25vh', paddingBottom: '25vh' }}>
          <h1 className="font-mono text-6xl font-bold text-center tracking-wider" style={{ color: '#44ffbb', fontFamily: 'Monaco, Consolas, "Lucida Console", monospace' }}>JACKYWINE'S BLOG</h1>
        </div>
        {/* Header Section */}
        
        {/* Navigation Grid */}
        <div className="flex-1 container mx-auto px-4 pb-8">
          <div className="mb-8">
            <h2 className="font-mono text-2xl mb-2 text-center" style={{ color: '#44ffbb' }}>
              [NAVIGATION MATRIX]
            </h2>
            <p className="font-mono text-sm text-center" style={{ color: '#44ffbb', opacity: 0.8 }}>
              Select your destination in the digital realm
            </p>
          </div>
          
          {/* Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {navigationPanels.map((panel, index) => (
              <NavigationPanel
                 key={panel.title}
                 title={panel.title}
                 description={panel.description}
                 url={panel.url}
                 icon={panel.icon}
                 className={`
                   transform transition-all duration-500 ease-out
                   hover:scale-105 hover:-translate-y-2
                   ${index % 2 === 0 ? 'lg:translate-y-4' : ''}
                 `}
               />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="container mx-auto px-4 pb-6">
          <div className="text-center font-mono text-xs" style={{ color: '#44ffbb', opacity: 0.7 }}>
            <div className="mb-2">
              <span style={{ color: '#44ffbb', opacity: 0.9 }}>[SYSTEM]</span> Matrix Console &copy; 2025 JACKYWINE
            </div>
            <div>
              <span style={{ color: '#44ffbb', opacity: 0.9 }}>[STATUS]</span> All systems operational | 
              <span style={{ color: '#44ffbb' }}> WebGL: {typeof WebGLRenderingContext !== 'undefined' ? 'ENABLED' : 'FALLBACK'}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}