const assert=require('node:assert/strict'),crypto=require('node:crypto');
const {encrypt,page}=require('./build-locked.cjs');
(async()=>{
 const html='<html><body>Private test content</body></html>',password='test-only-password',p=encrypt(html,password);
 async function decrypt(pass){const material=await crypto.webcrypto.subtle.importKey('raw',Buffer.from(pass),'PBKDF2',false,['deriveKey']);const key=await crypto.webcrypto.subtle.deriveKey({name:'PBKDF2',salt:Buffer.from(p.salt,'base64'),iterations:p.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);return Buffer.from(await crypto.webcrypto.subtle.decrypt({name:'AES-GCM',iv:Buffer.from(p.iv,'base64')},key,Buffer.from(p.data,'base64'))).toString();}
 assert.equal(await decrypt(password),html);await assert.rejects(()=>decrypt('wrong-password'));
 assert.ok(!page(p).includes(html));assert.ok(!page(p).includes(password));
 new Function(page(p).split('<script>')[1].split('</script>')[0]);
 assert.notEqual(encrypt(html,password).data,p.data);
 console.log('PASS: browser-compatible encryption, correct/wrong passwords, randomized ciphertext and no plaintext app/password in wrapper.');
})().catch(e=>{console.error(e);process.exitCode=1;});
