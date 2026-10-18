import * as THREE from 'three';
import './style.css';

const T=THREE,$=id=>document.getElementById(id),R=Math.random,V3=(x,y,z)=>new T.Vector3(x,y,z);
const scene=new T.Scene();scene.background=new T.Color(0x1b2036);scene.fog=new T.Fog(0x1b2036,40,230);
const cam=new T.PerspectiveCamera(75,innerWidth/innerHeight,.1,400);cam.rotation.order='YXZ';scene.add(cam);
const ren=new T.WebGLRenderer({antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.setSize(innerWidth,innerHeight);document.body.prepend(ren.domElement);
scene.add(new T.HemisphereLight(0x8fa8ff,0x222233,.95));
const sun=new T.DirectionalLight(0xffc48a,.8);sun.position.set(80,120,40);scene.add(sun);
const M=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.8},o));
const ground=new T.Mesh(new T.PlaneGeometry(600,600),M(0x15171f));ground.rotation.x=-Math.PI/2;scene.add(ground);
// window texture
const wc=document.createElement('canvas');wc.width=64;wc.height=128;const wx=wc.getContext('2d');wx.fillStyle='#fff';wx.fillRect(0,0,64,128);
for(let y=4;y<128;y+=10)for(let x=4;x<64;x+=10){wx.fillStyle=R()<.35?'#ffd27a':'#2a3042';wx.fillRect(x,y,6,6)}
const wt=new T.CanvasTexture(wc);
const bmats=[0x5a6078,0x6b5a63,0x4b5f6e,0x73706a,0x4f4f66].map(c=>M(c,{map:wt,emissive:0x332200,emissiveMap:wt,emissiveIntensity:.5}));
// city
const P=54,N=7,solids=[],bMeshes=[],padMat=M(0x3a3f4d);
for(let i=0;i<N;i++)for(let j=0;j<N;j++){const cx=(i-3)*P,cz=(j-3)*P;
 const pad=new T.Mesh(new T.BoxGeometry(40,.4,40),padMat);pad.position.set(cx,.2,cz);scene.add(pad);
 if(i==3&&j==3)continue;
 for(const a of[-1,1])for(const b of[-1,1]){if(R()<.12)continue;const w=13+R()*5,d=13+R()*5,h=10+R()*R()*70;
  const m=new T.Mesh(new T.BoxGeometry(w,h,d),bmats[(R()*5)|0]);m.position.set(cx+a*10,h/2,cz+b*10);scene.add(m);bMeshes.push(m);solids.push({x:m.position.x,z:m.position.z,hw:w/2,hd:d/2})}}
// road dashes
const dm=M(0xcfc27a);for(let k=-3;k<3;k++)for(let t=-190;t<190;t+=10){let a=new T.Mesh(new T.BoxGeometry(.4,.02,4),dm);a.position.set(k*P+27,.03,t);scene.add(a);a=new T.Mesh(new T.BoxGeometry(4,.02,.4),dm);a.position.set(t,.03,k*P+27);scene.add(a)}
function push(p,r){for(const s of solids){const dx=p.x-s.x,dz=p.z-s.z,ox=s.hw+r-Math.abs(dx),oz=s.hd+r-Math.abs(dz);if(ox>0&&oz>0){if(ox<oz)p.x+=Math.sign(dx||1)*ox;else p.z+=Math.sign(dz||1)*oz;return true}}
 p.x=Math.max(-185,Math.min(185,p.x));p.z=Math.max(-185,Math.min(185,p.z));return false}
