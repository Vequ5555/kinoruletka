(function(root){
'use strict';
const COUNT=25, STEP=360/COUNT, DURATION=10000;
function target(index){if(!Number.isInteger(index)||index<0||index>=COUNT)throw Error('Invalid wheel sector');return 360*9-(index+.5)*STEP}
function pointedIndex(degrees){const angle=(((-degrees)%360)+360)%360;return Math.floor(angle/STEP)%COUNT}
const api={COUNT,STEP,DURATION,target,pointedIndex};if(typeof module!=='undefined')module.exports=api;else root.Wheel=api;
})(globalThis);
