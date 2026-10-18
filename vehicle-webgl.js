/* Parkly: actual GPU raymarched 3D vehicle avatars, no CDN or third-party assets.
   Signed-distance surfaces have smooth bodywork, glass, headlights, wheels and lighting. */
(()=>{'use strict';
const VS=`attribute vec2 p;varying vec2 uv;void main(){uv=p;gl_Position=vec4(p,0.,1.);}`;
const FS=`precision highp float;varying vec2 uv;uniform vec2 res;uniform float yaw;uniform float shape;uniform vec3 paint;
float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float ell(vec3 p,vec3 r){float k0=length(p/r);float k1=length(p/(r*r));return k0*(k0-1.)/max(k1,.001);}
float smoothMin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
vec2 map(vec3 p){float L=mix(1.55,1.85,step(.7,shape));float W=mix(.75,.88,step(.6,shape));float height=mix(.45,.7,step(.5,shape));
float lower=ell(p-vec3(0.,.48,0.),vec3(W,.34,L));
float roof=ell(p-vec3(0.,.69+height*.26,-.12),vec3(W*.73,height*.65,L*.52));
float body=smoothMin(lower,roof,.18);
if(shape>1.5&&shape<2.5){ // two-wheel vehicle: slim body, upright rider-style silhouette
 float tank=ell(p-vec3(0.,.79,.04),vec3(.29,.24,.78));
 float frame=ell(p-vec3(0.,.57,-.16),vec3(.16,.13,.93));
 body=smoothMin(tank,frame,.12);
}
if(shape>2.5&&shape<3.5){ // jet fuselage, swept wings and stabilizer
 float fuselage=ell(p-vec3(0.,.69,0.),vec3(.31,.28,1.94));
 float wings=sdBox(p-vec3(0.,.66,-.05),vec3(1.48,.065,.41));
 float tail=sdBox(p-vec3(0.,.85,-1.18),vec3(.63,.24,.15));
 body=min(min(fuselage,wings),tail);
}
if(shape>3.5){ // helicopter fuselage and rotor
 float fuselage=ell(p-vec3(0.,.76,.18),vec3(.55,.48,.95));
 float tail=ell(p-vec3(0.,.78,-1.1),vec3(.14,.12,1.1));
 float rotor=sdBox(p-vec3(0.,1.33,.1),vec3(1.85,.035,.09));
 body=min(min(fuselage,tail),rotor);
}
float glass=ell(p-vec3(0.,.72+height*.28,-.14),vec3(W*.67,height*.48,L*.46));if(shape>1.5)glass=100.;
float wheels=100.;for(int i=0;i<4;i++){float x=(i/2==0?-1.:1.)*W*.98;float z=(mod(float(i),2.)<.5?-1.:1.)*L*.69;if(shape>1.5){x=0.;z=(mod(float(i),2.)<.5?-1.:1.)*1.02;}vec3 q=p-vec3(x,.30,z);float w=max(length(q.yz)-.34,abs(q.x)-.125);wheels=min(wheels,w);}
float rims=100.;for(int i=0;i<4;i++){float x=(i/2==0?-1.:1.)*W*1.105;float z=(mod(float(i),2.)<.5?-1.:1.)*L*.69;if(shape>1.5){x=.14;z=(mod(float(i),2.)<.5?-1.:1.)*1.02;}vec3 q=p-vec3(x,.30,z);rims=min(rims,max(length(q.yz)-.18,abs(q.x)-.018));}
float lights=max(abs(p.x)-W*.76,abs(p.z-L*.93)-.045);lights=max(lights,abs(p.y-.57)-.055);
float tail=max(abs(p.x)-W*.76,abs(p.z+L*.93)-.04);tail=max(tail,abs(p.y-.57)-.055);
if(shape>2.5){wheels=100.;rims=100.;}float d=body;float mat=1.;if(glass<d+.016 && p.y>.82){d=min(d,glass);mat=2.;}if(wheels<d){d=wheels;mat=3.;}if(rims<d){d=rims;mat=4.;}if(lights<d && p.z>0.){d=lights;mat=5.;}if(tail<d && p.z<0.){d=tail;mat=6.;}return vec2(d,mat);}
vec3 norm(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
void main(){vec2 q=uv; q.x*=res.x/res.y;float a=yaw;vec3 eye=vec3(4.1*sin(a),2.45,4.1*cos(a));vec3 target=vec3(0.,.62,0.);vec3 f=normalize(target-eye);vec3 r=normalize(cross(f,vec3(0.,1.,0.)));vec3 up=cross(r,f);vec3 rd=normalize(f*2.7+q.x*r+q.y*up);float t=0.;vec2 hit=vec2(0.);vec3 pos=eye;
for(int i=0;i<86;i++){pos=eye+rd*t;hit=map(pos);if(hit.x<.002||t>12.)break;t+=max(hit.x*.78,.006);}
vec3 col=vec3(0.);float alpha=0.;
if(t<12.&&hit.x<.01){vec3 n=norm(pos);vec3 light=normalize(vec3(-.65,1.4,1.0));float diff=max(dot(n,light),0.);float spec=pow(max(dot(reflect(-light,n),-rd),0.),36.);float rim=pow(1.-max(dot(n,-rd),0.),3.);float ambient=.29+.24*max(n.y,0.);
vec3 base=paint;if(hit.y>1.5&&hit.y<2.5)base=vec3(.055,.17,.27);if(hit.y>2.5&&hit.y<3.5)base=vec3(.035,.04,.055);if(hit.y>3.5&&hit.y<4.5)base=vec3(.65,.75,.84);if(hit.y>4.5&&hit.y<5.5)base=vec3(.56,.95,1.);if(hit.y>5.5)base=vec3(1.,.14,.13);
col=base*(ambient+diff*.72)+vec3(.86,.91,1.)*spec*.9+vec3(.26,.55,.95)*rim*.27;
if(hit.y>4.5)col+=base*.45;alpha=1.;
}
/* contact shadow on transparent background */
float ground=max(0.,1.-length(vec2(q.x*.65,(q.y+.53)*1.3)))*.13;
alpha=max(alpha,ground);col=mix(vec3(.07,.06,.15),col,step(.01,alpha-ground));gl_FragColor=vec4(col,alpha);
}`;
const palette={sedan:[.25,.45,.85],suv:[.44,.58,.66],batmobile:[.055,.065,.095],rocket:[.95,.18,.09],sports:[.86,.05,.13],supercar:[.25,.45,.95],truck:[.75,.47,.23],pickup:[.42,.55,.68],motorbike:[.83,.15,.18],bicycle:[.1,.7,.5],atv:[.81,.51,.12],rc:[.35,.8,.4],fighter:[.45,.55,.66],helicopter:[.35,.6,.6],van:[.65,.75,.85],bus:[.45,.55,.86],scooter:[.9,.48,.15],kart:[.85,.17,.14],classic:[.18,.48,.85],electric:[.14,.75,.64],police:[.2,.3,.55],ambulance:[.86,.89,.93],firetruck:[.9,.12,.1]};

// Single shared WebGL renderer; each avatar is painted into a real canvas.
// No 2D pictures are shown when WebGL works. Canvases are individually rotatable.
const params={
sedan:[.25,.45,.85],suv:[.44,.58,.66],batmobile:[.055,.065,.095],rocket:[.95,.18,.09],
sports:[.86,.05,.13],supercar:[.25,.45,.95],truck:[.75,.47,.23],pickup:[.42,.55,.68],
motorbike:[.83,.15,.18],bicycle:[.1,.7,.5],atv:[.81,.51,.12],rc:[.35,.8,.4],
fighter:[.45,.55,.66],helicopter:[.35,.6,.6],van:[.65,.75,.85],bus:[.45,.55,.86],
scooter:[.9,.48,.15],kart:[.85,.17,.14],classic:[.18,.48,.85],electric:[.14,.75,.64],
taxi:[.96,.67,.08],police:[.2,.3,.55],ambulance:[.86,.89,.93],firetruck:[.9,.12,.1],convertible:[.25,.7,.86]
};
let gl,program,renderCanvas,loc={},objects=new Map(),queue=false,raf=0,paused=false;
function compile(kind,source){const sh=gl.createShader(kind);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh}
function init(){
 renderCanvas=document.createElement('canvas');renderCanvas.width=400;renderCanvas.height=300;
 gl=renderCanvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
 if(!gl)return false;
 program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,VS));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FS));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const a=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 for(const key of ['res','yaw','shape','paint'])loc[key]=gl.getUniformLocation(program,key);
 return true;
}
function shape(type){
 if(['motorbike','bicycle','scooter','atv'].includes(type))return 2;
 if(type==='fighter')return 3;
 if(type==='helicopter')return 4;
 if(['suv','truck','pickup','van','bus','ambulance','firetruck','police'].includes(type))return 1;
 return 0;
}
function render(el,state){
 const out=el.querySelector('canvas.vehicle-3d-output');if(!out||!gl)return;
 const type=el.dataset['3dStyle']||'suv';
 gl.viewport(0,0,renderCanvas.width,renderCanvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 gl.uniform2f(loc.res,renderCanvas.width,renderCanvas.height);
 gl.uniform1f(loc.yaw,state.yaw);gl.uniform1f(loc.shape,shape(type));
 gl.uniform3fv(loc.paint,params[type]||params.suv);gl.drawArrays(gl.TRIANGLES,0,6);
 const ctx=out.getContext('2d');if(!ctx)return;
 ctx.clearRect(0,0,out.width,out.height);ctx.drawImage(renderCanvas,0,0,out.width,out.height);
 el.classList.add('vehicle-3d-ready');state.dirty=false;
}
function discover(){
 document.querySelectorAll('.vehicle-true3d').forEach(el=>{
  if(objects.has(el))return;
  const state={yaw:.7,dirty:true,dragging:false,start:0,last:0};
  objects.set(el,state);
  el.addEventListener('pointerdown',e=>{
   state.dragging=true;state.last=e.clientX;
   try{el.setPointerCapture(e.pointerId)}catch(_){}
  });
  el.addEventListener('pointermove',e=>{
   if(!state.dragging)return;
   state.yaw+=(e.clientX-state.last)*.015;state.last=e.clientX;state.dirty=true;
  });
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,()=>state.dragging=false);
  el.addEventListener('keydown',e=>{
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
    state.yaw+=e.key==='ArrowLeft'?-0.23:.23;state.dirty=true;e.preventDefault();
   }
  });
 });
 for(const el of objects.keys())if(!el.isConnected)objects.delete(el);
}
function animate(t){
 raf=requestAnimationFrame(animate);
 if(document.hidden)return;
 if(t-animate.last<110)return;animate.last=t;
 let n=0;
 const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches&&document.documentElement.dataset.motion!=='off';
 for(const [el,state] of objects){
  if(!el.isConnected||el.getClientRects().length===0)continue;
  const rect=el.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)continue;
  if(motion&&el.closest('.hero-art,.car-illustration,.hero-vehicle-preview')&&!state.dragging){state.yaw+=.018;state.dirty=true}
  if(state.dirty){render(el,state);if(++n>=7)break}
 }
}
animate.last=0;
try{
 if(!init())throw Error('WebGL unavailable');
 discover();
 const observer=new MutationObserver(()=>{if(queue)return;queue=true;requestAnimationFrame(()=>{queue=false;discover()})});
 observer.observe(document.body,{subtree:true,childList:true});
 raf=requestAnimationFrame(animate);
}catch(e){console.warn('3D rendering not supported; image fallback retained:',e)}
})();
