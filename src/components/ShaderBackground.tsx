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

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
varying vec2 v_uv;

#define MAIN_COLOR vec3(0.267, 1.0, 0.733)
#define BG_COLOR vec3(0.0, 0.0, 0.0)
#define SCROLL_SPEED 1.0
#define DENSITY 40.0
#define BRIGHTNESS 0.8
#define FALLOFF 0.95
#define GLOW_INTENSITY 1.2

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float randomChar(vec2 outer, vec2 inner) {
    vec2 grid = floor(inner * vec2(10.0, 16.0));
    float rnd = random(outer + grid);
    return step(0.5, rnd);
}

float rain(vec2 uv) {
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    uv *= DENSITY * aspect;
    
    vec2 gridPos = floor(uv);
    vec2 cellUv = fract(uv);
    
    float rnd = random(gridPos);
    float speed = SCROLL_SPEED * (rnd * 0.5 + 0.5);
    
    float timeOffset = u_time * speed;
    float yPos = fract(rnd - timeOffset);
    
    // Mouse interaction - slow down columns near mouse and increase brightness
    vec2 mousePos = u_mouse * DENSITY * aspect;
    float mouseDist = length(mousePos - gridPos) / (DENSITY * 0.3);
    float mouseInfluence = smoothstep(0.0, 1.0, exp(-mouseDist * 0.3));
    yPos = fract(rnd - timeOffset * (1.0 - mouseInfluence * 0.9));
    
    // Brightness falloff based on y position
    float brightness = pow(1.0 - yPos, 5.0) * BRIGHTNESS;
    
    // Character display
    float char = randomChar(gridPos, vec2(gridPos.x, yPos * 100.0));
    
    // Glow effect
    float glow = smoothstep(0.9, 1.0, 1.0 - distance(cellUv, vec2(0.5)));
    
    return char * brightness * (1.0 + glow * GLOW_INTENSITY * mouseInfluence);
}

void main() {
    vec2 uv = v_uv;
    
    // Correct aspect ratio
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    uv = uv * 2.0 - 1.0;
    uv *= aspect;
    
    // Matrix rain effect
    float r = rain(vec2(uv.x, uv.y));
    
    // Mouse interaction - create a stronger glow around mouse position
    vec2 mousePos = u_mouse * 2.0 - 1.0;
    mousePos.x *= aspect.x;
    float mouseDist = length(uv - mousePos);
    // Increased glow radius from 0.5 to 1.0 and intensity from 0.5 to 0.8
    float mouseGlow = smoothstep(1.0, 0.0, mouseDist) * 0.8;
    
    // Apply color
    vec3 color = mix(BG_COLOR, MAIN_COLOR, r + mouseGlow);
    
    // Add subtle pulsing glow to the entire scene
    float pulse = 0.05 * sin(u_time * 0.5);
    color += MAIN_COLOR * pulse * r;
    
    // Add subtle scan lines
    float scanLine = sin(uv.y * 100.0) * 0.02;
    color -= scanLine;
    
    gl_FragColor = vec4(color, 1.0);
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