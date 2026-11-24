/* Rain on fogged glass: WebGL1 fragment shader, refraction + running drops with wet trails */
(function () {
  'use strict';
  var cv = document.getElementById('glass');
  if (!cv) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = cv.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return;

  var VS = 'attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'uniform sampler2D uSharp;uniform sampler2D uFog;uniform vec2 uRes;uniform float uT;varying vec2 vUv;',
    'float N21(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}',
    // returns: xy = surface normal (inside drop), z = drop mask, w = wet trail
    'vec4 runLayer(vec2 uv,float t,float cols,float rows,float seed,float sizeK){',
    '  vec2 g=vec2(cols,rows);vec2 p=uv*g;vec2 id=floor(p);vec2 f=fract(p);',
    '  float n=N21(id+seed);float n2=N21(id+seed+7.7);float n3=N21(id+seed+3.1);',
    '  float spd=.028+.05*n2;float ti=fract(t*spd+n);',
    '  float k=3.+floor(n2*4.);float s=ti*k;float st=floor(s)+smoothstep(.62,1.,fract(s));',
    '  float prog=st/k;',
    '  float y=.97-prog*.9;',
    '  float x=.5+(n-.5)*.4+sin(prog*11.+n*20.)*.025*(1.-prog*.3);',
    '  vec2 d=vec2((f.x-x)/cols,(f.y-y)/rows);',
    '  float R=(.010+.008*n3+step(.86,n3)*.012)*sizeK;',
    '  float life=smoothstep(0.,.06,ti)*(1.-smoothstep(.92,1.,ti));',
    '  float dd=length(d*vec2(1.,.84))/R;',
    '  float mask=smoothstep(1.,.88,dd)*life;',
    '  vec2 nrm=d/R*mask;',
    '  float up=max(d.y,0.);',
    '  float tw=R*(.52+.22*exp(-up*6.));',
    '  float tr=smoothstep(tw,tw*.35,abs(d.x+sin(up*55.+n*9.)*R*.1))*step(0.,d.y)*exp(-up*2.1)*life*(1.-smoothstep(.85,1.,f.y));',
    '  return vec4(nrm,mask,tr);',
    '}',
    'vec4 staticLayer(vec2 uv,float t,float sc,float seed,float prob,float rmin,float rmax){',
    '  vec2 p=uv*sc;vec2 id=floor(p);vec2 f=fract(p)-.5;',
    '  float n=N21(id+seed);float n2=N21(id+seed+2.7);float n3=N21(id+seed+5.1);',
    '  float ex=step(1.-prob,n);',
    '  vec2 off=(vec2(n2,n3)-.5)*.5;',
    '  float R=(rmin+(rmax-rmin)*n2)/sc;',
    '  float life=smoothstep(0.,.1,fract(t*.012+n*3.))*(1.-smoothstep(.9,1.,fract(t*.012+n*3.)));',
    '  vec2 d=(f-off)/sc;',
    '  float dd=length(d*vec2(1.,.86))/R;',
    '  float mask=smoothstep(1.,.86,dd)*ex*mix(1.,life,.0);',
    '  return vec4(d/R*mask,mask,0.);',
    '}',
    'void main(){',
    '  float asp=uRes.x/uRes.y;vec2 uv=vec2(vUv.x*asp,vUv.y);float t=uT;',
    '  float cols=mix(5.2,3.0,smoothstep(.55,1.5,asp));',
    '  vec4 a=runLayer(uv,t,cols,1.35,1.3,1.35);',
    '  vec4 b=runLayer(uv+vec2(.31,.17),t*.8,cols*1.5,1.9,9.1,.8);',
    '  vec4 c=staticLayer(uv,t,11.,4.4,.38,.12,.30);',
    '  vec4 d=staticLayer(uv,t,26.,1.7,.45,.10,.28);',
    '  vec2 nrm=a.xy+b.xy+c.xy+d.xy;',
    '  float mask=clamp(max(max(a.z,b.z),max(c.z,d.z)),0.,1.);',
    '  float trail=clamp(max(a.w,b.w),0.,1.);',
    '  vec2 sc=vec2(min(1.,asp/(16./9.)),min(1.,(16./9.)/asp));',
    '  vec2 tuv=(vUv-.5)*sc+.5;',
    '  vec3 fog=texture2D(uFog,tuv).rgb;',
    '  vec3 sharp=texture2D(uSharp,tuv).rgb;',
    '  float len=min(length(nrm),1.);',
    '  vec3 N=vec3(nrm,sqrt(max(1.-len*len,0.)));',
    '  vec2 ruv=tuv-nrm*.085*mask;',
    '  vec3 lens=texture2D(uSharp,ruv).rgb;',
    '  lens=lens*1.08+vec3(.012,.03,.04);',
    '  vec3 col=mix(fog,sharp*1.18+vec3(.01,.025,.03),trail*.9);',
    '  col*=1.-trail*.0;',
    '  float rim=smoothstep(.55,1.,len);',
    '  vec3 dropc=lens*(1.-.5*rim);',
    '  float spec=pow(max(dot(N,normalize(vec3(-.45,.55,.7))),0.),38.)*mask;',
    '  float ring=smoothstep(.72,.97,len)*max(dot(normalize(nrm+1e-4),vec2(.55,-.75)),0.)*.38;',
    '  col=mix(col,dropc,mask);',
    '  col+=(spec*.95+ring)*vec3(.8,.93,1.);',
    '  float sh=smoothstep(1.35,.9,length((vec2(0.,.0))));',
    '  vec2 q=vUv-.5;col*=1.-dot(q,q)*.9;',
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uRes = gl.getUniformLocation(pr, 'uRes'), uT = gl.getUniformLocation(pr, 'uT');

  var loaded = 0, tex = [];
  function load(unit, name, src) {
    var im = new Image(); im.onload = function () {
      var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(pr, name), unit);
      if (++loaded === 2) start();
    };
    im.src = src;
  }
  load(0, 'uSharp', 'img/glass-sharp.jpg'); load(1, 'uFog', 'img/glass-fog.jpg');

  var W = 0, H = 0;
  function size() {
    var w = innerWidth, h = Math.max(innerHeight, screen.height > 0 && w < 800 ? Math.min(screen.height, innerHeight + 140) : innerHeight);
    var k = w < 800 ? 0.75 : 0.8;
    var nw = Math.round(w * k), nh = Math.round(h * k);
    if (Math.abs(nw - W) < 2 && Math.abs(nh - H) < 120 && W) return;
    W = nw; H = nh; cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); gl.uniform2f(uRes, W, H);
  }
  var run = true, last = 0, t0 = performance.now(), raf = 0, vis = { a: true, b: true };
  function frame(ts) {
    raf = 0;
    if (!run || document.hidden) return;
    if (ts - last >= 32) { last = ts; gl.uniform1f(uT, (ts - t0) / 1000 + 20.); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && run && !document.hidden && !reduce) raf = requestAnimationFrame(frame); }
  function start() {
    size(); gl.uniform1f(uT, 28.); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    document.documentElement.classList.add('gl-on');
    if (reduce) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id === 'top' ? 'a' : 'b'] = e.isIntersecting; });
      run = vis.a || vis.b; kick();
    });
    ['top', 'arbeiten'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    document.addEventListener('visibilitychange', kick);
    kick();
  }
  addEventListener('resize', function () { size(); if (reduce || !run) gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); });
})();
