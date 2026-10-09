"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

/**
 * Slow drifting bands in the brand blue over near-black.
 *
 * Output is deliberately clamped dark. This sits behind white body copy, so
 * the ceiling on luminance is a contrast requirement, not a taste call — the
 * mix never reaches full brand blue and the whole field is scaled down.
 */
const FRAG = `
precision mediump float;
uniform vec2  u_res;
uniform float u_time;

// Cheap value noise — no texture lookups, no derivatives.
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 q = vec2(uv.x * 1.6, uv.y) * 2.2;
  float t = u_time * 0.045;

  float bands = fbm(q + vec2(t, -t * 0.6));
  bands = fbm(q + bands * 1.4 + vec2(-t * 0.5, t * 0.3));

  // Strongest low and to the left, fading out across the panel.
  float fall = smoothstep(1.15, 0.05, length(vec2(uv.x * 1.1, 1.0 - uv.y)));
  float m = smoothstep(0.38, 0.92, bands) * fall;

  vec3 base  = vec3(0.012, 0.027, 0.059);
  vec3 blue  = vec3(0.024, 0.333, 0.929);
  vec3 col = mix(base, blue, m * 0.55) * 0.92;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function ShaderBackdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // No WebGL, or the visitor asked for less motion: the section keeps its
    // own flat background and nothing is drawn.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");

    // Half resolution, capped: the field is soft, so nobody can tell, and it
    // keeps a decorative panel off the critical path on weaker machines.
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    let raf = 0;
    let running = false;
    let last = 0;
    const started = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      // ~30fps is plenty for something this slow, and halves the GPU work.
      if (now - last >= 33) {
        last = now;
        resize();
        gl.uniform1f(uTime, (now - started) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      raf = requestAnimationFrame(frame);
    };

    const setRunning = (on: boolean) => {
      if (on === running) return;
      running = on;
      if (on) raf = requestAnimationFrame(frame);
      else cancelAnimationFrame(raf);
    };

    // Draw one frame immediately so it is never blank, then only animate while
    // the panel is actually on screen.
    resize();
    gl.uniform1f(uTime, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const io = new IntersectionObserver((entries) => setRunning(entries[0].isIntersecting), { threshold: 0 });
    io.observe(canvas);
    const onVisibility = () => setRunning(!document.hidden && running);
    document.addEventListener("visibilitychange", onVisibility);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      setRunning(false);
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas className={className} ref={ref} aria-hidden="true" />;
}