const free=(x,z)=>!solids.some(s=>Math.abs(x-s.x)<s.hw+2&&Math.abs(z-s.z)<s.hd+2);
// state
const G={yaw:0,pitch:0,hp:100,ar:65,mag:30,res:120,gr:3,cash:250,wanted:0,car:null,dead:true,run:false,reload:0,cd:0,kills:0,mi:0,mis:null,mt:0,fire:false,t:0};
const pos=V3(0,1.7,0),keys={};
// gun
const gun=new T.Group();gun.add(new T.Mesh(new T.BoxGeometry(.08,.1,.55),M(0x222))),gun.add(Object.assign(new T.Mesh(new T.BoxGeometry(.05,.05,.3),M(0x111)),{position:V3(0,.02,-.4)}));
gun.position.set(.25,-.25,-.5);cam.add(gun);const fl=new T.PointLight(0xffaa44,0,14);fl.position.set(.25,-.15,-1);cam.add(fl);
// audio
let ac;function sfx(d,f,v){try{ac=ac||new AudioContext();const n=ac.sampleRate*d,b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(R()*2-1)*(1-i/n)**2;const s=ac.createBufferSource(),q=ac.createBiquadFilter(),g=ac.createGain();q.frequency.value=f;g.gain.value=v;s.buffer=b;s.connect(q);q.connect(g);g.connect(ac.destination);s.start()}catch(e){}}
// effects
const fx=[];function tracer(a,b,c){const l=new T.Line(new T.BufferGeometry().setFromPoints([a,b]),new T.LineBasicMaterial({color:c}));scene.add(l);fx.push({o:l,t:.06})}
function boom(p){const m=new T.Mesh(new T.SphereGeometry(1,14,10),new T.MeshBasicMaterial({color:0xff8a2b,transparent:true,opacity:.9}));m.position.copy(p);scene.add(m);fx.push({o:m,t:.45,grow:1});sfx(.7,500,.9)
 const d=p.distanceTo(pos);if(d<14&&!G.dead)hurt(60*(1-d/14));
 for(const e of enemies)if(!e.dead){const k=e.g.position.distanceTo(p);if(k<13)dmgE(e,130*(1-k/13),0)}}
// enemies
const enemies=[],hitM=[],eMat=M(0x7a1f2b),lMat=M(0x1d1f2a),skin=M(0xd9a37a);
function mkE(x,z){const g=new T.Group(),b=new T.Mesh(new T.BoxGeometry(.8,1.3,.5),eMat),h=new T.Mesh(new T.SphereGeometry(.22,10,8),skin),l=new T.Mesh(new T.BoxGeometry(.7,.8,.35),lMat),w=new T.Mesh(new T.BoxGeometry(.1,.1,.6),lMat);
 b.position.y=1.05;h.position.y=1.9;l.position.y=.4;w.position.set(.35,1.2,.4);g.add(b,h,l,w);g.position.set(x,0,z);scene.add(g);
 const e={g,hp:60,cd:1+R(),dead:false,wd:R()*6,t:0};b.userData.e=h.userData.e=e;h.userData.head=1;e.m=[b,h];hitM.push(b,h);enemies.push(e)}
function spawnE(n,minD){for(let k=0;k<n;k++){for(let t=0;t<40;t++){const x=(R()-.5)*360,z=(R()-.5)*360;if(free(x,z)&&Math.hypot(x-pos.x,z-pos.z)>minD){mkE(x,z);break}}}}
function dmgE(e,d,head){if(e.dead)return;e.hp-=d;e.alert=1;if(e.hp<=0){e.dead=true;e.t=4;e.g.rotation.x=-Math.PI/2;e.g.position.y=.3;e.m.forEach(m=>hitM.splice(hitM.indexOf(m),1));
 G.kills++;G.cash+=40+(R()*60|0);G.res+=10;if(R()<.15)G.gr++;G.hp=Math.min(100,G.hp+8);G.wanted=Math.min(5,G.wanted+.5)}}
// cars
const cars=[],cc=[0xd62839,0x2a9d8f,0xf4a261,0x4361ee,0xeee];
function mkCar(x,z,c,yaw){const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(2,.7,4.2),M(c,{metalness:.4,roughness:.4}));b.position.y=.7;const t=new T.Mesh(new T.BoxGeometry(1.7,.6,2),M(0x111826));t.position.set(0,1.25,.2);g.add(b,t);
 for(const[sx,sz]of[[1,1.4],[-1,1.4],[1,-1.4],[-1,-1.4]]){const w=new T.Mesh(new T.CylinderGeometry(.4,.4,.3,10),M(0x080808));w.rotation.z=Math.PI/2;w.position.set(sx,.4,sz);g.add(w)}
 g.position.set(x,0,z);g.rotation.y=yaw;scene.add(g);cars.push({g,sp:0,yaw})}
