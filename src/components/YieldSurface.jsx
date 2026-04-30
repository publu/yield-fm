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
    // ── HIP-HOP: aged greenback paper with engraved hairlines ──
    // The Benjamin Franklin portrait is layered as a real PNG image
    // on top of the canvas (see SectionHero.jsx). The shader provides
    // the moving paper / guilloche / yield-curve engraving underneath.

    float r = length(uv);

    vec3 paper = vec3(0.82, 0.78, 0.62);
    float fiber = vnoise(p * 600.0) * 0.06 - 0.03;
    paper += fiber;
    float age = vnoise(p * 3.0 + 5.0);
    paper *= mix(0.78, 1.0, age);
    paper = mix(paper, paper * vec3(0.78, 0.95, 0.78), 0.18);

    col = paper;

    // outer rectangular border frame
    float frameDx = aspect - 0.04;
    float frameDy = 0.46;
    float ox = abs(p.x) - frameDx;
    float oy = abs(p.y) - frameDy;
    float outerEdge = max(ox, oy);
    col = mix(col, vec3(0.10, 0.18, 0.10), smoothstep(0.003, 0.0, abs(outerEdge + 0.005)) * 0.9);
    col = mix(col, vec3(0.10, 0.18, 0.10), smoothstep(0.002, 0.0, abs(outerEdge + 0.020)) * 0.8);
    if (outerEdge > -0.018 && outerEdge < -0.008) {
      float dots = step(0.5, fract((p.x + p.y) * 60.0));
      col = mix(col, vec3(0.10, 0.18, 0.10), dots * 0.4);
    }

    // dense guilloche border pattern
    float borderMask = 1.0 - smoothstep(-0.10, -0.04, outerEdge);
    if (borderMask > 0.01) {
      float edgeDist = -outerEdge;
      float perim;
      if (abs(p.x)/frameDx > abs(p.y)/frameDy) {
        perim = (p.y / frameDy) * 1.5 + sign(p.x) * 0.5;
      } else {
        perim = (p.x / frameDx) * 1.5 + sign(p.y) * 1.5;
      }
      float gpat = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float wave = sin(perim * 80.0 + fi * 2.094 + t * 0.05) * 0.012;
        float gband = abs(fract((edgeDist - wave) * 220.0) - 0.5) * 2.0;
        gpat = max(gpat, smoothstep(0.85, 1.0, gband));
      }
      col = mix(col, vec3(0.08, 0.20, 0.10), gpat * borderMask * 0.85);
    }

    // corner "100" numerals (4 corners)
    for (int cx = 0; cx < 2; cx++) {
      for (int cy = 0; cy < 2; cy++) {
        vec2 cc = vec2(
          (float(cx)*2.0 - 1.0) * (aspect - 0.16),
          (float(cy)*2.0 - 1.0) * 0.34
        );
        vec2 cp = p - cc;
        if (abs(cp.x) < 0.08 && abs(cp.y) < 0.035) {
          float gx = (cp.x + 0.08) / 0.053;
          float gi = floor(gx);
          float gf = (fract(gx) - 0.5) * 0.053;
          float gy = cp.y;

          float glyph = 0.0;
          if (gi < 0.5) {
            float bar = smoothstep(0.008, 0.005, abs(gf + 0.005));
            float top = smoothstep(0.012, 0.010, abs(gf + 0.012)) *
                        smoothstep(0.020, 0.025, gy);
            float baseSerif = smoothstep(0.020, 0.018, abs(gf)) *
                              smoothstep(-0.024, -0.026, -abs(gy));
            glyph = max(bar, max(top, baseSerif)) *
                    smoothstep(0.030, 0.025, abs(gy));
          } else {
            vec2 og = vec2(gf, gy);
            og.x *= 1.6;
            float od = length(og);
            glyph = smoothstep(0.030, 0.024, od) - smoothstep(0.024, 0.018, od);
          }
          col = mix(col, vec3(0.06, 0.16, 0.08), glyph * 0.95);
        }
      }
    }

    // faint yield-curve traces baked into the paper
    float curveInk = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float amp = trace(p.x*1.5 + scroll, t, fi);
      float ty = baselines[i] * 0.4 + amp * 0.06;
      float ln = smoothstep(0.002, 0.0, abs(p.y - ty));
      curveInk += ln * (0.20 + fi*0.05);
    }
    col = mix(col, vec3(0.08, 0.20, 0.10), curveInk * 0.55);

    // micro-text band along bottom
    if (p.y < -0.36 && p.y > -0.39) {
      float micro = abs(fract((p.x + scroll*0.3) * 200.0) - 0.5);
      col = mix(col, vec3(0.06, 0.14, 0.08), smoothstep(0.3, 0.0, micro) * 0.5);
    }

    // distress / aging
    float wear = vnoise(p * 8.0) * vnoise(p * 30.0);
    col = mix(col, paper * 0.85, smoothstep(0.4, 0.7, wear) * 0.3);

    float crease = smoothstep(0.001, 0.0, abs(p.x + 0.15)) +
                   smoothstep(0.001, 0.0, abs(p.x - 0.55));
    col -= vec3(0.05, 0.04, 0.03) * crease * 0.4;

    float grain = (vnoise(p*180.0) - 0.5) * 0.04;
    col += grain;

    col *= mix(1.0, smoothstep(1.6, 0.4, r), 0.25);
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
    const modeNum = mode === 'classical' ? 1 : mode === 'hiphop' ? 2 : 0
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
