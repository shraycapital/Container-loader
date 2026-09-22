// Publish only the encrypted wrapper. Never write the password to an artifact.
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
function encrypt(html,password){
 const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12),iterations=600000;
 const key=crypto.pbkdf2Sync(password,salt,iterations,32,'sha256');
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
 const data=Buffer.concat([cipher.update(html,'utf8'),cipher.final(),cipher.getAuthTag()]);
 return {salt:salt.toString('base64'),iv:iv.toString('base64'),data:data.toString('base64'),iterations};
}
function page(payload){return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>DrumFit · Unlock</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f6f3;color:#172c33;font:16px/1.5 system-ui,sans-serif;padding:24px}main{width:100%;max-width:420px;background:white;padding:36px;border:1px solid #dce4e2;border-radius:18px}h1{margin:0;color:#173e3b;font-size:30px}p{color:#63777d}label{display:block;font-size:14px}input,button{font:inherit;width:100%;padding:12px;margin-top:8px;border:1px solid #ccd8d4;border-radius:8px}button{background:#16715c;color:white;font-weight:600;border:0;cursor:pointer;margin-top:18px}button:disabled{opacity:.6}input:focus{outline:2px solid #8dc6ad}#status{min-height:24px;font-size:14px;color:#a83828}small{color:#63777d}</style></head><body><main><h1>DrumFit</h1><p>Enter your password to open the planner.</p><form id="unlock"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" required autofocus><button id="submit" type="submit">Unlock planner</button><p id="status" role="status" aria-live="polite"></p></form><small>Refreshing the page locks the planner again.</small><noscript><p>JavaScript is required to unlock the planner.</p></noscript></main>
<script>
const payload=${JSON.stringify(payload)};
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
document.getElementById('unlock').addEventListener('submit',async event=>{
 event.preventDefault();const button=document.getElementById('submit'),input=document.getElementById('password'),status=document.getElementById('status');button.disabled=true;status.textContent='Unlocking…';
 try{
  if(!crypto.subtle)throw new Error('unsupported');
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(input.value),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(payload.salt),iterations:payload.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.iv)},key,bytes(payload.data));
  input.value='';const html=new TextDecoder().decode(data);document.open();document.write(html);document.close();
 }catch(error){status.textContent=error.message==='unsupported'?'Open this page in a modern browser over HTTPS.':'Incorrect password. Please try again.';input.value='';input.focus();button.disabled=false;}
});
</script></body></html>`;}
if(require.main===module){
 const password=process.env.DRUMFIT_SITE_PASSWORD;if(!password)throw Error('DRUMFIT_SITE_PASSWORD must be set; refusing to publish an unlocked app.');
 const out=path.join(__dirname,'_site');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),page(encrypt(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),password)));
 console.log('Built encrypted website.');
}
module.exports={encrypt,page};