[[27,6],[-27,-54],[81,27],[-81,-27],[27,-108],[-135,27]].forEach((p,i)=>mkCar(p[0],p[1],cc[i%5],i%2?0:Math.PI/2));
// missions
const beacon=new T.Mesh(new T.CylinderGeometry(3,3,80,16,1,true),new T.MeshBasicMaterial({color:0xffc83d,transparent:true,opacity:.35,side:2}));beacon.visible=false;scene.add(beacon);
function startMission(){const n=G.mi,drive=n%2==1;const base=Math.floor(n/2);
 if(drive){let x,z;do{x=((R()*6|0)-3)*P+27;z=((R()*6|0)-3)*P+27}while(Math.hypot(x-pos.x,z-pos.z)<140);beacon.position.set(x,40,z);beacon.visible=true;G.mis={drive:1,x,z,reward:700+base*200,txt:'STEAL A RIDE. REACH THE BEACON'};}
 else{beacon.visible=false;const t=8+base*3;G.mis={kills:t,start:G.kills,reward:500+base*300,txt:'CLEAR THE BLOCK'};spawnE(Math.max(0,t-enemies.filter(e=>!e.dead).length),40)}}
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,2200)}
function hurt(d){if(G.dead)return;if(G.ar>0){const a=Math.min(G.ar,d*.6);G.ar-=a;d-=a}G.hp-=d;$('dmg').style.opacity=1;setTimeout(()=>$('dmg').style.opacity=0,120);sfx(.15,300,.5);
 if(G.hp<=0){G.dead=true;G.run=false;if(G.car)exitCar();document.exitPointerLock&&document.exitPointerLock();$('ovt').textContent='WASTED. Respawn costs $100 and your wanted level clears.';$('go').textContent='Respawn';$('ov').style.display='flex'}}
// vehicles
function exitCar(){const c=G.car;G.yaw=c.yaw;pos.set(c.g.position.x+Math.cos(c.yaw)*3,1.7,c.g.position.z-Math.sin(c.yaw)*3);c.sp=0;G.car=null;gun.visible=true;cam.fov=75;cam.updateProjectionMatrix()}
function interact(){if(G.dead)return;if(G.car){exitCar();return}let b=null,bd=5;for(const c of cars){const d=c.g.position.distanceTo(pos);if(d<bd){bd=d;b=c}}if(b){G.car=b;gun.visible=false;toast('CAR ACQUIRED');G.wanted=Math.min(5,G.wanted+.5)}}
// shooting
const ray=new T.Raycaster();ray.far=160;
function shoot(){if(G.reload>0||G.cd>0||G.car||G.dead)return;if(G.mag<=0){reload();return}
 G.mag--;G.cd=.09;sfx(.09,2200,.45);fl.intensity=2.5;setTimeout(()=>fl.intensity=0,45);G.pitch+=.006;gun.position.z=-.42;
 ray.setFromCamera({x:(R()-.5)*.012,y:(R()-.5)*.012},cam);const hs=ray.intersectObjects(hitM.concat(bMeshes));const o=cam.localToWorld(V3(.25,-.15,-1));
 if(hs.length){const h=hs[0],e=h.object.userData.e;tracer(o,h.point,0xffe08a);if(e){dmgE(e,h.object.userData.head?60:22,h.object.userData.head);const hm=$('hm');hm.style.opacity=1;setTimeout(()=>hm.style.opacity=0,110);G.wanted=Math.min(5,G.wanted+.1)}}
 else tracer(o,ray.ray.at(120,V3(0,0,0)),0xffe08a)}
