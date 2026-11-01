(function(root){
'use strict';
const blank=()=>({version:2,current:null,completed:[],sound:true,vibration:true});
const clone=s=>JSON.parse(JSON.stringify(s));
function validate(s,c){
 if(!s||s.version!==2||!Array.isArray(s.completed)||typeof s.sound!=='boolean'||typeof s.vibration!=='boolean') return false;
 const seen=new Set();
 const dateOk=v=>typeof v==='string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
 const check=(x,done)=>{
  if(!x||seen.has(x.id))return false; seen.add(x.id);
  const d=c.find(z=>z.id===x.id); if(!d||!Array.isArray(x.films)||x.films.length!==3||typeof x.replaced!=='boolean')return false;
  if(!x.films.every((f,i)=>f&&d.films.some((z,j)=>z.id===f.id&&(j===i||(x.replaced&&j>=3)))&&(f.rating===null||(Number.isInteger(f.rating)&&f.rating>=2&&f.rating<=20&&dateOk(f.date)))))return false;
  if(new Set(x.films.map(f=>f.id)).size!==3||x.films.filter(f=>d.films.slice(3).some(z=>z.id===f.id)).length!==(x.replaced?1:0))return false;
  return done?x.films.every(f=>f.rating!==null)&&dateOk(x.completedAt):x.films.some(f=>f.rating===null);
 };
 return s.completed.every(x=>check(x,true))&&(s.current===null||check(s.current,false));
}
function choose(s,c,random){if(s.current)throw Error('Испытание уже активно');const a=c.filter(d=>!s.completed.some(x=>x.id===d.id));if(!a.length)throw Error('Сезон завершён');const d=a[random(a.length)];s.current={id:d.id,replaced:false,films:d.films.slice(0,3).map(f=>({id:f.id,rating:null,date:null}))};return d.id}
function replace(s,c,index,random){const x=s.current;if(!x||x.replaced||!Number.isInteger(index)||index<0||index>2||x.films[index].rating!==null)throw Error('Замена недоступна');const d=c.find(z=>z.id===x.id);x.films[index]={id:d.films[3+random(3)].id,rating:null,date:null};x.replaced=true;return x.films[index].id}
function rate(s,index,rating,date){const x=s.current;if(!x||!Number.isInteger(index)||index<0||index>2||x.films[index].rating!==null||!Number.isInteger(rating)||rating<2||rating>20)throw Error('Недопустимая оценка');x.films[index].rating=rating;x.films[index].date=date;if(x.films.every(f=>f.rating!==null)){x.completedAt=date;s.completed.push(x);s.current=null}}
function edit(s,id,rating){if(!Number.isInteger(rating)||rating<2||rating>20)throw Error('Недопустимая оценка');const f=s.completed.flatMap(x=>x.films).concat(s.current?s.current.films:[]).find(x=>x.id===id&&x.rating!==null);if(!f)throw Error('Фильм не найден');f.rating=rating}
const api={blank,clone,validate,choose,replace,rate,edit};if(typeof module!=='undefined')module.exports=api;else root.Engine=api;
})(globalThis);
