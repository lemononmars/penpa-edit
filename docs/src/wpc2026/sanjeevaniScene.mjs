import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {rotations,frames,pyramid} from './sanjeevani.mjs';

function faceTexture(marks){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const c=canvas.getContext('2d');c.fillStyle='#fffdf8';c.fillRect(0,0,256,256);
 for(const mark of [...marks].sort((a,b)=>(a.kind==='shade'?-1:0)-(b.kind==='shade'?-1:0))){
  const x=128+mark.x*64,y=128-mark.y*64,extent=mark.size*64;
  c.save();c.translate(x,y);c.rotate(-(mark.turn||0)*Math.PI/2);if(mark.mirror)c.scale(-1,1);
  c.fillStyle=mark.kind==='shade'?'#b9bcb7':'#121915';c.strokeStyle='#121915';c.lineWidth=5;
  if(mark.kind==='shade')c.fillRect(-extent,-extent,2*extent,2*extent);
  else if(mark.kind==='dot'){c.beginPath();c.arc(0,0,extent,0,Math.PI*2);c.fillStyle=mark.value==='white'?'#fffdf8':'#121915';c.fill();c.stroke();}
  else if(mark.kind==='star'){for(let i=0;i<3;i++){const a=i*Math.PI/3,dx=Math.cos(a)*extent*.46,dy=Math.sin(a)*extent*.46;c.beginPath();c.moveTo(-dx,-dy);c.lineTo(dx,dy);c.stroke();}}
  else{c.font=`700 ${extent*1.18}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText(mark.value,0,extent*.04);}
  c.restore();
 }
 c.strokeStyle='#34483d';c.lineWidth=2;c.strokeRect(1,1,254,254);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function quaternion(orientation){const m=rotations[orientation],matrix=new THREE.Matrix4();matrix.set(...m[0],0,...m[1],0,...m[2],0,0,0,0,1);return new THREE.Quaternion().setFromRotationMatrix(matrix);}
export function createPyramidScene(host,onSlot,onCube,onRotate=()=>{},onAnchor=()=>{}){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#eef1e9');host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,100);camera.position.set(7,7,9);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(.6,.8,0);controls.minZoom=.5;controls.maxZoom=4;
 scene.add(new THREE.HemisphereLight('#ffffff','#8b9687',2.2));const sun=new THREE.DirectionalLight('#fff8e7',2);sun.position.set(4,9,7);scene.add(sun);
 const root=new THREE.Group();scene.add(root);const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pickables=[],puzzle=null,current=null,down=null,disposed=false,frame,bankPositions=[],bounds=null,hovered=null,selectedPosition=null,lastAnchor=null;
 const axisColors={x:'#e34e4e',y:'#329c59',z:'#397ddd'};
 function label(text,color,size=.25){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');c.fillStyle=color;c.font='bold 42px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,32,34);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(size,size,1);return sprite;}
 const axisScene=new THREE.Scene(),axisCamera=new THREE.OrthographicCamera(-1.5,1.5,1.5,-1.5,.1,10);const axes=new THREE.AxesHelper(1);axes.setColors(axisColors.x,axisColors.y,axisColors.z);axisScene.add(axes);
 for(const [axis,dir] of [['x',[1.2,0,0]],['y',[0,1.2,0]],['z',[0,0,1.2]]]){const sprite=label(axis.toUpperCase(),axisColors[axis],.4);sprite.position.set(...dir);axisScene.add(sprite);}
 function fit(){
  if(!bounds)return;const center=bounds.getCenter(new THREE.Vector3()),direction=camera.position.clone().sub(controls.target).normalize();controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,15);camera.lookAt(center);camera.updateMatrixWorld();
  let horizontal=0,vertical=0;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const p=new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse);horizontal=Math.max(horizontal,Math.abs(p.x));vertical=Math.max(vertical,Math.abs(p.y));}
  const aspect=host.clientWidth/host.clientHeight,extent=Math.max(vertical,horizontal/aspect)*1.13;camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();controls.update();
 }
 const resize=()=>{renderer.setSize(host.clientWidth,host.clientHeight,false);fit();};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function clear(){hovered=null;selectedPosition=null;for(const child of [...root.children]){root.remove(child);child.traverse(object=>{object.geometry?.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material]){material?.map?.dispose();material?.dispose();}});}pickables=[];}
 function update(data){
  const refit=current?.explode!==data.explode;current=data;const isNew=puzzle!==data.puzzle;puzzle=data.puzzle;clear();const board=pyramid(puzzle.layers);
  const columns=puzzle.layers===2?3:4,rows=Math.ceil(puzzle.cubes.length/columns),start=puzzle.layers/2+1.35;
  bankPositions=puzzle.cubes.map((_,i)=>new THREE.Vector3(start+i%columns*1.55,0,(Math.floor(i/columns)-(rows-1)/2)*1.55));
  bounds=new THREE.Box3(new THREE.Vector3(-puzzle.layers/2,-.6,-Math.max(puzzle.layers/2,rows*.775)),new THREE.Vector3(start+(columns-1)*1.55+.65,puzzle.layers+.7+(puzzle.layers-1)*data.explode,Math.max(puzzle.layers/2,rows*.775)));
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(puzzle.layers+1,puzzle.layers+1),new THREE.MeshBasicMaterial({color:'#dce4d8',side:THREE.DoubleSide,transparent:true,opacity:.08,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.53;root.add(floor);
  board.slots.forEach(slot=>{
   if(data.layer!=='all'&&slot.level!==Number(data.layer))return;
   const pos=new THREE.Vector3(...slot.position);pos.y+=slot.level*data.explode;
   const hit=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({transparent:true,opacity:.055,color:'#4f705a',depthWrite:false}));hit.position.copy(pos);hit.userData.slot=slot.id;root.add(hit);pickables.push(hit);
   const edges=new THREE.LineSegments(new THREE.EdgesGeometry(hit.geometry),new THREE.LineBasicMaterial({color:data.conflicts.includes(slot.id)?'#c94a36':data.placements[slot.id]?.cube===data.selected?'#d5a344':'#9aaa9a'}));edges.position.copy(pos);root.add(edges);
   hit.userData.outline=edges;hit.userData.baseColor=edges.material.color.getHex();
   const placement=data.placements[slot.id];if(placement)addCube(placement.cube,placement.orientation,pos,slot.id);
  });
  const placed=new Set(data.placements.filter(Boolean).map(p=>p.cube));
  const bankFloor=new THREE.Mesh(new THREE.PlaneGeometry(columns*1.55,rows*1.55),new THREE.MeshBasicMaterial({color:'#e2e7dd',side:THREE.DoubleSide,transparent:true,opacity:.08,depthWrite:false}));bankFloor.rotation.x=-Math.PI/2;bankFloor.position.set(start+(columns-1)*.775,-.53,0);root.add(bankFloor);
  for(let i=0;i<puzzle.cubes.length;i++)if(!placed.has(i)){
   addCube(i,data.orientations[i],bankPositions[i],null);
   const labelCanvas=document.createElement('canvas');labelCanvas.width=labelCanvas.height=128;const c=labelCanvas.getContext('2d');c.fillStyle=i===data.selected?'#fff0be':'#fffdf8';c.beginPath();c.arc(64,64,44,0,Math.PI*2);c.fill();c.strokeStyle='#34483d';c.lineWidth=3;c.stroke();c.fillStyle='#20382e';c.font='700 54px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(puzzle.cubes[i].id),64,66);
   const label=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(labelCanvas),depthTest:false}));label.scale.set(.42,.42,1);label.position.copy(bankPositions[i]).add(new THREE.Vector3(0,.84,0));label.userData.cube=i;root.add(label);pickables.push(label);
  }
  renderer.domElement.dataset.cubeCount=String(puzzle.cubes.length);renderer.domElement.dataset.bankCount=String(puzzle.cubes.length-placed.size);
  if(selectedPosition){for(const axis of ['x','y','z']){
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.79,.025,8,64),new THREE.MeshBasicMaterial({color:axisColors[axis],depthTest:false,transparent:true,opacity:.14}));ring.position.copy(selectedPosition);if(axis==='x')ring.rotation.y=Math.PI/2;if(axis==='y')ring.rotation.x=Math.PI/2;ring.renderOrder=10;root.add(ring);
   const hit=new THREE.Mesh(new THREE.TorusGeometry(.79,.07,8,64),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.copy(ring.position);hit.rotation.copy(ring.rotation);hit.userData.axis=axis;hit.userData.outline=ring;hit.userData.baseColor=ring.material.color.getHex();root.add(hit);pickables.push(hit);
  }}
  if(isNew)camera.zoom=1;if(isNew||refit)fit();
 }
 function addCube(index,orientation,position,slot){
  const cube=puzzle.cubes[index],mesh=new THREE.Mesh(new THREE.BoxGeometry(.985,.985,.985),cube.faces.map(marks=>new THREE.MeshStandardMaterial({map:faceTexture(marks),roughness:1})));
  mesh.position.copy(position);mesh.quaternion.copy(quaternion(orientation));root.add(mesh);
  if(slot!==null)mesh.userData.slot=slot;else mesh.userData.cube=index;pickables.push(mesh);
  const outline=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:current.conflicts.includes(slot)?'#c94a36':index===current.selected?'#c4972a':'#334a3d'}));mesh.add(outline);
  mesh.userData.outline=outline;mesh.userData.baseColor=outline.material.color.getHex();mesh.userData.cubeIndex=index;if(index===current.selected)selectedPosition=position.clone();
 }
 function hitAt(e){const box=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1);raycaster.setFromCamera(pointer,camera);root.updateMatrixWorld(true);const hits=raycaster.intersectObjects(pickables,false),hit=hits.find(h=>h.object.userData.axis)?.object||hits[0]?.object;if(hit?.userData.slot!==undefined&&hit.userData.cubeIndex===undefined){const placement=current?.placements[hit.userData.slot];if(placement)return pickables.find(p=>p.userData.cubeIndex===placement.cube)||hit;}return hit;}
 function hover(object){if(object?.isSprite&&object.userData.cube!==undefined)object=pickables.find(p=>p.userData.cubeIndex===object.userData.cube);if(hovered===object)return;if(hovered?.userData.outline){hovered.userData.outline.material.color.setHex(hovered.userData.baseColor);if(hovered.userData.slot!==undefined&&!Array.isArray(hovered.material))hovered.material.opacity=.055;}hovered=object;if(object?.userData.outline){object.userData.outline.material.color.set('#f2b632');if(object.userData.slot!==undefined&&!Array.isArray(object.material))object.material.opacity=.18;}renderer.domElement.style.cursor=object?'pointer':'grab';renderer.domElement.dataset.hover=object?.userData.axis?'axis':object?.userData.cubeIndex!==undefined?'cube':object?.userData.slot!==undefined?'slot':'';}
 const pointerMove=e=>{if(!down)hover(hitAt(e));};const pointerLeave=()=>hover(null);
 const pointerDown=e=>{down={x:e.clientX,y:e.clientY};};
 const pointerUp=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5){down=null;return;}down=null;const hit=hitAt(e);if(hit){const {slot,cube,axis}=hit.userData;if(axis)onRotate(axis,e.shiftKey);else if(cube!==undefined)onCube(cube);else onSlot(slot);}};
 renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
 renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerleave',pointerLeave);
 function view(name){const f=frames.find(f=>f.name.toLowerCase()===name),target=controls.target.clone();camera.up.set(0,1,0);if(f){camera.position.copy(target).add(new THREE.Vector3(...f.n).multiplyScalar(15));camera.up.set(...f.v);}else camera.position.copy(target).add(new THREE.Vector3(7,7,9));camera.zoom=1;fit();}
 function animate(){if(disposed)return;controls.update();renderer.setViewport(0,0,host.clientWidth,host.clientHeight);renderer.render(scene,camera);axisCamera.position.copy(camera.position).sub(controls.target).normalize().multiplyScalar(4);axisCamera.up.copy(camera.up);axisCamera.lookAt(0,0,0);renderer.autoClear=false;renderer.clearDepth();renderer.setViewport(8,8,130,130);renderer.render(axisScene,axisCamera);renderer.autoClear=true;
  if(selectedPosition){const point=selectedPosition.clone().add(new THREE.Vector3(0,1,0)).project(camera),anchor={x:Math.max(120,Math.min(host.clientWidth-120,(point.x+1)/2*host.clientWidth)),y:Math.max(68,Math.min(host.clientHeight-10,(1-point.y)/2*host.clientHeight))};if(!lastAnchor||Math.hypot(anchor.x-lastAnchor.x,anchor.y-lastAnchor.y)>1){lastAnchor=anchor;onAnchor(anchor);}}
  frame=requestAnimationFrame(animate); }animate();
 return {update,view,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();clear();axisScene.traverse(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();});renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerleave',pointerLeave);renderer.dispose();renderer.domElement.remove();}};
}
