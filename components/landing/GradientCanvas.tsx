'use client';

import { useEffect, useRef } from 'react';

type Rgb = [number, number, number];
type Palette = [Rgb, Rgb, Rgb, Rgb];

const hex = (h: string): Rgb => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
const palette = (...c: string[]) => c.map(hex) as Palette;

/** Couleurs du maillage : base, puis trois couches qui se mélangent. */
const PALETTES = {
  hero: {
    light: palette('#FFE6D1', '#FF8A2A', '#FF6F5B', '#FFB547'),
    dark: palette('#120B08', '#6B2700', '#8A3300', '#3A1A0C'),
  },
  // Assez sombre pour du texte blanc AA partout.
  ember: {
    light: palette('#5C2200', '#B84500', '#8A3300', '#A63E00'),
    dark: palette('#2A1206', '#8A3300', '#5C2200', '#A63E00'),
  },
} as const;

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Bruit simplex 3D (Ashima Arts, licence MIT) + déformation du domaine : rendu « soie » à la Stripe.
const FRAG = `precision mediump float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;
uniform vec3 uC0;uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=uv*vec2(uRes.x/uRes.y,1.)*1.15;
  float t=uTime*.045;
  p+=uMouse*.08;
  vec2 w=vec2(snoise(vec3(p*.7,t)),snoise(vec3(p*.7+4.7,t*1.1)));
  p+=w*.45;
  float n1=snoise(vec3(p*.85,t*.9));
  float n2=snoise(vec3(p*1.35+7.3,t*1.25));
  float n3=snoise(vec3(p*.55-3.1,t*.7));
  vec3 col=uC0;
  col=mix(col,uC1,smoothstep(-.35,.75,n1));
  col=mix(col,uC2,smoothstep(-.05,.85,n2)*.85);
  col=mix(col,uC3,smoothstep(.15,.95,n3)*.75);
  float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
  col+=(g-.5)*.022;
  gl_FragColor=vec4(col,1.);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

/**
 * Maillage de dégradés animé en WebGL. Rendu à demi-résolution (le flou ne perd rien,
 * le GPU respire), en pause hors écran / onglet caché, image fixe en mouvement réduit.
 * Si WebGL manque, le dégradé CSS posé dessous reste visible.
 */
export function GradientCanvas({ variant = 'hero', className }: { variant?: keyof typeof PALETTES; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl || gl.isContextLost()) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u('uRes');
    const uTime = u('uTime');
    const uMouse = u('uMouse');
    const uCols = [u('uC0'), u('uC1'), u('uC2'), u('uC3')];

    const applyPalette = () => {
      const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      PALETTES[variant][theme].forEach((c, i) => gl.uniform3f(uCols[i], c[0], c[1], c[2]));
    };
    applyPalette();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let visible = true;
    let time = 18; // départ au milieu d'un motif déjà formé
    let last = performance.now();
    let shown = false;

    const draw = () => {
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!shown) {
        shown = true;
        canvas.style.opacity = '1';
      }
    };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // Toujours renvoyer viewport et résolution : au remontage (StrictMode) le canvas a déjà
      // la bonne taille mais le programme est neuf, sans uniform.
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      if (reduced || !visible) draw();
    };

    const loop = (now: number) => {
      time += Math.min(now - last, 50) / 1000;
      last = now;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduced || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    const onPointer = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * -2 + 1;
    };
    if (fine && !reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    const mo = new MutationObserver(() => {
      applyPalette();
      if (!raf) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      // Pas de loseContext() : en StrictMode l'effet est rejoué sur le même canvas,
      // qui rendrait alors le contexte déjà perdu. On libère seulement nos ressources.
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [variant]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`opacity-0 transition-opacity duration-1000 ${className ?? ''}`}
    />
  );
}