function reload(){if(G.reload>0||G.mag==30||G.res<=0)return;G.reload=1.4}
const gren=[];function throwG(){if(G.gr<=0||G.car||G.dead)return;G.gr--;const m=new T.Mesh(new T.SphereGeometry(.14,8,6),M(0x2d4a2d));const d=V3(0,0,-1).applyEuler(cam.rotation);m.position.copy(cam.position).addScaledVector(d,.8);scene.add(m);gren.push({m,v:d.multiplyScalar(18).add(V3(0,5,0)),t:1.7})}
// input
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code=='KeyR')reload();if(e.code=='KeyE')interact();if(e.code=='KeyG')throwG()});addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('mousedown',e=>{if(G.run)G.fire=1});addEventListener('mouseup',()=>G.fire=0);
addEventListener('mousemove',e=>{if(!G.run||G.car)return;G.yaw-=e.movementX*.0022;G.pitch=Math.max(-1.4,Math.min(1.4,G.pitch-e.movementY*.0022))});
ren.domElement.addEventListener('click',()=>{if(G.run&&ren.domElement.requestPointerLock)ren.domElement.requestPointerLock()});
$('go').onclick=()=>{if(G.dead){G.hp=100;G.ar=Math.max(G.ar,40);G.dead=false;if(G.kills||G.mis)G.cash=Math.max(0,G.cash-100);G.wanted=0;pos.set(0,1.7,0);G.mag=30;G.res=Math.max(G.res,90)}
 G.run=true;$('ov').style.display='none';if(!G.mis)startMission();ren.domElement.requestPointerLock&&ren.domElement.requestPointerLock()};
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();ren.setSize(innerWidth,innerHeight)});
// minimap
const mc=$('mm').getContext('2d');
function minimap(){mc.clearRect(0,0,150,150);mc.save();mc.beginPath();mc.arc(75,75,75,0,7);mc.clip();const S=.45,py=G.car?G.car.yaw:G.yaw,cp=G.car?G.car.g.position:pos;mc.translate(75,75);mc.rotate(py);
 const pt=(x,z,c,r)=>{mc.fillStyle=c;mc.beginPath();mc.arc((x-cp.x)*S,(z-cp.z)*S,r,0,7);mc.fill()};
 mc.fillStyle='#2a2f40';for(const s of solids)mc.fillRect((s.x-s.hw-cp.x)*S,(s.z-s.hd-cp.z)*S,s.hw*2*S,s.hd*2*S);
 enemies.forEach(e=>{if(!e.dead)pt(e.g.position.x,e.g.position.z,'#ff4d4d',2.5)});cars.forEach(c=>pt(c.g.position.x,c.g.position.z,'#37e3d0',3));
 if(G.mis&&G.mis.drive)pt(G.mis.x,G.mis.z,'#ffc83d',5);mc.restore();mc.fillStyle='#fff';mc.beginPath();mc.moveTo(75,66);mc.lineTo(80,80);mc.lineTo(70,80);mc.fill()}
