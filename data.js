/* Sample data. Everything the app starts with lives here. */
const CATEGORIES=['Push','Pull','Legs','Core'];
const EXERCISES=[
 {id:'bench',name:'Barbell Bench Press',cat:'Push',muscles:['Chest','Triceps'],desc:'Lie on a flat bench, lower the bar to your mid-chest, then press it up until your arms are straight.'},
 {id:'ohp',name:'Overhead Press',cat:'Push',muscles:['Shoulders','Triceps'],desc:'Standing, press the bar from your collarbone to overhead while keeping your glutes tight.'},
 {id:'incdb',name:'Incline Dumbbell Press',cat:'Push',muscles:['Upper chest','Shoulders'],desc:'On a bench set to about 30 degrees, press the dumbbells up and lower them under control.'},
 {id:'pushdown',name:'Triceps Pushdown',cat:'Push',muscles:['Triceps'],desc:'Elbows pinned to your sides, push the cable handle down until your arms are straight.'},
 {id:'pushup',name:'Push-up',cat:'Push',muscles:['Chest','Triceps','Core'],desc:'Keep a straight line from head to heels, lower your chest to the floor and push back up.'},
 {id:'row',name:'Barbell Row',cat:'Pull',muscles:['Lats','Upper back'],desc:'Hinge forward with a flat back and pull the bar to your lower ribs.'},
 {id:'pulldown',name:'Lat Pulldown',cat:'Pull',muscles:['Lats','Biceps'],desc:'Pull the bar to your upper chest by driving your elbows down, then control it back up.'},
 {id:'pullup',name:'Pull-up',cat:'Pull',muscles:['Lats','Biceps'],desc:'Hang from the bar and pull until your chin clears it, then lower fully.'},
 {id:'curl',name:'Dumbbell Curl',cat:'Pull',muscles:['Biceps'],desc:'Curl the dumbbells up without swinging your torso, then lower slowly.'},
 {id:'squat',name:'Back Squat',cat:'Legs',muscles:['Quads','Glutes'],desc:'With the bar on your upper back, sit down until your thighs are parallel to the floor, then stand.'},
 {id:'rdl',name:'Romanian Deadlift',cat:'Legs',muscles:['Hamstrings','Glutes'],desc:'Push your hips back with soft knees, lower the bar along your legs, then drive your hips forward.'},
 {id:'legpress',name:'Leg Press',cat:'Legs',muscles:['Quads','Glutes'],desc:'Lower the sled until your knees reach about 90 degrees, then press back up.'},
 {id:'calf',name:'Standing Calf Raise',cat:'Legs',muscles:['Calves'],desc:'Rise onto your toes as high as you can, pause, and lower to a full stretch.'},
 {id:'lunge',name:'Walking Lunge',cat:'Legs',muscles:['Quads','Glutes'],desc:'Step forward, lower your back knee toward the floor, then drive through your front foot.'},
 {id:'plank',name:'Plank',cat:'Core',muscles:['Abs','Obliques'],desc:'Hold a straight line on your forearms and toes, squeezing your abs and glutes.'},
 {id:'cablecrunch',name:'Cable Crunch',cat:'Core',muscles:['Abs'],desc:'Kneel at a cable stack and curl your ribs toward your hips without moving your hips.'},
 {id:'legraise',name:'Hanging Leg Raise',cat:'Core',muscles:['Abs','Hip flexors'],desc:'Hang from a bar and raise your legs without swinging, then lower with control.'}
];
const ROUTINES=[
 {id:'r1',name:'Push Day',exercises:[{id:'bench',sets:4,reps:8,rest:90},{id:'ohp',sets:3,reps:10,rest:75},{id:'incdb',sets:3,reps:10,rest:75},{id:'pushdown',sets:3,reps:12,rest:60}]},
 {id:'r2',name:'Pull Day',exercises:[{id:'row',sets:4,reps:8,rest:90},{id:'pulldown',sets:3,reps:10,rest:75},{id:'pullup',sets:3,reps:6,rest:90},{id:'curl',sets:3,reps:12,rest:60}]},
 {id:'r3',name:'Leg Day',exercises:[{id:'squat',sets:4,reps:6,rest:120},{id:'rdl',sets:3,reps:8,rest:90},{id:'legpress',sets:3,reps:12,rest:90},{id:'calf',sets:4,reps:15,rest:45}]}
];
const BASE_KG={bench:60,ohp:35,incdb:22,pushdown:30,row:60,pulldown:50,curl:12,squat:80,rdl:70,legpress:140,calf:60};

const iso=d=>d.toLocaleDateString('en-CA');            // "2026-11-04"
const startOfWeek=()=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d}; // Monday

/* Five weeks of past sessions (Mon/Wed/Fri) with weights that slowly increase. */
function sampleHistory(){
 const out=[],plan={1:'r1',3:'r2',5:'r3'};
 for(let i=34;i>0;i--){
  const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);
  const r=ROUTINES.find(x=>x.id===plan[d.getDay()]);if(!r)continue;
  const lifts={};let volume=0;
  r.exercises.forEach(e=>{const kg=BASE_KG[e.id]?BASE_KG[e.id]+Math.floor((34-i)/7)*2.5:0;lifts[e.id]=kg;volume+=e.sets*e.reps*kg});
  out.push({date:iso(d),routine:r.name,minutes:48+i%4*4,volume,lifts});
 }
 return out;
}
const defaultState=()=>({
 routines:JSON.parse(JSON.stringify(ROUTINES)),
 schedule:{1:'r1',3:'r2',5:'r3'},                      // weekday number (0=Sun) -> routine id
 history:sampleHistory(),
 weights:[74.2,74.5,74.4,74.9,75.1,75.3,75.6,75.9].map((kg,i,a)=>{const d=new Date();d.setDate(d.getDate()-(a.length-1-i)*7);return{date:iso(d),kg}}),
 profile:{name:'Alex',age:21,height:178,targetWeight:78,goal:'Build muscle',level:'Intermediate',perWeek:3,length:60,equipment:'Full gym'}
});
