import React, { useRef, useEffect } from 'react'

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uMode;
uniform vec3  uA;
uniform vec3  uB;
uniform vec3  uC;
uniform vec3  uD;
uniform vec3  uBg;
uniform float uIntensity;

#define PI 3.14159265359

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  for(int i=0;i<4;i++){ v+=a*vnoise(p); p*=2.07; a*=0.5; }
  return v;
}

float trace(float x, float t, float idx){
  // Stacked sinusoids — periodic, so the curve loops forever rather than
  // drifting off the bottom of the screen.
  float w1 = 0.22 * sin(x*1.3 + t*0.55 + idx*1.7);
  float w2 = 0.14 * sin(x*2.7 + t*0.85 + idx*2.3);
  float w3 = 0.08 * sin(x*5.1 + t*1.25 + idx*0.7);
  float audio = 0.05 * sin(x*40.0 - t*2.4 + idx*0.7) *
                (0.5 + 0.5*sin(x*3.0 + t*0.8));
  float grit  = 0.012 * (vnoise(vec2(x*40.0 + t*0.6, idx*7.0)) - 0.5);
  return w1 + w2 + w3 + audio + grit;
}

float band(float d, float w){
  return smoothstep(w, 0.0, abs(d));
}

float line(float y, float ty, float w){
  return band(y - ty, w);
}

