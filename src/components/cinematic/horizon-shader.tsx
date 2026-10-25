"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * "The Horizon" — an original abstract motion graphic used until real
 * hero footage exists. Night haze, distant lights drifting along a horizon
 * like traffic on a far-off highway, and a vertical seam of light that
 * divides the frame into two tints. Pure WebGL1 — no 3D library.
 *
 * Progressive: falls back to a CSS gradient if WebGL is unavailable,
 * renders one still frame for reduced motion, pauses when offscreen.
 */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uSplit;

float hash(float n){return fract(sin(n)*43758.5453123);}
float hash2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 x){vec2 i=floor(x);vec2 f=fract(x);f=f*f*(3.-2.*f);
  float a=hash2(i);float b=hash2(i+vec2(1.,0.));float c=hash2(i+vec2(0.,1.));float d=hash2(i+vec2(1.,1.));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float aspect=uRes.x/uRes.y;
  float t=uTime;

  vec3 ink=vec3(.031,.035,.051);
  vec3 midnight=vec3(.063,.094,.153);
  vec3 crimson=vec3(.655,.208,.239);
  vec3 steel=vec3(.255,.416,.522);
  vec3 gold=vec3(.788,.647,.416);
  vec3 ivory=vec3(.953,.941,.918);

  float horizon=.38+ (uMouse.y-.5)*.03;
  float seam=.5+(uMouse.x-.5)*.08;

  // Sky: ink above, midnight band toward the horizon.
  vec3 col=mix(midnight*.9,ink,smoothstep(horizon,1.,uv.y));
  col=mix(col,ink*.6,(1.-smoothstep(0.,horizon,uv.y))*.85);

  // Drifting haze.
  vec2 hp=vec2(uv.x*aspect*1.4+t*.015,uv.y*3.2-t*.01);
  float haze=fbm(hp+fbm(hp*.6+t*.02));
  float band=exp(-abs(uv.y-horizon)*5.);

  // Two tints meeting at the seam.
  float side=smoothstep(-.35,.35,(uv.x-seam)*aspect);
  float apart=uSplit*.25;
  vec3 tint=mix(crimson,steel,side);
  col+=tint*haze*band*(.55+apart);
  col+=tint*.05*haze;

  // Horizon glow line.
  col+=mix(tint,gold,.35)*exp(-abs(uv.y-horizon)*60.)*.35;

  // Distant lights travelling along the horizon.
  for(int i=0;i<26;i++){
    float fi=float(i);
    float dir=hash(fi*7.1)>.5?1.:-1.;
    float speed=.006+hash(fi*3.7)*.018;
    float x=fract(hash(fi*1.3)+dir*t*speed)*1.3-.15;
    float y=horizon+(hash(fi*5.9)-.55)*.06;
    vec2 d=(uv-vec2(x,y))*vec2(aspect,1.);
    float r=.0016+hash(fi*9.2)*.004;
    float core=1.-smoothstep(r*.3,r,length(d));
    float bloom=exp(-length(d*vec2(.6,1.))*90.)*.35;
    float tw=.65+.35*sin(t*(1.+hash(fi)*2.)+fi);
    vec3 lc=mix(ivory,gold,hash(fi*2.2));
    col+=lc*(core*.9+bloom)*tw;
  }

  // Near bokeh: soft out-of-focus discs drifting slowly.
  for(int i=0;i<9;i++){
    float fi=float(i)+40.;
    vec2 c=vec2(fract(hash(fi)+t*.004*(hash(fi*1.7)-.5)),.08+hash(fi*4.1)*.5);
    float r=.05+hash(fi*2.9)*.09;
    float dd=length((uv-c)*vec2(aspect,1.));
    float disc=(1.-smoothstep(r*.82,r,dd))*.035;
    col+=mix(tint,gold,.5)*disc;
  }

  // The seam: a thin vertical line of light that widens as the page scrolls.
  float sx=abs(uv.x-seam)*aspect;
  float seamLine=exp(-sx*(900.-uSplit*600.))*(.55+.25*sin(t*1.7));
  float seamGlow=exp(-sx*14.)*(.06+uSplit*.12);
  col+=gold*(seamLine*smoothstep(0.,horizon+.25,uv.y)*(1.-smoothstep(horizon,1.,uv.y))*1.4+seamGlow);

  // Vignette + grain.
  vec2 v=uv-.5;
  col*=1.-dot(v*vec2(1.1,1.3),v*vec2(1.1,1.3))*1.15;
  col+=(hash2(uv*uRes+fract(t)*100.)-.5)*.035;

  gl_FragColor=vec4(max(col,0.),1.);
}`;

export function HorizonShader({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) {
      canvas.dataset.fallback = "true";
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.dataset.fallback = "true";
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uSplit = gl.getUniformLocation(prog, "uSplit");

    const small = window.matchMedia("(max-width: 768px)").matches;
    const scale = Math.min(window.devicePixelRatio || 1, small ? 0.75 : 1.25);

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * scale));
      const h = Math.max(1, Math.floor(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    let smoothedSplit = 0;
    const start = performance.now() - 40_000 * Math.random();

    const draw = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const target = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      smoothedSplit += (target - smoothedSplit) * 0.08;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uSplit, smoothedSplit);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(now);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    if (prefersReducedMotion()) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !prefersReducedMotion()) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && visible && !prefersReducedMotion()) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      // Free GPU resources but keep the context: effects re-run when the route is re-shown.
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`h-full w-full bg-[radial-gradient(80%_60%_at_50%_62%,#1d2433_0%,#08090d_70%)] ${className}`}
    />
  );
}
