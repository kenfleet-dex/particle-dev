'use strict';
function referenceContent(id){
  const safe=String(id).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<span>REF ·</span><button type="button" class="reference-copy reference-id" data-copy-reference="${safe}" title="Copy a change request and add feedback for this reference" aria-label="Copy change request for ${safe}" aria-haspopup="dialog"><span class="reference-label">${safe}</span>${icon('Copy')}<span data-copy-feedback aria-live="polite"></span></button>`;
}
async function copyReference(button){
  const value=`Make the following changes to ${button.dataset.copyReference}:\n\nApply the requested changes to every relevant occurrence of the same content, setting, or shared component across pages, views, menus, and dialogs. Preserve explicitly view-specific behavior, make no unrelated changes, and deploy the updates.\n\n`,label=button.querySelector('[data-copy-feedback]');
  let copied=false;
  try{await navigator.clipboard.writeText(value);copied=true}catch{
    const field=document.createElement('textarea');field.value=value;field.setAttribute('readonly','');field.style.cssText='position:fixed;opacity:0;pointer-events:none';
    const active=document.activeElement;(document.querySelector('#reference-feedback-dialog[open]')||button.closest('dialog')||document.body).appendChild(field);
    try{field.select();copied=document.execCommand('copy')}catch{}finally{field.remove();active?.focus({preventScroll:true})}
  }
  clearTimeout(button.copyTimer);label.textContent=copied?'Copied!':'Try again';
  button.setAttribute('aria-label',copied?'Change request copied: '+value:'Retry copying change request');
  button.copyTimer=setTimeout(()=>{label.textContent='';button.setAttribute('aria-label','Copy change request for '+button.dataset.copyReference)},1800);
}
let referenceFeedbackDialog=null,referenceFeedbackHistory=[];
const prototypeSessionStorageKey='particle-prototype-feedback-session-v1';
function newPrototypeSession(){return {startedAt:new Date().toISOString(),endedAt:null,entries:[]}}
let prototypeFeedbackSession=newPrototypeSession();
try{const saved=JSON.parse(sessionStorage.getItem(prototypeSessionStorageKey));if(saved&&typeof saved.startedAt==='string'&&Array.isArray(saved.entries)&&saved.entries.every(entry=>typeof entry.id==='string'&&typeof entry.title==='string'&&Array.isArray(entry.notes)&&entry.notes.every(note=>typeof note==='string')))prototypeFeedbackSession=saved}catch{}
function persistPrototypeSession(){try{sessionStorage.setItem(prototypeSessionStorageKey,JSON.stringify(prototypeFeedbackSession))}catch{}}
function sessionEndControl(){return '<button type="button" class="primary prototype-session-end" data-prototype-session-end>End Prototype Session</button>'}
function feedbackSectionTitle(button){
  if(button.dataset.copyReference==='P01-LOGIN')return 'Login';
  const ref=button.closest('.page-reference,.feature-reference,.modal-reference'),scope=ref?.classList.contains('page-reference')?document.querySelector('#app main,#app .login'):ref?.parentElement;
  return (scope?.querySelector(':scope > summary,h1,h2,h3')?.textContent||button.dataset.copyReference).replace(/\s+/g,' ').trim();
}
function appendSessionNote(id,title,value){const notes=feedbackNotes(value);if(!notes.length)return false;if(prototypeFeedbackSession.endedAt)prototypeFeedbackSession=newPrototypeSession();prototypeFeedbackSession.entries.push({id,title,notes});persistPrototypeSession();return true}
function feedbackNotes(value){return value.split(/\r?\n/).map(line=>line.replace(/^\s*(?:[-*•]\s*)?/,'').trim()).filter(Boolean)}
function normalizeFeedbackBullets(field){
  const lines=field.value.split(/\r?\n/),start=field.selectionStart,end=field.selectionEnd;let offset=0,nextOffset=0,nextStart=start,nextEnd=end;
  const formatted=lines.map(line=>{const prefix=line.match(/^\s*(?:[-*•]\s*)?/)[0].length,next='- '+line.slice(prefix);
    for(const [position,key] of [[start,'start'],[end,'end']])if(position>=offset&&position<=offset+line.length){const mapped=nextOffset+Math.max(2,position-offset-prefix+2);if(key==='start')nextStart=mapped;else nextEnd=mapped}
    offset+=line.length+1;nextOffset+=next.length+1;return next;
  }).join('\n');
  if(formatted!==field.value){field.value=formatted;field.setSelectionRange(nextStart,nextEnd)}
}
function updateFeedbackSave(){const field=referenceFeedbackDialog.querySelector('textarea');referenceFeedbackDialog.querySelector('[data-feedback-save]').disabled=!feedbackNotes(field.value).length;referenceFeedbackDialog.querySelector('[data-feedback-status]').textContent=''}
function showReferenceFeedback(id,value='- ',sectionTitle=id){
  if(!referenceFeedbackDialog){
    referenceFeedbackDialog=document.createElement('dialog');referenceFeedbackDialog.id='reference-feedback-dialog';referenceFeedbackDialog.className='reference-feedback-dialog';referenceFeedbackDialog.setAttribute('aria-labelledby','reference-feedback-title');document.body.appendChild(referenceFeedbackDialog);
    referenceFeedbackDialog.addEventListener('input',e=>{if(e.target.matches('textarea')&&!e.isComposing){normalizeFeedbackBullets(e.target);updateFeedbackSave()}});
    referenceFeedbackDialog.addEventListener('keydown',e=>{if(e.target.matches('textarea')&&e.key==='Enter'&&!e.isComposing){e.preventDefault();e.target.setRangeText('\n- ',e.target.selectionStart,e.target.selectionEnd,'end');normalizeFeedbackBullets(e.target);updateFeedbackSave()}});
    referenceFeedbackDialog.addEventListener('close',()=>{referenceFeedbackHistory=[]});
  }
  referenceFeedbackDialog.dataset.reference=id;
  referenceFeedbackDialog.dataset.sectionTitle=sectionTitle;
  referenceFeedbackDialog.innerHTML=`<div class="reference-feedback-top"><h2 id="reference-feedback-title">feedback &amp; change recommendations</h2><button type="button" class="reference-feedback-close" data-feedback-close aria-label="Close feedback notes">${icon('X')}</button></div><p class="reference-feedback-context"><strong>${esc(sectionTitle)}</strong><br>Page ID: <strong>${esc(id)}</strong></p><label class="label" for="reference-feedback-notes">Change notes</label><textarea id="reference-feedback-notes" rows="7" aria-describedby="reference-feedback-hint" spellcheck="true"></textarea><p id="reference-feedback-hint" class="meta">Press Enter to start a new bullet point. Save note adds this entry to your session log.</p><div class="reference-feedback-actions"><button type="button" class="go-back-button" data-feedback-back>${icon('ChevronRight','back-arrow')}<span>Go Back</span></button><button type="button" class="primary" data-feedback-save>Save note</button></div><p class="meta reference-feedback-status" data-feedback-status role="status" aria-live="polite"></p><div class="feature-reference" aria-label="Reference ID">${referenceContent('M-FEEDBACK-'+id)}</div>${sessionEndControl()}`;
  const field=referenceFeedbackDialog.querySelector('textarea');field.value=value;normalizeFeedbackBullets(field);updateFeedbackSave();if(!referenceFeedbackDialog.open)referenceFeedbackDialog.showModal();field.focus();field.setSelectionRange(field.value.length,field.value.length);
}
function saveReferenceFeedback(){
  if(!appendSessionNote(referenceFeedbackDialog.dataset.reference,referenceFeedbackDialog.dataset.sectionTitle,referenceFeedbackDialog.querySelector('textarea').value))return;
  referenceFeedbackDialog.close();toast('Note saved to your prototype session.');
}
function endPrototypeSession(button){
  if(referenceFeedbackDialog?.open){for(const previous of referenceFeedbackHistory)appendSessionNote(previous.id,previous.title,previous.value);appendSessionNote(referenceFeedbackDialog.dataset.reference,referenceFeedbackDialog.dataset.sectionTitle,referenceFeedbackDialog.querySelector('textarea').value);referenceFeedbackDialog.querySelector('textarea').value='- ';referenceFeedbackHistory=[]}
  prototypeFeedbackSession.endedAt=prototypeFeedbackSession.endedAt||new Date().toISOString();persistPrototypeSession();
  const sections=new Map();for(const entry of prototypeFeedbackSession.entries){if(!sections.has(entry.id))sections.set(entry.id,{title:entry.title,notes:[]});sections.get(entry.id).notes.push(...entry.notes)}
  const markdown=`# Prototype session log\n\nfeedback & change recommendations\n\nSession started: ${prototypeFeedbackSession.startedAt}\nSession ended: ${prototypeFeedbackSession.endedAt}\n\n${sections.size?[...sections].map(([id,section])=>`## ${section.title}\n\nPage ID: ${id}\n\n${section.notes.map(note=>'- '+note).join('\n')}\n`).join('\n---\n\n'):'No notes were captured during this session.\n'}`;
  const url=URL.createObjectURL(new Blob([markdown],{type:'text/markdown;charset=utf-8'})),download=document.createElement('a');download.href=url;download.download='README-prototype-session-'+prototypeFeedbackSession.startedAt.replace(/[:.]/g,'-')+'.md';(button.closest('dialog')||document.body).appendChild(download);download.click();download.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  if(referenceFeedbackDialog?.open)referenceFeedbackDialog.close();toast('Session log downloaded. Your next saved note starts a new session.');
}
document.addEventListener('click',e=>{
  const button=e.target.closest('[data-copy-reference]');if(button){const title=feedbackSectionTitle(button);if(referenceFeedbackDialog?.open)referenceFeedbackHistory.push({id:referenceFeedbackDialog.dataset.reference,title:referenceFeedbackDialog.dataset.sectionTitle,value:referenceFeedbackDialog.querySelector('textarea').value});copyReference(button);showReferenceFeedback(button.dataset.copyReference,'- ',title);return}
  if(e.target.closest('[data-feedback-close]'))referenceFeedbackDialog.close();
  if(e.target.closest('[data-feedback-back]')){const previous=referenceFeedbackHistory.pop();if(previous)showReferenceFeedback(previous.id,previous.value,previous.title);else referenceFeedbackDialog.close()}
  if(e.target.closest('[data-feedback-save]'))saveReferenceFeedback();
  const end=e.target.closest('[data-prototype-session-end]');if(end)endPrototypeSession(end);
});
