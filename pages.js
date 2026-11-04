/* One function per page. Each returns the page's HTML. */
const view={exCat:'All',exQ:'',tab:'History',draft:null};

function dashboard(){
 const s=store.state,r=store.todayRoutine(),wk=store.weekSessions(0),today=iso(new Date());
 const done=s.history.some(h=>h.date===today),hr=new Date().getHours();
 const greet=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
 const mon=startOfWeek();
 const dots=['M','T','W','T','F','S','S'].map((d,i)=>{const x=new Date(mon);x.setDate(x.getDate()+i);
  return `<span class="dot ${s.history.some(h=>h.date===iso(x))?'on':''}">${d}</span>`}).join('');
 const w=store.weekly();
 const todayPanel=r
  ?`<div class="label">Today's workout ${done?Badge('Logged'):''}</div><h2>${esc(r.name)}</h2><p class="muted">${r.exercises.length} exercises, about ${routineMinutes(r)} min</p><div class="list">${r.exercises.map(ExerciseRow).join('')}</div><div class="actions">${Button('Start workout','logWorkout',{ic:'play',data:`data-id="${r.id}"`})}${Button('Edit','editRoutine',{kind:'secondary',ic:'pencil',data:`data-id="${r.id}"`})}</div>`
  :`<div class="label">Today</div><h2>Rest day</h2><p class="muted">Nothing is scheduled today. You can change this in the planner.</p><div class="actions">${Button('Log a workout anyway','logPick',{kind:'secondary'})}</div>`;
 const quick=[['Log workout','logPick','clipboard-check'],['New routine','newRoutine','plus'],['Log weight','weightModal','scale'],['Browse exercises','go','dumbbell']]
  .map(([l,a,i])=>`<button class="quick" data-action="${a}" data-to="exercises">${icon(i)}${l}</button>`).join('');
 return PageHeader(`${greet}, ${esc(s.profile.name)}`,new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}),Button('Start workout','logPick',{ic:'play'}))+
 `<div class="stack"><div class="grid g3">${Panel(todayPanel)}<div class="stack">
  ${Panel(`<div class="label">Workout streak</div><div class="big">${store.streak()}<small>sessions</small></div><div class="dots">${dots}</div>`)}
  ${Panel(`<div class="label">This week</div><div class="stats"><div><b>${wk.length}</b><span>sessions</span></div><div><b>${fmt(wk.reduce((a,h)=>a+h.volume,0))}</b><span>kg lifted</span></div><div><b>${wk.reduce((a,h)=>a+h.minutes,0)}</b><span>minutes</span></div></div>`)}
  </div></div>
  ${Panel(`<div class="label">Weekly volume (kg)</div>${barChart(w.vol,w.labs)}`)}
  <div class="grid g4">${quick}</div>
  ${Panel(`<div class="label">Recent sessions</div>${[...s.history].reverse().slice(0,3).map(HistoryRow).join('')}`)}</div>`;
}

