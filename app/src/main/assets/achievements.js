(function(root){
'use strict';
const east=new Set(['d01','d14','d15','d16','d21','d23','d24']);
const definitions=[
 {id:'first_film',category:'Старт',icon:'✦',name:'Первый шаг',description:'Посмотрите и оцените первый фильм.',kind:'films',target:1},
 {id:'first_director',category:'Старт',icon:'★',name:'Первый мастер',description:'Завершите первое испытание режиссёра.',kind:'directors',target:1},
 {id:'ten_films',category:'Прогресс',icon:'◈',name:'Киноман',description:'Посмотрите и оцените 10 фильмов.',kind:'films',target:10},
 {id:'quarter',category:'Прогресс',icon:'◉',name:'Четверть пути',description:'Завершите 7 испытаний режиссёров.',kind:'directors',target:7},
 {id:'half',category:'Прогресс',icon:'◐',name:'Половина пути',description:'Завершите 13 испытаний режиссёров.',kind:'directors',target:13},
 {id:'east',category:'Тематические',icon:'✺',name:'Мастер Востока',description:'Завершите 3 испытания режиссёров из Японии, Китая или Кореи.',kind:'east',target:3},
 {id:'season',category:'Финальные',icon:'♛',name:'Легенда кинематографа',description:'Завершите испытания всех 25 режиссёров.',kind:'directors',target:25}
];
function evaluate(state){
 const challenges=state.completed.concat(state.current?[state.current]:[]);
 const films=challenges.flatMap(x=>x.films.filter(f=>f.rating!==null).map(f=>f.date)).sort((a,b)=>Date.parse(a)-Date.parse(b));
 const directors=state.completed.map(x=>x.completedAt).sort((a,b)=>Date.parse(a)-Date.parse(b));
 const eastern=state.completed.filter(x=>east.has(x.id)).map(x=>x.completedAt).sort((a,b)=>Date.parse(a)-Date.parse(b));
 const events={films,directors,east:eastern};
 return definitions.map(d=>{const dates=events[d.kind],progress=Math.min(dates.length,d.target),unlocked=progress>=d.target;return {...d,progress,unlocked,date:unlocked?dates[d.target-1]:null}});
}
function newlyUnlocked(before,after){const prior=new Set(evaluate(before).filter(a=>a.unlocked).map(a=>a.id));return evaluate(after).filter(a=>a.unlocked&&!prior.has(a.id));}
function summary(state){const all=evaluate(state),unlocked=all.filter(a=>a.unlocked),locked=all.filter(a=>!a.unlocked);return {all,unlocked:unlocked.length,last:unlocked.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))[0]||null,nearest:locked.sort((a,b)=>b.progress/b.target-a.progress/a.target||a.target-a.progress-(b.target-b.progress))[0]||null};}
const api={definitions,evaluate,newlyUnlocked,summary};if(typeof module!=='undefined')module.exports=api;else root.Achievements=api;
})(globalThis);
