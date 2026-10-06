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
export function createPyramidScene(host,onSlot){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#eef1e9');host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,100);camera.position.set(7,7,9);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(.6,.8,0);controls.minZoom=.5;controls.maxZoom=4;
 scene.add(new THREE.HemisphereLight('#ffffff','#8b9687',2.2));const sun=new THREE.DirectionalLight('#fff8e7',2);sun.position.set(4,9,7);scene.add(sun);
 const root=new THREE.Group();scene.add(root);const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pickables=[],puzzle=null,current=null,down=null,disposed=false,frame;
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);const extent=(puzzle?.layers||2)*1.05+1;camera.left=-extent*w/h;camera.right=extent*w/h;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function clear(){for(const child of [...root.children]){root.remove(child);child.traverse(object=>{object.geometry?.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material]){material?.map?.dispose();material?.dispose();}});}pickables=[];}
 function update(data){
  current=data;if(puzzle!==data.puzzle){puzzle=data.puzzle;resize();}clear();const board=pyramid(puzzle.layers);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(puzzle.layers+1,puzzle.layers+1),new THREE.MeshBasicMaterial({color:'#dce4d8',side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=-.53;root.add(floor);
  board.slots.forEach(slot=>{
   if(data.layer!=='all'&&slot.level!==Number(data.layer))return;
   const pos=new THREE.Vector3(...slot.position);pos.y+=slot.level*data.explode;
   const hit=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({transparent:true,opacity:.055,color:'#4f705a',depthWrite:false}));hit.position.copy(pos);hit.userData.slot=slot.id;root.add(hit);pickables.push(hit);
   const edges=new THREE.LineSegments(new THREE.EdgesGeometry(hit.geometry),new THREE.LineBasicMaterial({color:data.conflicts.includes(slot.id)?'#c94a36':data.placements[slot.id]?.cube===data.selected?'#d5a344':'#9aaa9a'}));edges.position.copy(pos);root.add(edges);
   const placement=data.placements[slot.id];if(placement)addCube(placement.cube,placement.orientation,pos,slot.id);
  });
  if(!data.placements.some(p=>p?.cube===data.selected)){const pos=new THREE.Vector3(puzzle.layers*.75+1.2,.2,0);addCube(data.selected,data.orientations[data.selected],pos,null);}
 }
 function addCube(index,orientation,position,slot){
  const cube=puzzle.cubes[index],mesh=new THREE.Mesh(new THREE.BoxGeometry(.985,.985,.985),cube.faces.map(marks=>new THREE.MeshStandardMaterial({map:faceTexture(marks),roughness:1})));
  mesh.position.copy(position);mesh.quaternion.copy(quaternion(orientation));root.add(mesh);
  if(slot!==null){mesh.userData.slot=slot;pickables.push(mesh);}
  const outline=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:current.conflicts.includes(slot)?'#c94a36':index===current.selected?'#c4972a':'#334a3d'}));mesh.add(outline);
 }
 const pointerDown=e=>{down={x:e.clientX,y:e.clientY};};
 const pointerUp=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5){down=null;return;}down=null;const box=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(pickables,false)[0];if(hit)onSlot(hit.object.userData.slot);};
 renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
 function view(name){const f=frames.find(f=>f.name.toLowerCase()===name),target=new THREE.Vector3(.55,(puzzle?.layers||2)/2-.5,0);controls.target.copy(target);camera.up.set(0,1,0);if(f){camera.position.copy(target).add(new THREE.Vector3(...f.n).multiplyScalar(10));camera.up.set(...f.v);}else camera.position.copy(target).add(new THREE.Vector3(7,7,9));camera.zoom=1;camera.updateProjectionMatrix();controls.update();}
 function animate(){if(disposed)return;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(animate);}animate();
 return {update,view,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();clear();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.dispose();renderer.domElement.remove();}};
}
