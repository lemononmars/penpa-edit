export const hundredTwoNumberCombinations = (() => {
 const results=[];
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)for(let c=1;c<=9;c++)for(let d=1;d<=9;d++){
  if(new Set([a,b,c,d]).size<4)continue;
  const left=10*a+b,right=10*c+d;
  if(left<right&&left+right===100)results.push(`${left} + ${right}`);
 }
 return results;
})();

export const hundredMixedCombinations = (() => {
 const results=[];
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){
  if(a===b)continue;
  const number=10*a+b;
  for(let c=1;c<=9;c++)for(let d=c+1;d<=9;d++)for(let e=d+1;e<=9;e++){
   if(new Set([a,b,c,d,e]).size===5&&number+c+d+e===100)results.push(`${number} + ${c} + ${d} + ${e}`);
  }
 }
 return results;
})();

export const hundredCombinationGroups = (() => {
 const definitions=[
  {twoDigitCount:1,singleCount:1,label:'One 2-digit number + one single digit'},
  {twoDigitCount:1,singleCount:2,label:'One 2-digit number + two single digits'},
  {twoDigitCount:1,singleCount:3,label:'One 2-digit number + three single digits'},
  {twoDigitCount:2,singleCount:0,label:'Two 2-digit numbers'},
  {twoDigitCount:2,singleCount:1,label:'Two 2-digit numbers + one single digit'},
  {twoDigitCount:2,singleCount:2,label:'Two 2-digit numbers + two single digits'},
  {twoDigitCount:3,singleCount:0,label:'Three 2-digit numbers'},
 ];
 const terms=[];
 for(let value=1;value<100;value++){
  const text=String(value);
  if(text.includes('0')||new Set(text).size!==text.length)continue;
  terms.push({value,digits:[...text].map(Number)});
 }
 const combinations=[];
 function visit(start,sum,used,picked){
  if(sum===100){
   const twoDigitCount=picked.filter(value=>value>=10).length;
   const singleCount=picked.length-twoDigitCount;
   const digitCount=twoDigitCount*2+singleCount;
   if(picked.length>=2&&digitCount+picked.length-1<=9){
    combinations.push({twoDigitCount,singleCount,text:picked.join(' + ')});
   }
   return;
  }
  for(let index=start;index<terms.length;index++){
   const term=terms[index];
   if(sum+term.value>100)break;
   if(term.digits.some(digit=>used.has(digit)))continue;
   const nextUsed=new Set(used);
   term.digits.forEach(digit=>nextUsed.add(digit));
   visit(index+1,sum+term.value,nextUsed,[...picked,term.value]);
  }
 }
 visit(0,0,new Set(),[]);
 return definitions.map(definition=>({
  ...definition,
  combinations:combinations
   .filter(entry=>entry.twoDigitCount===definition.twoDigitCount&&entry.singleCount===definition.singleCount)
   .map(entry=>entry.text),
 }));
})();

export const primeRunCombinations = (() => {
 const primes=[2,3,5,7],groups=new Map();
 for(let mask=1;mask<(1<<primes.length);mask++){
  const digits=primes.filter((_,index)=>(mask>>index)&1);
  const sum=digits.reduce((total,digit)=>total+digit,0);
  if(!groups.has(sum))groups.set(sum,[]);
  groups.get(sum).push(digits);
 }
 return [...groups.entries()]
  .sort(([a],[b])=>a-b)
  .map(([sum,digitSets])=>({sum,digitSets}));
})();

export const primeRunSums = primeRunCombinations.map(({sum})=>sum);
