/* The app's state, saved in the browser's localStorage so it survives a refresh. */
const KEY='forge-v1';
const exById=id=>EXERCISES.find(e=>e.id===id);
const routineMinutes=r=>Math.round(r.exercises.reduce((t,e)=>t+e.sets*(45+e.rest),0)/60);

const store={
 state:null,
 load(){try{this.state=JSON.parse(localStorage.getItem(KEY))}catch(e){} if(!this.state)this.state=defaultState()},
 save(){localStorage.setItem(KEY,JSON.stringify(this.state))},
 routine(id){return this.state.routines.find(r=>r.id===id)},
 todayRoutine(){return this.routine(this.state.schedule[new Date().getDay()])},
 /* sessions in the week k weeks ago (0 = this week) */
 weekSessions(k){const a=startOfWeek();a.setDate(a.getDate()-7*k);const b=new Date(a);b.setDate(b.getDate()+7);
  return this.state.history.filter(h=>h.date>=iso(a)&&h.date<iso(b))},
 weekly(n=6){const sess=[],vol=[],labs=[];
  for(let k=n-1;k>=0;k--){const w=this.weekSessions(k);sess.push(w.length);vol.push(w.reduce((a,h)=>a+h.volume,0));labs.push(k?`-${k}w`:'Now')}
  return{sess,vol,labs}},
 /* streak = sessions in a row with no gap longer than 3 days (rest days allowed) */
 streak(){const dates=[...new Set(this.state.history.map(h=>h.date))].sort().reverse();
  let n=0,prev=new Date();prev.setHours(12,0,0,0);
  for(const s of dates){const d=new Date(s+'T12:00:00');if((prev-d)/864e5>3)break;n++;prev=d}
  return n},
 /* personal record per exercise = heaviest weight ever logged */
 records(){const best={};
  [...this.state.history].sort((a,b)=>a.date<b.date?-1:1).forEach(h=>Object.entries(h.lifts).forEach(([id,kg])=>{
   if(kg>0&&(!best[id]||kg>best[id].kg))best[id]={kg,date:h.date}}));
  return best},
 lastLift(id){for(let i=this.state.history.length-1;i>=0;i--){const kg=this.state.history[i].lifts[id];if(kg!==undefined)return kg}return 0}
};
