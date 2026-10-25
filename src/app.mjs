import {plan} from './plan.mjs';import {EXAMPLE} from './example.mjs';
const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
let project=structuredClone(EXAMPLE),report=null;
function message(text,error=false){$('status').textContent=text;$('status').className=error?'error':'';}
function anchorOptions(){const select=$('anchor');select.replaceChildren();project.rows.forEach((row,i)=>{const o=el('option','',row.name||'Ingredient '+(i+1));o.value=String(i);select.append(o);});select.value=String(project.anchor);$('anchor-unit').textContent='Same unit: '+(project.rows[project.anchor]?.unit||'(no unit label)');}
function sync(){for(const id of ['title','base','target','mode','available'])$(id).value=project[id];anchorOptions();rows();render();}
function rows(){
 $('ingredients').replaceChildren();
 project.rows.forEach((row,i)=>{const tr=el('tr');
  for(const key of ['name','amount','unit','policy','note']){const td=el('td'),input=el(key==='policy'?'select':'input');if(key==='policy'){for(const [value,name] of [['scale','Scale'],['hold','Hold'],['manual','Manual']]){const o=el('option','',name);o.value=value;input.append(o);}}input.value=row[key];input.setAttribute('aria-label',key+' for ingredient '+(i+1));input.addEventListener('input',()=>{row[key]=input.value;if(key==='name'||key==='unit')anchorOptions();render();});td.append(input);tr.append(td);}
  const td=el('td'),remove=el('button','remove','×');remove.setAttribute('aria-label','Remove ingredient '+(i+1));remove.disabled=project.rows.length<=1;remove.addEventListener('click',()=>{project.rows.splice(i,1);project.anchor=0;project.mode='servings';sync();message('Ingredient removed. Scaling reset to servings.');});td.append(remove);tr.append(td);$('ingredients').append(tr);
 });$('add').disabled=project.rows.length>=40;
}
function render(){
 const anchor=project.mode==='anchor';$('target-label').hidden=anchor;$('anchor-label').hidden=!anchor;$('available-label').hidden=!anchor;$('anchor-help').hidden=!anchor;
 $('output').replaceChildren();$('summary').replaceChildren();
 try{
  report=plan(project);$('results').hidden=false;$('save').disabled=false;
  for(const [value,label] of [[report.factor+'×','Scale factor'],[report.servings,'Proportional servings'],[String(report.rows.filter(r=>r.policy!=='scale').length),'Held / manual rows']]){const block=el('div');block.append(el('strong','',value),el('span','',label));$('summary').append(block);}
  for(const row of report.rows){const tr=el('tr',row.roundedToZero?'flag':'');for(const value of [row.name,row.amount+' '+row.unit,row.exact===null?'Manual review':row.exact+' '+row.unit,row.display+(row.exact!==null?' '+row.unit:''),row.delta??'—',row.policy])tr.append(el('td','',value));$('output').append(tr);}
  message('Plan updated. Save a project to keep your work.');
 }catch(error){report=null;$('results').hidden=true;$('save').disabled=true;message(error.message,true);}
}
for(const id of ['title','base','target','mode','available','anchor'])$(id).addEventListener('input',()=>{project[id]=id==='anchor'?Number($(id).value):$(id).value;render();});
$('add').addEventListener('click',()=>{project.rows.push({name:'Ingredient '+(project.rows.length+1),amount:'1',unit:'',policy:'scale',note:''});anchorOptions();rows();render();});
$('example').addEventListener('click',()=>{project=structuredClone(EXAMPLE);sync();message('Illustrative quantities loaded. This is not a tested recipe.');});
sync();
