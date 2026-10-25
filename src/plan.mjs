import {parseAmount,rational,mul,div,sub,format,rounded} from './math.mjs';
function text(value,max,label){if(typeof value!=='string'||value.trim().length>max||/[\u0000-\u001f]/u.test(value))throw new Error(label+' must be text up to '+max+' characters without line breaks.');return value.trim();}
function positive(value,label){const q=parseAmount(value);if(q.n===0n||q.n>1000n*q.d)throw new Error(label+' must be greater than zero and at most 1,000.');return q;}
export function normalize(value){
 if(!value||typeof value!=='object'||!Array.isArray(value.rows)||value.rows.length<1||value.rows.length>40)throw new Error('Use 1–40 ingredients.');
 const title=text(value.title,80,'Title');if(!title)throw new Error('Add a recipe title.');
 const base=text(value.base,32,'Original servings'),target=text(value.target,32,'Target servings');positive(base,'Original servings');positive(target,'Target servings');
 if(!['servings','anchor'].includes(value.mode))throw new Error('Choose servings or an ingredient anchor.');
 const rounding=Number(value.rounding);if(![0,1,2,4,8,16].includes(rounding))throw new Error('Choose a supported rounding increment.');
 const rows=value.rows.map((row,index)=>{if(!row||!['scale','hold','manual'].includes(row.policy))throw new Error('Choose an ingredient scaling policy.');
  const name=text(row.name,64,'Ingredient '+(index+1));if(!name)throw new Error('Name ingredient '+(index+1)+'.');const amount=text(row.amount,32,'Amount');if(row.policy!=='manual')parseAmount(amount);
  return {name,amount,unit:text(row.unit,16,'Unit'),policy:row.policy,note:text(row.note??'',120,'Note')};
 });
 const anchor=Number(value.anchor);if(!Number.isInteger(anchor)||anchor<0||anchor>=rows.length)throw new Error('Choose an existing anchor ingredient.');
 const available=text(value.available,32,'Available amount');
 if(value.mode==='anchor'){if(rows[anchor].policy!=='scale')throw new Error('The anchor ingredient must use Scale.');if(parseAmount(rows[anchor].amount).n===0n)throw new Error('The anchor original amount must be greater than zero.');if(parseAmount(available).n===0n)throw new Error('Available amount must be greater than zero.');}
 return {format:'portionpad-v1',title,base,target,mode:value.mode,anchor,available,rounding,rows};
}
export function plan(input){
 const project=normalize(input),base=parseAmount(project.base);
 const factor=project.mode==='servings'?div(parseAmount(project.target),base):div(parseAmount(project.available),parseAmount(project.rows[project.anchor].amount));
 if(factor.n>1000n*factor.d||factor.n*1000n<factor.d)throw new Error('Use a scale factor from 1/1,000 to 1,000.');
 const rows=project.rows.map(row=>{
  if(row.policy==='manual')return {...row,exact:null,display:'Review manually',delta:null,roundedToZero:false};
  const exact=row.policy==='hold'?parseAmount(row.amount):mul(parseAmount(row.amount),factor);
  const shown=project.rounding&&row.policy==='scale'?rounded(exact,project.rounding):exact;
  return {...row,exact:format(exact),display:format(shown),delta:format(sub(shown,exact)),roundedToZero:exact.n>0n&&shown.n===0n};
 });
 return {project,factor:format(factor),servings:format(mul(base,factor)),rows};
}
