/* Варианты фона: ?bg=aurora | ?bg=ink | ?bg=plain. Один WebGL-холст, реагирует на скролл и палец/мышь */
(function(){
  var m=(location.search.match(/bg=(\w+)/)||[])[1]||'aurora'; var cv=document.getElementById('glass');
  if(!cv||m==='drops')return;
  document.body.classList.add('bg-'+m);
  var st=document.createElement('style');st.textContent='body::before{background:#021a26!important}'; document.head.appendChild(st);
  if(m==='plain'){cv.style.display='none';return;}

  /* звёзды: отдельный 2D-холст в полном разрешении экрана (до 3x), мерцают, чуть сдвигаются от скролла */
  (function(){
    if(m==='plain'||m==='ink')return;
    var sc=document.createElement('canvas');sc.id='stars';sc.setAttribute('aria-hidden','true');
    sc.style.cssText='position:fixed;top:0;left:0;width:100%;height:100vh;height:max(100vh,100lvh);z-index:-1;pointer-events:none';
    cv.parentNode.insertBefore(sc,cv.nextSibling);
    var x=sc.getContext('2d'),dpr=Math.min(devicePixelRatio||1,3),W=0,H=0,S=[];
    var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
    function build(){W=Math.round(innerWidth*dpr);H=Math.round(Math.max(innerHeight,screen.height?0:0,innerHeight)*dpr);sc.width=W;sc.height=H;S=[];
      var N=Math.round(innerWidth*innerHeight/1200);
      for(var i=0;i<N;i++){var r=rnd(),big=r>.97,mid=r>.86;
        S.push({x:rnd(),y:Math.pow(rnd(),1.25)*.85,s:big?1.9+rnd()*.8:mid?1.1+rnd()*.5:.6+rnd()*.4,a:big?1:mid?.85:.5+rnd()*.3,
          f:.4+rnd()*1.8,p:rnd()*6.28,c:rnd()>.82?[190,215,255]:rnd()>.9?[255,225,190]:[255,255,255],z:.2+rnd()*.8});}}
    build();addEventListener('resize',build);
    var sy=scrollY,vis=true;document.addEventListener('visibilitychange',function(){vis=!document.hidden});
    var last=0;(function fr(ts){requestAnimationFrame(fr);if(!vis||ts-last<40)return;last=ts;
      sy+=(scrollY-sy)*.08;x.clearRect(0,0,W,H);var t=ts/1000;
      for(var i=0;i<S.length;i++){var o=S[i];var yy=((o.y*H-sy*dpr*.05*o.z)%H+H)%H;var px=o.x*W,tw=.65+.35*Math.sin(t*o.f+o.p);
        var al=o.a*tw*Math.min(1,(1-yy/H)*1.6),r=o.s*dpr*.9;if(al<.02)continue;
        x.fillStyle='rgba('+o.c[0]+','+o.c[1]+','+o.c[2]+','+al+')';x.beginPath();x.arc(px,yy,r,0,6.2832);x.fill();
        if(o.s>1.4){var g=x.createRadialGradient(px,yy,0,px,yy,r*5);g.addColorStop(0,'rgba('+o.c[0]+','+o.c[1]+','+o.c[2]+','+al*.35+')');g.addColorStop(1,'rgba('+o.c[0]+','+o.c[1]+','+o.c[2]+',0)');x.fillStyle=g;x.beginPath();x.arc(px,yy,r*5,0,6.2832);x.fill();}}
    })(0);
  })();
  var gl=cv.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'}); if(!gl)return;
  var head='precision mediump float;uniform vec2 uRes;uniform float uT;uniform float uS;uniform vec2 uP;varying vec2 vUv;'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
  'float fb(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}';
  var AUR=head+'float ray(vec2 p){return n(vec2(p.x*38.,p.y*1.5))*.6+n(vec2(p.x*95.,p.y*3.))*.4;}'+
 'float curtain(vec2 uv,float t,float seed,float base,float hgt){'+
 ' float w=fb(vec2(uv.x*1.3+seed,t*.6+seed))*.55+fb(vec2(uv.x*3.1-seed,t*1.1))*.12;'+
 ' float y0=base+w-.5*.55;float d=(uv.y-y0);'+
 ' float edge=smoothstep(-.015,.02,d);float fall=exp(-max(d,0.)/hgt);'+
 ' float r=ray(vec2(uv.x+w*.35,d*.8+seed));'+
 ' return edge*fall*(.4+.9*r)*(1.+2.2*exp(-max(d,0.)*22.))*smoothstep(0.,.9,fb(vec2(uv.x*.8+seed*3.,t*.4)+3.));}'+
 'void main(){float asp=uRes.x/uRes.y;vec2 uv=vec2(vUv.x*asp,vUv.y);float t=uT*.045;uv.y+=uS*.10;'+
 ' vec3 col=mix(vec3(.004,.012,.035),vec3(.012,.045,.08),smoothstep(.0,1.,vUv.y));'+
 ' vec2 sp=vUv*uRes/2.2;float st=0.*step(.994,h(floor(sp)));col+=vec3(.7,.8,1.)*st*(.3+.7*h(floor(sp)+7.))*smoothstep(.25,.7,vUv.y);'+
 ' float a1=curtain(uv,t,1.3,.52,.34);float a2=curtain(uv*vec2(1.1,1.),t*1.2,7.1,.64,.26);float a3=curtain(uv*vec2(.8,1.),t*.8,13.7,.42,.22);'+
 ' float hy=smoothstep(.2,1.,vUv.y);'+
 ' vec3 g=vec3(.10,1.,.45),c=vec3(.05,.85,.85),v=vec3(.62,.25,.95),pk=vec3(.95,.25,.55);'+
 ' vec3 c1=mix(g,c,smoothstep(.3,.8,vUv.y))*1.0;vec3 c2=mix(g,v,smoothstep(.45,.95,vUv.y));vec3 c3=mix(c,pk,smoothstep(.5,1.,vUv.y)*.6);'+
 ' col+=c1*a1*1.15+c2*a2*.85+c3*a3*.7;'+
 ' float d=length((vUv-uP)*vec2(asp,1.));col+=g*.05*exp(-d*3.);'+
 ' col*=.78+.22*smoothstep(1.3,.1,length((vUv-vec2(.62,.55))*vec2(1.,1.2)));'+
 ' col=1.-exp(-col*1.25);col+=(h(vUv*uRes+uT)-.5)*.012;gl_FragColor=vec4(col,1.);}';
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
  var mob=matchMedia('(max-width:900px)').matches,k=Math.min(devicePixelRatio||1,mob?1:1.5)*(mob?.75:.9);
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
