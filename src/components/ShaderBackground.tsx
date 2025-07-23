import React, { useEffect, useRef } from 'react';

interface ShaderBackgroundProps {
  className?: string;
}

const vertexShaderSource = `
attribute vec4 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_position.xy * 0.5 + 0.5;
}
`;

const fragmentShaderSource = `
// 设置浮点数精度为中等精度
precision mediump float; 
// GLSLIFY 标识符，用于着色器编译优化
#define GLSLIFY 1 

// 从JavaScript传入的uniform变量
uniform float u_time;      // 时间变量，用于动画效果
uniform vec2 u_mouse;      // 鼠标位置，范围[0,1]
uniform vec2 u_resolution; // 屏幕分辨率
varying vec2 v_uv;         // 从顶点着色器传入的UV坐标

/**
 * 噪声函数 - 生成基于位置的伪随机值
 * @param p 输入的2D坐标
 * @return 返回噪声值
 */
float noise(vec2 p) { 
    vec2 i = floor(p);  // 获取整数部分
    vec2 f = fract(p);  // 获取小数部分
    // 使用平滑插值函数 smoothstep
    f = f * f * (3.0 - 2.0 * f); 
    
    // 计算四个角的噪声值，使用sin函数和时间变量创建动态效果
    float a = sin(i.x + i.y * 31.23 + u_time); 
    float b = sin(i.x + 1.0 + i.y * 31.23 + u_time); 
    float c = sin(i.x + (i.y + 1.0) * 31.23 + u_time); 
    float d = sin(i.x + 1.0 + (i.y + 1.0) * 31.23 + u_time); 
    
    // 双线性插值混合四个角的值
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); 
} 

/**
 * 分形布朗运动(Fractal Brownian Motion) - 创建复杂的噪声模式
 * @param p 输入的2D坐标
 * @return 返回分形噪声值
 */
float fbm(vec2 p) { 
    float sum = 0.0;   // 累积和
    float amp = 1.0;   // 振幅
    float freq = 1.0;  // 频率
    
    // 叠加6层不同频率和振幅的噪声
    for(int i = 0; i < 6; i++) { 
        sum += noise(p * freq) * amp; 
        amp *= 0.5;  // 每层振幅减半
        freq *= 2.0; // 每层频率翻倍
        p += vec2(3.123, 1.732); // 偏移坐标避免重复模式
    } 
    return sum; 
} 

void main() { 
    // 获取当前像素的UV坐标
    vec2 uv = v_uv; 
    
    // 计算屏幕宽高比，保持正确的比例
    vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0); 
    
    // 将UV坐标从[0,1]转换到[-1,1]，并应用宽高比
    uv = uv * 2.0 - 1.0; 
    uv *= aspect; 
    
    // 计算鼠标影响
    vec2 mouseInfluence = (u_mouse * 2.0 - 1.0) * aspect; 
    float mouseDist = length(uv - mouseInfluence);  // 当前像素到鼠标的距离
    float mouseEffect = smoothstep(0.5, 0.0, mouseDist); // 鼠标影响强度
    
    // 创建时间相关的运动向量
    float t = u_time * 0.2; 
    vec2 movement = vec2(sin(t * 0.5), cos(t * 0.7)); 
    
    // 生成三层不同的分形噪声
    float n1 = fbm(uv * 3.0 + movement + mouseEffect);     // 基础噪声层
    float n2 = fbm(uv * 2.0 - movement - mouseEffect);     // 反向运动噪声层
    float n3 = fbm(uv * 4.0 + vec2(n1, n2));               // 基于前两层的复合噪声
    
    // 定义三种基础颜色
    vec3 col1 = vec3(0.267, 1.0, 0.733); // #44ffbb - 青绿色调
    vec3 col2 = vec3(0.0, 0.0, 0.0);     // #000000 - 黑色调
    vec3 col3 = vec3(0.043, 0.863, 0.471); // #0bdc78 - 绿色调
    
    // 根据噪声值混合颜色
    vec3 finalColor = mix(col1, col2, n1);           // 基于n1混合蓝色和粉色
    finalColor = mix(finalColor, col3, n2 * 0.5);   // 基于n2添加绿色
    finalColor += n3 * 0.2;                         // 添加第三层噪声的亮度变化
    
    // 添加鼠标交互的亮度增强
    finalColor += vec3(mouseEffect * 0.2); 
    
    // 输出最终颜色
    gl_FragColor = vec4(finalColor, 1.0); 
}
`;

export default function ShaderBackground({ className = '' }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) {
      console.warn('WebGL not supported, falling back to canvas');
      return;
    }

    // Create shader function
    function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }

    // Create program function
    function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
      const program = gl.createProgram();
      if (!program) return null;
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      
      return program;
    }

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    // Get attribute and uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

    // Create buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // Full screen quad
    const positions = [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Resize function
    function resize() {
      if (!canvas || !gl) return;
      
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Mouse move handler - listen on window to capture all mouse events
    function handleMouseMove(event: MouseEvent) {
      if (!canvas) return;
      
      // Get mouse position relative to viewport
      mouseRef.current = {
        x: event.clientX / window.innerWidth,
        y: 1.0 - (event.clientY / window.innerHeight)
      };
    }

    // Animation loop
    function animate() {
      if (!gl || !program) return;
      
      const webgl = gl as WebGLRenderingContext;
      
      resize();
      
      webgl.clearColor(0, 0, 0, 1);
      webgl.clear(webgl.COLOR_BUFFER_BIT);
      
      webgl.useProgram(program);
      
      // Set uniforms
      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      webgl.uniform1f(timeUniformLocation, currentTime);
      webgl.uniform2f(mouseUniformLocation, mouseRef.current.x, mouseRef.current.y);
      webgl.uniform2f(resolutionUniformLocation, canvas!.width, canvas!.height);
      
      // Set up attributes
      webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
      webgl.enableVertexAttribArray(positionAttributeLocation);
      webgl.vertexAttribPointer(positionAttributeLocation, 2, webgl.FLOAT, false, 0, 0);
      
      // Draw
      webgl.drawArrays(webgl.TRIANGLES, 0, 6);
      
      animationRef.current = requestAnimationFrame(animate);
    }

    // Event listeners - use window for mouse events to capture all movements
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Start animation
    resize();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full ${className}`}
      style={{ zIndex: -10 }}
    />
  );
}