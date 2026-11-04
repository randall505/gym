/* Wiring: navigation, click handling and everything that changes the state. */
const NAV=[['dashboard','Dashboard','layout-dashboard'],['planner','Planner','calendar-days'],['exercises','Exercises','dumbbell'],['progress','Progress','trending-up'],['profile','Profile','user']];
const PAGES={dashboard,planner,exercises,progress,profile};

function render(){
 const key=location.hash.replace('#/','');const page=PAGES[key]?key:'dashboard';
 $('#app').innerHTML=PAGES[page]();
 const links=NAV.map(([k,l,i])=>`<a href="#/${k}" class="${k===page?'on':''}">${icon(i)}<span>${l}</span></a>`).join('');
 $('#nav').innerHTML=links;$('#tabbar').innerHTML=links;
 refreshIcons();
}

/* Routine editor helpers */
function syncDraft(){
 view.draft.name=$('#dName').value.trim();
 document.querySelectorAll('.modal [data-k]').forEach(i=>{view.draft.exercises[i.dataset.i][i.dataset.k]=Math.max(1,+i.value||1)});
}
const openEditor=()=>openModal(view.draft.id?'Edit routine':'New routine',editorHTML());

/* Log workout modal */
function logModal(rid){
 const s=store.state,r=store.routine(rid)||s.routines[0];
 if(!r)return toast('Create a routine first');
 openModal('Log workout',`<label class="field"><span class="label">Routine</span><select data-change="logRoutine">${s.routines.map(x=>`<option value="${x.id}" ${x.id===r.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
 <div class="list" id="logForm" data-id="${r.id}">${r.exercises.map(e=>`<label class="row"><span>${exById(e.id).name} <small>${e.sets} × ${e.reps}</small></span><span><input type="number" min="0" step="0.5" data-lift="${e.id}" value="${store.lastLift(e.id)}" aria-label="${exById(e.id).name} weight in kg"> kg</span></label>`).join('')}</div>
 <label class="field" style="margin-top:16px"><span class="label">Duration (min)</span><input id="logMin" type="number" min="1" value="${routineMinutes(r)}"></label>
 <div class="actions end">${Button('Cancel','closeModal',{kind:'ghost'})}${Button('Save workout','saveLog',{ic:'check'})}</div>`);
}

/* Button actions (data-action="...") */
const actions={
 go:el=>{location.hash='#/'+el.dataset.to},
 overlay:(el,e)=>{if(e.target===el)closeModal()},
 closeModal,
 exCat:el=>{view.exCat=el.dataset.v;render()},
 tab:el=>{view.tab=el.dataset.v;render()},
 exDetail:el=>{const x=exById(el.dataset.id),r=store.records()[x.id];
  openModal(x.name,`<div class="detail">${Figure(x.cat)}<div><p>${x.desc}</p><div class="label">Target muscles</div><div class="badges" style="margin-bottom:16px">${x.muscles.map(Badge).join('')}</div><div class="label">Category</div><p>${x.cat}</p>${r?`<div class="label">Personal record</div><p class="acc">${r.kg} kg</p>`:''}</div></div>`)},
 logWorkout:el=>logModal(el.dataset.id),
 logPick:()=>logModal(),
 saveLog:()=>{
  const f=$('#logForm'),r=store.routine(f.dataset.id),before=store.records(),lifts={},prs=[];let volume=0;
  r.exercises.forEach(e=>{const kg=+$(`[data-lift="${e.id}"]`).value||0;lifts[e.id]=kg;volume+=e.sets*e.reps*kg;
   if(kg>0&&(!before[e.id]||kg>before[e.id].kg))prs.push(exById(e.id).name)});
  store.state.history.push({date:iso(new Date()),routine:r.name,minutes:+$('#logMin').value||1,volume,lifts});
  store.save();closeModal();render();toast(prs.length?`New personal record: ${prs[0]}`:'Workout logged')},
 newRoutine:()=>{view.draft={id:null,name:'',exercises:[]};openEditor()},
 editRoutine:el=>{view.draft=JSON.parse(JSON.stringify(store.routine(el.dataset.id)));openEditor()},
 deleteRoutine:el=>{const r=store.routine(el.dataset.id);if(!confirm(`Delete "${r.name}"? Past workouts stay in your history.`))return;
  const s=store.state;s.routines=s.routines.filter(x=>x.id!==r.id);
  Object.keys(s.schedule).forEach(d=>{if(s.schedule[d]===r.id)delete s.schedule[d]});
  store.save();render();toast('Routine deleted')},
 addEx:()=>{syncDraft();view.draft.exercises.push({id:$('#addSel').value,sets:3,reps:10,rest:60});openEditor()},
 removeEx:el=>{syncDraft();view.draft.exercises.splice(+el.dataset.i,1);openEditor()},
 saveRoutine:()=>{syncDraft();const d=view.draft;
  if(!d.name)return toast('Give the routine a name');
  if(!d.exercises.length)return toast('Add at least one exercise');
  const rs=store.state.routines;
  if(d.id){rs[rs.findIndex(r=>r.id===d.id)]=d}else{d.id='r'+Date.now();rs.push(d)}
  store.save();closeModal();render();toast('Routine saved')},
 weightModal:()=>openModal('Log body weight',weightForm()),
 addWeight:el=>{const v=+el.closest('.wf').querySelector('input').value;
  if(!(v>=20&&v<=300))return toast('Enter a weight between 20 and 300 kg');
  const w=store.state.weights,t=iso(new Date()),e=w.find(x=>x.date===t);
  if(e)e.kg=v;else w.push({date:t,kg:v});
  w.sort((a,b)=>a.date<b.date?-1:1);store.save();closeModal();render();toast('Weight logged')},
 saveProfile:()=>{const p=store.state.profile;
  document.querySelectorAll('#pf [name]').forEach(i=>{p[i.name]=i.type==='number'||['perWeek','length'].includes(i.name)?+i.value:i.value.trim()});
  p.name=p.name||'Athlete';store.save();toast('Profile saved')}
};
/* Form changes (data-change="...") */
const changes={
 assign:el=>{const s=store.state.schedule;if(el.value)s[el.dataset.day]=el.value;else delete s[el.dataset.day];store.save();toast('Schedule updated')},
 logRoutine:el=>logModal(el.value)
};

document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el&&actions[el.dataset.action])actions[el.dataset.action](el,e)});
document.addEventListener('change',e=>{const el=e.target.closest('[data-change]');if(el&&changes[el.dataset.change])changes[el.dataset.change](el)});
document.addEventListener('input',e=>{if(e.target.id==='exQ'){view.exQ=e.target.value;$('#exGrid').innerHTML=exGrid()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
window.addEventListener('hashchange',()=>{closeModal();render();window.scrollTo(0,0)});

store.load();
render();
