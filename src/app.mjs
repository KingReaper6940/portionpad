import {plan} from './plan.mjs';import {projectJSON,parseProject,reportJSON,reportCSV,brief} from './files.mjs';import {EXAMPLE} from './example.mjs';
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
 $('anchor-unit').textContent='Same unit: '+(project.rows[project.anchor]?.unit||'(no unit label)');
 $('output').replaceChildren();$('summary').replaceChildren();
 try{
  report=plan(project);$('results').hidden=false;$('save').disabled=false;
  for(const [value,label] of [[report.factor+'×','Scale factor'],[report.servings,'Proportional servings'],[String(report.rows.filter(r=>r.policy!=='scale').length),'Held / manual rows']]){const block=el('div');block.append(el('strong','',value),el('span','',label));$('summary').append(block);}
  for(const row of report.rows){const tr=el('tr',row.roundedToZero?'flag':'');for(const value of [row.name,row.amount+' '+row.unit,row.exact===null?'Manual review':row.exact+' '+row.unit,row.display+(row.exact!==null?' '+row.unit:''),row.delta??'—',row.policy])tr.append(el('td','',value));$('output').append(tr);}
  message('Plan updated. Save a project to keep your work.');
 }catch(error){report=null;$('results').hidden=true;$('save').disabled=true;message(error.message,true);}
 refreshTransfer();
}
for(const id of ['title','base','target','mode','available','anchor'])$(id).addEventListener('input',()=>{project[id]=id==='anchor'?Number($(id).value):$(id).value;render();});
$('add').addEventListener('click',()=>{project.rows.push({name:'Ingredient '+(project.rows.length+1),amount:'1',unit:'',policy:'scale',note:''});anchorOptions();rows();render();});
$('example').addEventListener('click',()=>{project=structuredClone(EXAMPLE);sync();message('Illustrative quantities loaded. This is not a tested recipe.');});
initializeTransfer();sync();

function save(text,name,type){const url=URL.createObjectURL(new Blob([text],{type:type+';charset=utf-8'}));const a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function selectedExport(){const type=$('export-format').value;return type==='csv'?{text:reportCSV(project),file:'portionpad-plan.csv',mime:'text/csv'}:type==='json'?{text:reportJSON(project),file:'portionpad-report.json',mime:'application/json'}:{text:brief(project),file:'portionpad-plan.txt',mime:'text/plain'};}
function refreshTransfer(){
 if(!$('export-format'))return;
 $('rounding').value=String(project.rounding);document.querySelector('.pill').textContent=project.rounding?'Rounding is explicit':'Exact fractions';
 $('download').disabled=!report;$('export-preview').value=report?selectedExport().text:'';
}
function initializeTransfer(){
 const roundLabel=el('label','rounding','Optional display rounding'),round=el('select');round.id='rounding';roundLabel.htmlFor='rounding';
 for(const [value,label] of [[0,'Exact · no rounding'],[16,'Nearest 1/16 unit'],[8,'Nearest 1/8 unit'],[4,'Nearest 1/4 unit'],[2,'Nearest 1/2 unit'],[1,'Nearest whole unit']]){const o=el('option','',label);o.value=String(value);round.append(o);}roundLabel.append(round);$('rounding-slot').append(roundLabel);
 $('rounding-slot').append(el('p','help','Rounding applies only to Scale rows, in their original unit. Halfway values round up. Difference = shown minus exact; highlighted rows would round a nonzero amount to zero.'));
 round.addEventListener('input',()=>{project.rounding=Number(round.value);render();});
 const slot=$('transfer-slot'),formatLabel=el('label','','Export format'),format=el('select');format.id='export-format';formatLabel.htmlFor=format.id;
 for(const [value,name] of [['text','Plain text plan'],['csv','CSV quantity table'],['json','JSON calculation report']]){const o=el('option','',name);o.value=value;format.append(o);}formatLabel.append(format);
 const download=el('button','','Download report ↓');download.id='download';download.addEventListener('click',()=>{if(report){const file=selectedExport();save(file.text,file.file,file.mime);}});
 const inspect=el('details'),summary=el('summary','','Inspect report before downloading'),preview=el('textarea');preview.id='export-preview';preview.readOnly=true;preview.setAttribute('aria-label','Export preview');inspect.append(summary,preview);
 const paste=el('details'),heading=el('summary','','Reopen a saved project'),label=el('label','','Paste Portionpad project JSON'),input=el('textarea');input.id='project-input';input.spellcheck=false;label.htmlFor=input.id;
 const load=el('button','','Load pasted project');load.addEventListener('click',()=>{try{const next=parseProject(input.value);plan(next);project=next;sync();input.value='';message('Saved project loaded.');}catch(error){message(error.message,true);}});
 paste.append(heading,label,input,load);slot.append(formatLabel,download,inspect,paste);
 format.addEventListener('input',refreshTransfer);
 $('save').addEventListener('click',()=>{if(report)save(projectJSON(project),'portionpad-project.json','application/json');});
}
