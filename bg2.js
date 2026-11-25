/* Варианты фона: ?bg=aurora | ?bg=ink | ?bg=plain. Один WebGL-холст, реагирует на скролл и палец/мышь */
(function(){
  var m=(location.search.match(/bg=(\w+)/)||[])[1]; var cv=document.getElementById('glass');
  if(!cv||!m)return;
  document.body.classList.add('bg-'+m);
  var st=document.createElement('style');st.textContent='body::before{background:#021a26!important}'; document.head.appendChild(st);
  if(m==='plain'){cv.style.display='none';return;}
  var gl=cv.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'}); if(!gl)return;
  var head='precision mediump float;uniform vec2 uRes;uniform float uT;uniform float uS;uniform vec2 uP;varying vec2 vUv;'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
  'float fb(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}';
  var AUR=head+'void main(){float asp=uRes.x/uRes.y;vec2 uv=vec2(vUv.x*asp,vUv.y);float t=uT*.05;uv.y+=uS*.12;'+
   'vec2 q=vec2(fb(uv*1.1+vec2(0.,t)),fb(uv*1.1+vec2(5.2,1.3)-t));'+
   'float f=fb(uv*1.3+2.2*q+vec2(t,0.));'+
   'vec3 bg=vec3(.008,.10,.15);vec3 c1=vec3(.00,.42,.55);vec3 c2=vec3(.10,.78,.82);vec3 c3=vec3(.93,.35,.14);'+
   'vec3 col=mix(bg,c1,smoothstep(.25,.75,f));col=mix(col,c2,smoothstep(.55,.95,f*q.x*1.7)*.8);'+
   'col+=c3*.18*smoothstep(.7,1.,q.y*f*2.)*(0.5+.5*sin(t*6.));'+
   'float d=length(vUv*vec2(asp,1.)-uP*vec2(asp,1.));col+=c2*.10*exp(-d*3.);'+
   'col*=.62+.38*smoothstep(1.2,.2,length(vUv-.5));col+=(h(vUv*uRes+uT)-.5)*.02;gl_FragColor=vec4(col,1.);}';
  var INK=head+'void main(){float asp=uRes.x/uRes.y;vec2 uv=vec2(vUv.x*asp,vUv.y);float t=uT*.04;uv.y+=uS*.15;'+
   'vec2 pp=uP*vec2(asp,1.);vec2 dv=uv-pp;float dd=length(dv);uv+=normalize(dv+1e-4)*.06*exp(-dd*4.);'+
   'float f=fb(uv*1.6+vec2(t,-t*.7))+.5*fb(uv*3.1-vec2(t*1.3,t));'+
   'float L=f*9.;float li=abs(fract(L)-.5);float line=smoothstep(.06,.0,li-.43+.0);'+
   'float ln=1.-smoothstep(.0,.045,abs(fract(L)-.5)-.455+.45-.45+.0);'+
   'float w=smoothstep(.028,.0,abs(fract(L)-.5)-.47);'+
   'vec3 bg=mix(vec3(.01,.09,.13),vec3(.0,.16,.22),f);vec3 ac=mix(vec3(.15,.75,.85),vec3(.94,.37,.15),smoothstep(.5,1.,f));'+
   'vec3 col=bg+ac*w*(.28+.5*exp(-dd*2.5));col*=.65+.35*smoothstep(1.3,.2,length(vUv-.5));gl_FragColor=vec4(col,1.);}';
  function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(o));return null}return o}
  var vs=sh(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}');
  var fs=sh(gl.FRAGMENT_SHADER,m==='ink'?INK:AUR); if(!vs||!fs)return;
  var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var a=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  var uR=gl.getUniformLocation(pr,'uRes'),uT=gl.getUniformLocation(pr,'uT'),uS=gl.getUniformLocation(pr,'uS'),uP=gl.getUniformLocation(pr,'uP');
  var mob=matchMedia('(max-width:900px)').matches,k=Math.min(devicePixelRatio||1,mob?1:1.5)*(mob?.6:.7);
  function size(){cv.width=Math.round(innerWidth*k);cv.height=Math.round(innerHeight*k);gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(uR,cv.width,cv.height)}
  size();addEventListener('resize',size);
  var px=.7,py=.5,tx=.7,ty=.5,sS=scrollY/innerHeight,t0=performance.now();
  function mv(e){var p=e.touches?e.touches[0]:e;tx=p.clientX/innerWidth;ty=1-p.clientY/innerHeight}
  addEventListener('pointermove',mv,{passive:true});addEventListener('touchmove',mv,{passive:true});
  var vis=true;document.addEventListener('visibilitychange',function(){vis=!document.hidden});
  var last=0;(function f(ts){requestAnimationFrame(f);if(!vis||ts-last<33)return;last=ts;
    sS+=(scrollY/innerHeight-sS)*.07;px+=(tx-px)*.06;py+=(ty-py)*.06;
    gl.uniform1f(uT,(ts-t0)/1000+10);gl.uniform1f(uS,sS);gl.uniform2f(uP,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)})(0);
})();
