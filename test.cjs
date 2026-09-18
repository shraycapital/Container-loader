const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8').split('<script>')[1].split('</script>')[0];
const core=source.slice(0,source.indexOf('let current=null;'))+'\nglobalThis.engine={compile,candidates,pack,packFlexible,orientations,solve,modelGeometry,projectModel,windingCheck,inches,subtractSpace,floorOrigin};';
const ctx={};vm.createContext(ctx);vm.runInContext(core,ctx);const {compile,candidates,solve}=ctx.engine;
const s={cl:5900,cw:2352,ch:2395,payload:28130,dw:2340,dh:2292,wall:30,gap:30,base:50,packing:0,minW:400,maxW:2200,maxWFRatio:1.5,maxF:2200,step:25,t:40,axial:0,c:50,k:.7,m:20,reserve:5};
const barrel=compile('m*od',['m','od']),capacity=compile('k*W*((F-2*c)^2-B^2)/(1000*od^2)',['k','W','F','c','B','od']);
assert.equal(barrel({m:20,od:30}),600);
assert.equal(capacity({k:.7,W:1000,F:1200,c:50,B:600,od:30}),.7*1000*(1100**2-600**2)/(1000*900));
assert.equal(compile('-2^2+2^3^2',[] )({}),508);
assert.throws(()=>compile('alert(1)',[]));assert.throws(()=>compile('od; 5',['od']));assert.throws(()=>compile('2**3',[]));
const items=[{name:'Power',od:30,length:500,qty:4},{name:'Control',od:18,length:1000,qty:4},{name:'Instrument',od:12,length:1000,qty:2}];
const start=Date.now(),p=solve(items,s,barrel,capacity);assert.equal(p.missed,0);assert.equal(p.placed.length,10);
function verify(p,items,s){for(const d of p.placed){assert.ok(d.capacity+1e-8>=items[d.item].length*(1+s.reserve/100));assert.ok(d.B>=s.m*items[d.item].od);assert.ok(d.x>=s.wall);assert.ok(d.y>=s.wall);assert.ok(d.x+d.outer<=Math.min(s.cw,s.dw)-s.wall);assert.ok(d.y+d.F<=s.cl-s.wall);assert.ok(d.F+s.base<=Math.min(s.ch,s.dh));assert.ok(d.W>=items[d.item].od);}
for(let i=0;i<p.placed.length;i++)for(let j=i+1;j<p.placed.length;j++){let a=p.placed[i],b=p.placed[j];assert.ok(a.x+a.outer+s.gap<=b.x+1e-8||b.x+b.outer+s.gap<=a.x+1e-8||a.y+a.F+s.gap<=b.y+1e-8||b.y+b.F+s.gap<=a.y+1e-8,'drums overlap or violate gap');}}
verify(p,items,s);
assert.equal(candidates({name:'Impossible',od:200,length:500},s,barrel,capacity).length,0);
assert.ok(candidates(items[0],s,barrel,capacity).every(d=>d.W<=s.maxWFRatio*d.F+1e-9));
assert.ok(candidates(items[0],{...s,maxWFRatio:.5},barrel,capacity).every(d=>d.W<=.5*d.F+1e-9));
assert.equal(candidates({name:'Ratio impossible',od:12,length:5000},{...s,minW:1200,maxW:1200,maxF:1000,maxWFRatio:1},barrel,capacity).length,0);
assert.ok(solve([{name:'Many',od:30,length:500,qty:100}],s,barrel,capacity).missed>0);
assert.equal(candidates(items[0],{...s,dh:400},barrel,capacity).length,0);
assert.throws(()=>candidates(items[0],s,barrel,()=>Infinity));
for(let i=0;i<10;i++){let sample=[{name:'A',od:10+i*3,length:100+i*100,qty:1+i},{name:'B',od:20+i,length:350,qty:3}];verify(solve(sample,s,barrel,capacity),sample,s);}
console.log('PASS: formula parsing, sample fit, capacity, barrel rules, door clearance, boundaries, no overlaps, impossible sizes and overloaded geometry. '+(Date.now()-start)+' ms');
for(const stackMode of ['upright','flat']){
 const settings={...s,stackMode,maxLevels:3,spacer:75};
 const stacked=solve(items,settings,barrel,capacity);
 assert.equal(stacked.missed,0);
 assert.equal(stacked.placed.length,10);
 for(const c of stacked.columns){
  assert.ok(c.count<=3);assert.equal(c.stackHeight,s.base+c.count*c.height+(c.count-1)*75);
  assert.ok(c.stackHeight<=Math.min(s.ch,s.dh));
  assert.equal(c.breadth,stackMode==='flat'?c.F:c.outer);
  assert.equal(c.height,stackMode==='flat'?c.outer:c.F);
  const members=stacked.placed.filter(d=>d.column===c.column);
  assert.equal(members.length,c.count);
  members.forEach((d,i)=>{assert.equal(d.z,s.base+i*(c.height+75));assert.equal(d.item,c.item);});
 }
 for(let i=0;i<stacked.columns.length;i++)for(let j=i+1;j<stacked.columns.length;j++){
  const a=stacked.columns[i],b=stacked.columns[j];assert.ok(a.x+a.breadth+s.gap<=b.x||b.x+b.breadth+s.gap<=a.x||a.y+a.depth+s.gap<=b.y||b.y+b.depth+s.gap<=a.y);
 }
}
const fixed={...s,minW:400,maxW:400,maxF:800,stackMode:'upright',maxLevels:3,spacer:50,cl:900};
const small=[{name:'Stack test',od:12,length:100,qty:8}];
const one=solve(small,{...fixed,stackMode:'single'},barrel,capacity),many=solve(small,fixed,barrel,capacity);
assert.ok(one.missed>0);assert.equal(many.missed,0);
assert.ok(solve(small,{...fixed,spacer:2000},barrel,capacity).missed>0);
// Exercise persistent cable library saving, case-insensitive updates, reload and storage failure.
const nodes={librarySelect:{value:'',innerHTML:''},addSaved:{disabled:true},libraryStatus:{textContent:''}};
const storage=new Map();const libraryContext={document:{getElementById:id=>nodes[id]},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}};
vm.createContext(libraryContext);
const libraryCode=source.slice(0,source.indexOf('function addRow('));
vm.runInContext(libraryCode,libraryContext);
function row(v){return {querySelectorAll:()=>Object.entries(v).map(([k,value])=>({dataset:{key:k},value:String(value)}))};}
libraryContext.row=row({name:'Standard A',od:20,length:500,qty:9,kg:1.2,tare:100});
vm.runInContext('saveCable(row)',libraryContext);assert.equal(JSON.parse(storage.get('drumfit-cables-v1'))[0].od,20);assert.ok(!('qty' in JSON.parse(storage.get('drumfit-cables-v1'))[0]));
libraryContext.row=row({name:'standard a',od:22,length:700,kg:'',tare:''});vm.runInContext('saveCable(row)',libraryContext);assert.equal(JSON.parse(storage.get('drumfit-cables-v1')).length,1);
const reload={document:libraryContext.document,localStorage:libraryContext.localStorage};vm.createContext(reload);vm.runInContext(libraryCode+';refreshLibrary();',reload);assert.ok(nodes.librarySelect.innerHTML.includes('22 mm'));
libraryContext.localStorage.setItem=()=>{throw Error('full');};vm.runInContext('saveCable(row)',libraryContext);assert.ok(nodes.libraryStatus.textContent.includes('Could not save'));
const backupPlan={items:[{name:'Persisted cable',od:25,length:750,qty:3,barrel:500,kg:1.5,tare:90}],s:{...s,stackMode:'mixed',floorOrientation:'auto',capacityMode:'guarded',searchEffort:'thorough'},barrelFormula:'m * od',capacityFormula:'k * W * ((F - 2*c)^2 - B^2) / (1000 * od^2)',containerType:'20'};
libraryContext.backup={app:'DrumFit',version:1,savedAt:'2026-01-01T00:00:00.000Z',cableLibrary:[{name:'Library cable',od:18,length:1000,barrel:null,kg:null,tare:null}],plan:backupPlan};
const normalized=vm.runInContext('normalizeBackup(backup)',libraryContext);assert.equal(normalized.plan.items[0].qty,3);assert.equal(normalized.plan.s.maxWFRatio,1.5);assert.equal(normalized.cableLibrary[0].name,'Library cable');
const portable=vm.runInContext('makeBackup(backup.plan,backup.cableLibrary)',libraryContext);assert.equal(portable.app,'DrumFit');assert.equal(portable.version,1);assert.ok(portable.savedAt.includes('T'));
assert.throws(()=>vm.runInContext("normalizeBackup({app:'Other',version:1,cableLibrary:[],plan:{}})",libraryContext));
assert.throws(()=>vm.runInContext("normalizeBackup({...backup,plan:{...backup.plan,items:[{...backup.plan.items[0],qty:0}]}})",libraryContext));
console.log('PASS: both stack orientations, spacer height, door height, column separation, stacking benefit, cable library persistence/update and storage errors.');
const {packFlexible,orientations}=ctx.engine;
function verifyMixed(plan,settings,entries){
 const units=new Set();
 for(const c of plan.columns){
  assert.ok(c.x>=settings.wall&&c.y>=settings.wall);
  assert.ok(c.x>=ctx.engine.floorOrigin(settings));
  assert.ok(c.x+c.breadth<=ctx.engine.floorOrigin(settings)+Math.min(settings.cw,settings.dw)-2*settings.wall);
  assert.ok(c.y+c.depth<=settings.cl-settings.wall);
  assert.ok(c.stackHeight<=Math.min(settings.ch,settings.dh));
  assert.ok(c.count<=settings.maxLevels);
  assert.equal(c.stackHeight,settings.base+c.count*c.height+(c.count-1)*settings.spacer);
  assert.ok(orientations(c,settings).some(o=>o.direction===c.direction&&o.posture===c.posture&&o.depth===c.depth&&o.breadth===c.breadth));
 }
 for(const d of plan.placed){const id=d.item+':'+d.unit;assert.ok(!units.has(id));units.add(id);assert.ok(d.unit<=entries[d.item].qty);assert.ok(d.z+d.height<=Math.min(settings.dh,settings.ch));}
 assert.equal(plan.placed.length+plan.missed,entries.reduce((n,i)=>n+i.qty,0));
 for(let i=0;i<plan.columns.length;i++)for(let j=i+1;j<plan.columns.length;j++){
  const a=plan.columns[i],b=plan.columns[j];assert.ok(a.x+a.breadth+settings.gap<=b.x||b.x+b.breadth+settings.gap<=a.x||a.y+a.depth+settings.gap<=b.y||b.y+b.depth+settings.gap<=a.y);
 }
}
const mixedSettings={...s,cl:1800,cw:1200,dw:1200,ch:1900,dh:1900,base:0,wall:0,gap:0,spacer:0,maxLevels:4,stackMode:'mixed',floorOrientation:'auto'};
const fixedItems=[{name:'A',qty:3},{name:'B',qty:4}],fixedSizes=[{F:600,outer:1200},{F:1200,outer:400}];
let mixed=Array.from({length:4},(_,mode)=>packFlexible(fixedItems,fixedSizes,mixedSettings,mode)).sort((a,b)=>a.missed-b.missed||a.used-b.used)[0];
assert.equal(mixed.missed,0);assert.equal(new Set(mixed.columns.map(c=>c.posture)).size,2);verifyMixed(mixed,mixedSettings,fixedItems);
for(const stackMode of ['upright','flat'])for(let mode=0;mode<4;mode++)assert.ok(packFlexible(fixedItems,fixedSizes,{...mixedSettings,stackMode},mode).missed>0);
const rotateSettings={...mixedSettings,cl:1000,cw:1000,dw:1000,stackMode:'single',maxLevels:1};
const rotateItems=[{name:'Same cable',qty:3}],rotateSizes=[{F:600,outer:400}];
const rotated=Array.from({length:4},(_,mode)=>packFlexible(rotateItems,rotateSizes,rotateSettings,mode)).sort((a,b)=>a.missed-b.missed||a.used-b.used)[0];
assert.equal(rotated.missed,0);assert.equal(new Set(rotated.columns.map(c=>c.direction)).size,2);verifyMixed(rotated,rotateSettings,rotateItems);
for(const floorOrientation of ['along','across'])assert.ok(packFlexible(rotateItems,rotateSizes,{...rotateSettings,floorOrientation},0).missed>0);
const integrationSettings={...s,stackMode:'mixed',floorOrientation:'auto',maxLevels:3,spacer:50};
const mixedStart=Date.now(),integration=solve(items,integrationSettings,barrel,capacity);assert.equal(integration.missed,0);verifyMixed(integration,integrationSettings,items);
for(const d of integration.placed){assert.ok(d.capacity>=items[d.item].length*1.05-1e-8);assert.equal(d.F,integration.chosen[d.item].F);assert.equal(d.W,integration.chosen[d.item].W);}
new Function(source);
console.log('PASS: mixed-only fit, rotation-only fit for one cable item, 3D bounds, stack counts, gaps, full mixed optimizer and script syntax. Mixed solve: '+(Date.now()-mixedStart)+' ms');
const {modelGeometry,projectModel}=ctx.engine;
const faces=modelGeometry(integration,integrationSettings);
assert.ok(faces.length>0);
for(const f of faces)for(const point of f.points){assert.ok(point.every(Number.isFinite));assert.ok(point[0]>=f.drum.y-1e-7&&point[0]<=f.drum.y+f.drum.depth+1e-7);assert.ok(point[1]>=f.drum.x-1e-7&&point[1]<=f.drum.x+f.drum.breadth+1e-7);assert.ok(point[2]>=-1e-7&&point[2]<=Math.min(s.ch,s.dh)+1e-7);}
for(const direction of ['across','along','flat']){
 const flat=direction==='flat',d={F:800,B:300,W:400,outer:500,height:flat?500:800,depth:flat||direction==='across'?800:500,breadth:flat||direction==='along'?800:500,posture:flat?'flat':'upright',direction,x:30,y:30,z:100,level:1,column:1,item:0};
 const mesh=modelGeometry({placed:[d],columns:[]},{...s,t:40});const points=mesh.flatMap(f=>f.points),axis=flat?2:direction==='along'?0:1;
 for(let dim=0;dim<3;dim++){const extent=Math.max(...points.map(p=>p[dim]))-Math.min(...points.map(p=>p[dim]));assert.ok(Math.abs(extent-(dim===axis?480:800))<1e-6);}
 const p=projectModel([0,0,0],s,Math.PI/2,0);assert.ok(p.every(Number.isFinite));
}
assert.equal(faces.filter(f=>f.part==='Spacer').length,integration.placed.filter(d=>d.level>1).length*6);
// Exercise the renderer and controls without a browser dependency.
const control=id=>({value:id==='modelYaw'?'-35':id==='modelPitch'?'30':'100',events:{},addEventListener(k,fn){this.events[k]=fn;}});
const modelNodes={modelYaw:control('modelYaw'),modelPitch:control('modelPitch'),modelZoom:control('modelZoom'),modelSvg:{innerHTML:'',events:{},addEventListener(k,fn){this.events[k]=fn;},setPointerCapture(){}}};
const viewButtons=['iso','door','side','top'].map(view=>({dataset:{view}}));modelNodes.modelPanel={querySelectorAll:()=>viewButtons};ctx.document={getElementById:id=>modelNodes[id]};
vm.runInContext(source.slice(source.indexOf('function modelPanel('),source.indexOf('function render(')),ctx);
ctx.mountModel(integration,integrationSettings,items);
assert.ok(modelNodes.modelSvg.innerHTML.includes('DOORS'));assert.ok(!/NaN|Infinity/.test(modelNodes.modelSvg.innerHTML));
const initialModel=modelNodes.modelSvg.innerHTML;viewButtons[1].onclick();assert.notEqual(modelNodes.modelSvg.innerHTML,initialModel);assert.equal(modelNodes.modelYaw.value,90);
modelNodes.modelZoom.value=150;modelNodes.modelZoom.events.input();assert.ok(!/NaN|Infinity/.test(modelNodes.modelSvg.innerHTML));
ctx.mountModel({placed:[],columns:[],missed:1},s,items);assert.ok(modelNodes.modelSvg.innerHTML.includes('No drums placed'));
console.log('PASS: 3D drum geometry for all axes, spacers, placement bounds, model rendering, preset views, zoom and empty layouts.');
// A shallow, narrow drum demonstrates why continuous volume is not a turn count.
const shallow={...s,m:2,minW:190,maxW:190,step:10,maxF:400,c:0,reserve:0,t:10};
const shallowItem={name:'One layer',od:100,length:1.1,qty:1};
assert.equal(ctx.engine.windingCheck(190,400,200,100,0).turns,1);
assert.equal(ctx.engine.windingCheck(190,400,200,100,0).layers,1);
assert.ok(Math.abs(ctx.engine.windingCheck(190,400,200,100,0).capacity-Math.PI*.3)<1e-12);
assert.equal(candidates(shallowItem,shallow,barrel,capacity).length,1);
assert.equal(candidates(shallowItem,{...shallow,capacityMode:'guarded'},barrel,capacity).length,0);
assert.ok(candidates({...items[0],barrel:703},s,barrel,capacity).every(d=>d.B===725));
assert.throws(()=>candidates({...items[0],barrel:0},s,barrel,capacity));
assert.equal(ctx.engine.inches(25.4),1);assert.equal(ctx.engine.inches(254),10);
assert.equal(ctx.engine.floorOrigin({...s,cw:2400,dw:2000,wall:0}),200);
// Maximal free rectangles retain both alternatives across an artificial partition.
let space=ctx.engine.subtractSpace([{x:0,y:0,w:400,l:400}],{x:0,y:0,breadth:200,depth:200},0);
assert.ok(space.some(r=>r.w===200&&r.l===400));assert.ok(space.some(r=>r.w===400&&r.l===200));
space=ctx.engine.subtractSpace(space,{x:200,y:0,breadth:200,depth:300},0);
assert.ok(space.some(r=>r.w>=300&&r.l>=100&&r.y===300));
for(let mode=4;mode<8;mode++)verifyMixed(packFlexible(items,integration.chosen,integrationSettings,mode),integrationSettings,items);
const guarded={...integrationSettings,capacityMode:'guarded',searchEffort:'thorough'},deep=solve(items,guarded,barrel,capacity),balanced=solve(items,{...guarded,searchEffort:'balanced'},barrel,capacity);
assert.equal(deep.missed,0);assert.ok(deep.used<=balanced.used);assert.ok(deep.layoutsTried>balanced.layoutsTried);verifyMixed(deep,guarded,items);
for(const d of deep.placed){assert.ok(d.capacity<=d.formulaCapacity);assert.ok(d.capacity<=d.layerCapacity);assert.ok(d.capacity+1e-8>=items[d.item].length*1.05);}
console.log('PASS: whole-turn capacity guard, per-item barrel overrides, inch conversion, centred door corridor, maximal free-space recovery and thorough search.');
const pocketSettings={...s,cl:400,cw:400,dw:400,ch:1000,dh:1000,base:0,wall:0,gap:0,spacer:0,maxLevels:1,stackMode:'single',floorOrientation:'across'};
const pocketItems=[{name:'A',qty:1},{name:'B',qty:1},{name:'C',qty:1}],pocketSizes=[{F:200,outer:200},{F:300,outer:200},{F:100,outer:300}];
assert.ok(Array.from({length:4},(_,m)=>packFlexible(pocketItems,pocketSizes,pocketSettings,m)).every(p=>p.missed>0));
const recovered=Array.from({length:4},(_,m)=>packFlexible(pocketItems,pocketSizes,pocketSettings,m+4)).sort((a,b)=>a.missed-b.missed)[0];assert.equal(recovered.missed,0);verifyMixed(recovered,pocketSettings,pocketItems);
console.log('PASS: actual packing fixture fits with maximal rectangles after all four old split strategies fail.');
