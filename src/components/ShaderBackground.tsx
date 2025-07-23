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
precision mediump float; 
 #define GLSLIFY 1 
 
 uniform float u_time; 
 uniform vec2 u_mouse; 
 uniform vec2 u_resolution; 
 varying vec2 v_uv; 
 
 float noise(vec2 p) { 
     vec2 i = floor(p); 
     vec2 f = fract(p); 
     f = f * f * (3.0 - 2.0 * f); 
     float a = sin(i.x + i.y * 31.23 + u_time); 
     float b = sin(i.x + 1.0 + i.y * 31.23 + u_time); 
     float c = sin(i.x + (i.y + 1.0) * 31.23 + u_time); 
     float d = sin(i.x + 1.0 + (i.y + 1.0) * 31.23 + u_time); 
     return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); 
 } 
 
 float fbm(vec2 p) { 
     float sum = 0.0; 
     float amp = 1.0; 
     float freq = 1.0; 
     for(int i = 0; i < 6; i++) { 
         sum += noise(p * freq) * amp; 
         amp *= 0.5; 
         freq *= 2.0; 
         p += vec2(3.123, 1.732); 
     } 
     return sum; 
 } 
 
 void main() { 
     vec2 uv = v_uv; 
     vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0); 
     uv = uv * 2.0 - 1.0; 
     uv *= aspect; 
     
     vec2 mouseInfluence = (u_mouse * 2.0 - 1.0) * aspect; 
     float mouseDist = length(uv - mouseInfluence); 
     float mouseEffect = smoothstep(0.5, 0.0, mouseDist); 
     
     float t = u_time * 0.2; 
     vec2 movement = vec2(sin(t * 0.5), cos(t * 0.7)); 
     
     float n1 = fbm(uv * 3.0 + movement + mouseEffect); 
     float n2 = fbm(uv * 2.0 - movement - mouseEffect); 
     float n3 = fbm(uv * 4.0 + vec2(n1, n2)); 
     
     vec3 col1 = vec3(0.2, 0.5, 0.8); 
     vec3 col2 = vec3(0.8, 0.2, 0.5); 
     vec3 col3 = vec3(0.1, 0.8, 0.4); 
     
     vec3 finalColor = mix(col1, col2, n1); 
     finalColor = mix(finalColor, col3, n2 * 0.5); 
     finalColor += n3 * 0.2; 
     
     finalColor += vec3(mouseEffect * 0.2); 
     
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