void main(){
  vec2 frag = gl_FragCoord.xy / uRes.xy;
  vec2 uv   = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);

  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = uTime;

  float baselines[4];
  baselines[0] =  0.40;
  baselines[1] =  0.14;
  baselines[2] = -0.14;
  baselines[3] = -0.40;

  vec3 traceCols[4];
  traceCols[0] = uA;
  traceCols[1] = uB;
  traceCols[2] = uC;
  traceCols[3] = uD;

  float scroll = t * 0.15;
  float xPlot  = p.x + scroll;

  vec3 col = uBg;

  if (uMode < 0.5) {
    col = mix(uBg, mix(uBg, uA, 0.04), smoothstep(0.6, -0.6, p.y));

    float gridX = step(0.985, abs(fract((p.x + scroll*0.5) * 6.0) - 0.5)*2.0);
    float gridY = step(0.985, abs(fract(p.y * 6.0) - 0.5)*2.0);
    col += uA * 0.06 * gridX;
    col += uA * 0.06 * gridY;
    col += uA * 0.18 * smoothstep(0.004, 0.0, abs(p.y));

    float sweep = mod(t*0.35, 2.0) - 1.0;
    float sweepBand = smoothstep(0.06, 0.0, abs(p.x - sweep*aspect*0.6));
    col += uC * 0.18 * sweepBand;

    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float ty = trace(xPlot, t, fi) * 0.55 + baselines[i];
      vec3  c  = traceCols[i];

      col += c * line(p.y, ty, 0.040) * 0.18;
      col += c * line(p.y, ty, 0.018) * 0.45;
      col += c * line(p.y, ty, 0.005) * 1.20;

      if (i == 0) {
        float stepX = (p.x + scroll) * 4.0;
        float tickX = abs(fract(stepX) - 0.5);
        float onTick = smoothstep(0.04, 0.0, tickX);
        float tickH  = 0.025 + 0.025 * sin(stepX*1.7 + t);
        float vBand  = smoothstep(tickH, 0.0, abs(p.y - ty));
        col += c * 0.55 * onTick * vBand;
      }
    }

    col += uA * 0.08 * smoothstep(-0.7, -0.2, -p.y);

  } else if (uMode < 1.5) {
    col = uBg;
    float fold = fbm(p*1.2 + 3.7) * 0.04;
    col -= vec3(0.04,0.03,0.02) * fold;

    float staff = 0.0;
    for (int i = 0; i < 4; i++) {
      for (int k = -2; k <= 2; k++) {
        float fk = float(k);
        float yLine = baselines[i] + fk * 0.018;
        staff = max(staff, smoothstep(0.0015, 0.0, abs(p.y - yLine)));
      }
    }
    col -= uA * staff * 0.18;

    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float ty = trace(xPlot, t, fi) * 0.55 + baselines[i];

      col -= uA * line(p.y, ty, 0.012) * 0.10;
      col -= uA * line(p.y, ty, 0.0035) * 0.95;

      float marks = abs(fract((p.x + scroll*0.3) * 5.0) - 0.5);
      float onMark = smoothstep(0.02, 0.0, marks);
      float vBand = smoothstep(0.014, 0.0, abs(p.y - ty));
      col -= uA * 0.45 * onMark * vBand;
    }

    col -= uA * 0.45 * smoothstep(0.0015, 0.0, abs(p.y));

    float r = length(uv);
    col -= vec3(0.08,0.06,0.03) * smoothstep(0.4, 1.4, r);

  } else {
    vec2 q = vec2(uv.x * aspect, uv.y);
    q.x -= 0.0;
    q.y -= 0.05;
    float r = length(q);
    float a = atan(q.y, q.x);

    col = mix(uBg, vec3(0.04,0.02,0.015), smoothstep(0.95, 0.05, r));

    float spin = t * 0.25;
    float xPolar = a / PI + spin;

    float ringR[4];
    ringR[0] = 0.62; ringR[1] = 0.50; ringR[2] = 0.38; ringR[3] = 0.26;

    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float amp = trace(xPolar, t, fi);
      float ringy = ringR[i] + amp * 0.020;
      vec3  c = traceCols[i];

      float g = smoothstep(0.0035, 0.0, abs(r - ringy));
      col -= vec3(0.05,0.04,0.03) * g * 0.7;

      col += c * smoothstep(0.0015, 0.0, abs(r - ringy)) * 0.55;
    }

    float fine = abs(fract(r*100.0) - 0.5)*2.0;
    col -= vec3(0.04,0.03,0.02) * smoothstep(0.85, 1.0, fine) * smoothstep(0.72, 0.10, r);

    float labelDisc = smoothstep(0.155, 0.150, r);
    col = mix(col, mix(uB, uC, 0.5), labelDisc * 0.95);
    float hole = smoothstep(0.022, 0.020, r);
    col = mix(col, vec3(0.0), hole);

    float labelRing = smoothstep(0.001, 0.0, abs(r - 0.13)) +
                      smoothstep(0.001, 0.0, abs(r - 0.075));
    col += uC * labelRing * 0.4 * smoothstep(0.16, 0.14, r);

    float sheen = smoothstep(-1.0, 1.0, q.y) * smoothstep(0.85, 0.0, r);
    col += vec3(1.0, 0.8, 0.5) * sheen * 0.06;

    col = mix(col, uBg, smoothstep(0.85, 1.05, r));
  }

  float vr = length(uv);
  col *= mix(1.0, smoothstep(1.5, 0.2, vr), 0.6);

  col = pow(max(col, 0.0), vec3(0.95));
  gl_FragColor = vec4(col * uIntensity, 1.0);
}
`

function hexToRgb(h) {
  const c = h.replace('#','')
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function getCSSColor(name) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v.startsWith('#') ? hexToRgb(v) : [0, 0, 0]
}

export function YieldSurface({ mode = 'edm', intensity = 1.0, height = 520 }) {
  const ref = useRef(null)
  const stateRef = useRef({})

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false, premultipliedAlpha: false })
    if (!gl) return

    function compile(type, src) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s))
      }
      return s
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const aLoc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(aLoc)
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uMode = gl.getUniformLocation(prog, 'uMode')
    const uA = gl.getUniformLocation(prog, 'uA')
    const uB = gl.getUniformLocation(prog, 'uB')
    const uC = gl.getUniformLocation(prog, 'uC')
    const uD = gl.getUniformLocation(prog, 'uD')
    const uBg = gl.getUniformLocation(prog, 'uBg')
    const uI = gl.getUniformLocation(prog, 'uIntensity')

    function size() {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(canvas)

    const t0 = performance.now()
    let raf
    function frame(now) {
      const t = (now - t0) / 1000
      const modeNum = stateRef.current.modeNum ?? 0
      const A = stateRef.current.A ?? [0, 0.83, 0.66]
      const B = stateRef.current.B ?? [0.61, 0.35, 0.85]
      const C = stateRef.current.C ?? [0.96, 0.65, 0.14]
      const D = stateRef.current.D ?? [1.0, 0.31, 0.48]
      const BG = stateRef.current.BG ?? [0.03, 0.03, 0.05]
      const I = stateRef.current.intensity ?? 1.0

      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.uniform1f(uMode, modeNum)
      gl.uniform3f(uA, A[0], A[1], A[2])
      gl.uniform3f(uB, B[0], B[1], B[2])
      gl.uniform3f(uC, C[0], C[1], C[2])
      gl.uniform3f(uD, D[0], D[1], D[2])
      gl.uniform3f(uBg, BG[0], BG[1], BG[2])
      gl.uniform1f(uI, I)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  useEffect(() => {
    const modeNum = mode === 'classical' ? 1 : mode === 'vinyl' ? 2 : 0
    const t = setTimeout(() => {
      stateRef.current.modeNum = modeNum
      stateRef.current.A  = getCSSColor('--accent-a')
      stateRef.current.B  = getCSSColor('--accent-b')
      stateRef.current.C  = getCSSColor('--accent-c')
      stateRef.current.D  = getCSSColor('--accent-d')
      stateRef.current.BG = getCSSColor('--bg')
      stateRef.current.intensity = intensity
    }, 30)
    return () => clearTimeout(t)
  }, [mode, intensity])

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height, display: 'block' }}
    />
  )
}