function planner(){
 const s=store.state,names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],order=[1,2,3,4,5,6,0];
 const week=order.map((d,i)=>`<div class="day ${d===new Date().getDay()?'today':''}"><div class="label">${names[i]}</div><select data-change="assign" data-day="${d}" aria-label="${names[i]} workout"><option value="">Rest</option>${s.routines.map(r=>`<option value="${r.id}" ${s.schedule[d]===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></div>`).join('');
 const list=s.routines.map(r=>Panel(`<div class="between"><div><h2>${esc(r.name)}</h2><p class="muted">${r.exercises.length} exercises, about ${routineMinutes(r)} min</p></div><div class="actions" style="margin:0">${Button('Edit','editRoutine',{kind:'secondary',ic:'pencil',data:`data-id="${r.id}"`})}${Button('','deleteRoutine',{kind:'ghost',ic:'trash-2',data:`data-id="${r.id}" aria-label="Delete routine"`})}</div></div><div class="list">${r.exercises.map(ExerciseRow).join('')}</div>`)).join('');
 return PageHeader('Workout planner','Build routines and assign them to days',Button('New routine','newRoutine',{ic:'plus'}))+
 `<div class="stack"><div class="week">${week}</div>${list||Panel('<p class="muted">No routines yet. Create one to get started.</p>')}</div>`;
}

function editorHTML(){
 const d=view.draft;
 const rows=d.exercises.map((e,i)=>`<div class="ed"><b>${exById(e.id).name}</b><div class="nums">${[['sets','Sets'],['reps','Reps'],['rest','Rest (s)']].map(([k,l])=>`<label><span class="label">${l}</span><input type="number" min="1" value="${e[k]}" data-i="${i}" data-k="${k}"></label>`).join('')}${Button('','removeEx',{kind:'ghost',ic:'x',data:`data-i="${i}" aria-label="Remove exercise"`})}</div></div>`).join('');
 return `<label class="field"><span class="label">Routine name</span><input id="dName" value="${esc(d.name)}" maxlength="30" placeholder="e.g. Upper body"></label>${rows||'<p class="muted">No exercises yet. Add one below.</p>'}<div class="add"><select id="addSel">${EXERCISES.map(x=>`<option value="${x.id}">${x.name}</option>`).join('')}</select>${Button('Add','addEx',{kind:'secondary',ic:'plus'})}</div><div class="actions end">${Button('Cancel','closeModal',{kind:'ghost'})}${Button('Save routine','saveRoutine')}</div>`;
}

function exGrid(){
 const q=view.exQ.toLowerCase();
 const list=EXERCISES.filter(e=>(view.exCat==='All'||e.cat===view.exCat)&&(e.name+' '+e.muscles.join(' ')).toLowerCase().includes(q));
 return list.map(e=>`<button class="card" data-action="exDetail" data-id="${e.id}">${Figure(e.cat)}<b>${e.name}</b><div class="badges">${e.muscles.map(Badge).join('')}</div></button>`).join('')||'<p class="muted">No exercises match your search.</p>';
}
function exercises(){
 return PageHeader('Exercise library',`${EXERCISES.length} exercises in ${CATEGORIES.length} categories`)+
 `<div class="toolbar">${Tabs(['All',...CATEGORIES],view.exCat,'exCat')}<input id="exQ" type="search" placeholder="Search exercise or muscle" value="${esc(view.exQ)}" aria-label="Search exercises"></div><div class="grid g-cards" id="exGrid">${exGrid()}</div>`;
}

const weightForm=()=>`<div class="wf add"><input type="number" step="0.1" placeholder="Weight in kg" aria-label="Weight in kg">${Button('Log weight','addWeight',{ic:'check'})}</div>`;
function progress(){
 const s=store.state,t=view.tab;let body='';
 if(t==='History')body=Panel(s.history.length?[...s.history].reverse().slice(0,20).map(HistoryRow).join(''):'<p class="muted">No workouts logged yet.</p>');
 if(t==='Charts'){const w=store.weekly();body=`<div class="stack">${Panel(`<div class="label">Sessions per week</div>${barChart(w.sess,w.labs)}`)}${Panel(`<div class="label">Volume per week (kg)</div>${barChart(w.vol,w.labs)}`)}</div>`}
 if(t==='Records'){const rec=Object.entries(store.records());
  body=Panel(rec.length?`<table><thead><tr><th>Exercise</th><th>Best</th><th>Date</th></tr></thead><tbody>${rec.map(([id,r])=>`<tr><td>${exById(id).name}</td><td class="acc">${r.kg} kg</td><td class="muted">${fmtDate(r.date)}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Log a workout with weights to set your first record.</p>')}
 if(t==='Body weight'){const w=s.weights,last=w[w.length-1],chg=w.length?(last.kg-w[0].kg).toFixed(1):0;
  body=`<div class="stack">${Panel(w.length?`<div class="stats"><div><b>${last.kg}</b><span>kg now</span></div><div><b>${chg>0?'+':''}${chg}</b><span>kg since ${fmtDate(w[0].date)}</span></div><div><b>${s.profile.targetWeight}</b><span>kg target</span></div></div>${lineChart(w.slice(-12).map(x=>({label:fmtDate(x.date),v:x.kg})))}`:'<p class="muted">No weight entries yet.</p>')}${Panel(`<div class="label">Log today's weight</div>${weightForm()}`)}</div>`}
 return PageHeader('Progress','Your training history and trends')+Tabs(['History','Charts','Records','Body weight'],t,'tab')+body;
}

function profile(){
 const p=store.state.profile;
 return PageHeader('Profile','Your details, goals and training preferences')+
 `<div class="stack" id="pf">
 ${Panel(`<h2 style="margin-bottom:16px">Personal</h2><div class="fields">${Field('Name','name',p.name)}${Field('Age','age',p.age,'number')}${Field('Height (cm)','height',p.height,'number')}</div>`)}
 ${Panel(`<h2 style="margin-bottom:16px">Goals</h2><div class="fields">${Field('Main goal','goal',p.goal,'text',['Build muscle','Lose fat','Get stronger','Stay active'])}${Field('Target weight (kg)','targetWeight',p.targetWeight,'number')}</div>`)}
 ${Panel(`<h2 style="margin-bottom:16px">Training preferences</h2><div class="fields">${Field('Experience','level',p.level,'text',['Beginner','Intermediate','Advanced'])}${Field('Days per week','perWeek',p.perWeek,'number',[2,3,4,5,6])}${Field('Session length (min)','length',p.length,'number',[30,45,60,90])}${Field('Equipment','equipment',p.equipment,'text',['Full gym','Home gym','Dumbbells only','Bodyweight'])}</div>`)}
 <div class="actions end" style="margin:0">${Button('Save profile','saveProfile',{ic:'check'})}</div></div>`;
}