// loop
const clock=new T.Clock(),fwd=V3(0,0,0);
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);G.t+=dt;
 if(G.run){G.cd-=dt;gun.position.z+=(-.5-gun.position.z)*.3;
  if(G.reload>0){G.reload-=dt;if(G.reload<=0){const n=Math.min(30-G.mag,G.res);G.mag+=n;G.res-=n}}
  if(G.fire&&!G.car)shoot();
  if(keys.ArrowLeft)G.yaw+=dt*2;if(keys.ArrowRight)G.yaw-=dt*2;
  if(G.car){const c=G.car,t=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyA?1:0)-(keys.KeyD?1:0);
   c.sp+=t*(t*c.sp<0?40:22)*dt;if(!t)c.sp*=1-1.2*dt;c.sp=Math.max(-12,Math.min(36,c.sp));if(keys.Space)c.sp*=1-3*dt;
   c.yaw+=s*dt*1.9*Math.max(-1,Math.min(1,c.sp/6));const f=V3(-Math.sin(c.yaw),0,-Math.cos(c.yaw));c.g.position.addScaledVector(f,c.sp*dt);c.g.rotation.y=c.yaw;
   if(push(c.g.position,2.1)){if(Math.abs(c.sp)>14)hurt(Math.abs(c.sp)*.25);c.sp*=-.3}
   for(const e of enemies)if(!e.dead&&Math.abs(c.sp)>8&&e.g.position.distanceTo(c.g.position)<2.6)dmgE(e,200,0);
   const tp=c.g.position.clone().addScaledVector(f,-9);tp.y=4.5;cam.position.lerp(tp,.12);cam.lookAt(c.g.position.x,1.8,c.g.position.z);pos.copy(c.g.position);pos.y=1.7;cam.fov=75+Math.abs(c.sp);cam.updateProjectionMatrix()}
  else{const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0),v=(keys.ShiftLeft?9:6)*dt;
   pos.x+=(-Math.sin(G.yaw)*f+Math.cos(G.yaw)*s)*v;pos.z+=(-Math.cos(G.yaw)*f-Math.sin(G.yaw)*s)*v;push(pos,.5);
   cam.position.set(pos.x,1.7+(f||s?Math.sin(G.t*11)*.04:0),pos.z);cam.rotation.set(G.pitch,G.yaw,0)}
  // enemies AI
  for(const e of enemies){if(e.dead){e.t-=dt;if(e.t<=0&&e.g.parent){scene.remove(e.g)}continue}
   const p=e.g.position,dx=pos.x-p.x,dz=pos.z-p.z,d=Math.hypot(dx,dz);
   if(d<70||e.alert){e.g.rotation.y=Math.atan2(dx,dz);if(d>14){p.x+=dx/d*3.2*dt;p.z+=dz/d*3.2*dt}else{p.x+=Math.cos(G.t+e.wd)*dt*2}
    e.cd-=dt;if(e.cd<=0&&d<55&&!G.dead){e.cd=.9+R()*.9;const o=V3(p.x,1.3,p.z),tg=V3(pos.x,1.2,pos.z);ray.set(o,tg.clone().sub(o).normalize());ray.far=d;
     if(!ray.intersectObjects(bMeshes).length){tracer(o,tg,0xff6a3a);sfx(.08,1500,.2);if(R()<Math.max(.1,.55-d/90))hurt(5)}ray.far=160}}
   else{e.wd+=dt*.3;p.x+=Math.cos(e.wd)*dt*1.2;p.z+=Math.sin(e.wd)*dt*1.2}
   push(p,.5)}
  // reinforcements
  if(G.wanted>=2&&G.t%Math.max(5,16-G.wanted*2)<dt&&enemies.filter(e=>!e.dead).length<16)spawnE(2,55);
  G.wanted=Math.max(0,G.wanted-dt*.015);
  // grenades
  for(let i=gren.length-1;i>=0;i--){const g=gren[i];g.v.y-=16*dt;g.m.position.addScaledVector(g.v,dt);if(g.m.position.y<.2){g.m.position.y=.2;g.v.y*=-.4;g.v.x*=.7;g.v.z*=.7}
   const q={x:g.m.position.x,z:g.m.position.z};if(push(q,.2)){g.m.position.x=q.x;g.m.position.z=q.z;g.v.x*=-.4;g.v.z*=-.4}
   g.t-=dt;if(g.t<=0){boom(g.m.position);scene.remove(g.m);gren.splice(i,1)}}
  // mission
  const m=G.mis;if(m&&!G.dead){let done=false,txt=m.txt;
   if(m.drive){const d=Math.hypot(pos.x-m.x,pos.z-m.z);txt+=' ('+(G.car?Math.round(d)+' m':'find a car, press E')+')';if(G.car&&d<9)done=true}
   else{const k=G.kills-m.start;txt+=' ('+Math.min(k,m.kills)+'/'+m.kills+')';if(k>=m.kills)done=true}
   $('mt').textContent=txt;
   if(done){G.cash+=m.reward;toast('CONTRACT COMPLETE +$'+m.reward);G.mis=null;G.mi++;beacon.visible=false;setTimeout(()=>{if(!G.dead)startMission()},3500)}}
  else if(!m)$('mt').textContent='STAND BY...';
 }
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t-=dt;if(f.grow){f.o.scale.addScalar(dt*30);f.o.material.opacity=Math.max(0,f.t*2)}if(f.t<=0){scene.remove(f.o);fx.splice(i,1)}}
 if(!G.run&&G.dead){cam.position.set(Math.sin(G.t*.1)*90,45,Math.cos(G.t*.1)*90);cam.lookAt(0,5,0)}
 // HUD
 $('hp').style.width=Math.max(0,G.hp)+'%';$('ar').style.width=G.ar+'%';$('am').textContent=G.reload>0?'RELOAD':G.mag+' / '+G.res;$('gr').textContent='ASSAULT RIFLE MK-4  |  FRAG x'+G.gr;
 $('hs').textContent=enemies.filter(e=>!e.dead).length;$('cash').textContent='$'+G.cash;$('stars').textContent='\u2605'.repeat(Math.round(G.wanted))+'\u2606'.repeat(5-Math.round(G.wanted));
 minimap();ren.render(scene,cam)}
loop();
