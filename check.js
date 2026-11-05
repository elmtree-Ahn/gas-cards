#!/usr/bin/env node
// 기체 카드 앱 점검 : 헤드리스 크롬으로 index.html을 실제로 열어 마우스·터치로 눌러 봅니다.
// 실행 : node 인터랙티브/gas-cards/check.js   (설치할 것 없음. 크롬과 Node 22 이상이면 돼요)
const {spawn}=require('child_process'), fs=require('fs'), os=require('os'), path=require('path');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PAGE='file://'+encodeURI(path.join(__dirname,'index.html'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function open(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gas-check-'));
  const proc=spawn(CHROME,['--headless','--disable-gpu','--hide-scrollbars','--remote-debugging-port=0','--remote-allow-origins=*',`--user-data-dir=${dir}`,'--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore'});
  let port; for(let i=0;i<100&&!port;i++){ await sleep(100); try{ port=fs.readFileSync(path.join(dir,'DevToolsActivePort'),'utf8').split('\n')[0]; }catch(e){} }
  if(!port) throw new Error('크롬이 켜지지 않았어요');
  const targets=await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((r,j)=>{ ws.onopen=r; ws.onerror=j; });
  let id=0; const wait=new Map(), errors=[], consoleSeen=[];
  ws.onmessage=m=>{ const d=JSON.parse(m.data);
    if(d.id){ const w=wait.get(d.id); wait.delete(d.id); d.error?w.j(new Error(JSON.stringify(d.error))):w.r(d.result); }
    else if(d.method==='Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);
    else if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error') errors.push(d.params.args.map(a=>a.value??a.description).join(' '));
  };
  const send=(method,params={})=>new Promise((r,j)=>{ const i=++id; wait.set(i,{r,j}); ws.send(JSON.stringify({id:i,method,params})); });
  await send('Page.enable'); await send('Runtime.enable');
  const ev=async expr=>{ const o=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true}); if(o.exceptionDetails) throw new Error(expr+' : '+(o.exceptionDetails.exception?.description||o.exceptionDetails.text)); return o.result.value; };
  const until=async(expr,ms=15000)=>{ const t=Date.now(); while(Date.now()-t<ms){ if(await ev(expr)) return true; await sleep(25); } throw new Error('시간 초과 : '+expr); };
  const view=(w,h)=>send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
  const load=async(hash='',speed=1)=>{ if(speed>1&&!open.speedId){ open.speedId=(await send('Page.addScriptToEvaluateOnNewDocument',{source:`const __st=setTimeout;window.setTimeout=(f,t,...a)=>__st(f,(t||0)/${speed},...a);`})).identifier; }
    if(speed===1&&open.speedId){ await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:open.speedId}); open.speedId=null; }
    await send('Page.navigate',{url:'about:blank'}); await send('Page.navigate',{url:PAGE+hash}); await until(`document.readyState==='complete'&&typeof SCENES==='object'`); };
  const center=sel=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
  const mouse=(type,p,o={})=>send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:'left',buttons:type==='mouseReleased'?0:1,clickCount:1,...o});
  const click=async sel=>{ const p=await center(sel); await mouse('mouseMoved',p,{buttons:0,button:'none'}); await mouse('mousePressed',p); await mouse('mouseReleased',p); };
  const shot=async file=>{ const o=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(file,Buffer.from(o.data,'base64')); };
  const close=()=>{ proc.kill(); ws.close(); setTimeout(()=>fs.rmSync(dir,{recursive:true,force:true}),300); };
  return {send,ev,until,view,load,center,mouse,click,shot,close,errors};
}

async function main(){
  const b=await open(), {ev,until,view,load,click,center,mouse,send,errors}=b;
  let fails=0;
  const report=(ok,text)=>{ console.log((ok?'[통과] ':'[실패] ')+text); if(!ok) fails++; };
  const card=k=>`#hand .gc[data-k="${k}"]`;
  const resultOn=`document.querySelector('#result').classList.contains('on')`;
  const vis=sel=>`(e=>e&&!e.hidden&&e.offsetParent!==null)(document.querySelector('${sel}'))`;

  // 0. 글이 코드에 다시 적혀 있지 않은지 : data.js 글이 index.html에 있으면 안 돼요
  const src=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'), icons=fs.readFileSync(path.join(__dirname,'icons.js'),'utf8');
  await view(1280,800); await load('',8);
  const texts=await ev(`[...SITUATIONS,...BONUS].flatMap(s=>[s.title,s.ask,...Object.values(s.res).map(r=>r.msg)]).concat(OX.flatMap(o=>[o[0],o[2]])).concat(Object.values(CARDS).flatMap(c=>[c.trait,c.use,c.powerText,c.nick,c.power,c.air])).filter(Boolean)`);
  const copied=texts.filter(t=>t.length>=4&&src.includes(t));
  report(copied.length===0,`data.js 글 ${texts.length}개가 index.html에 다시 적혀 있지 않음`+(copied.length?' → '+copied.join(' / '):''));
  report(/<script src="data\.js"><\/script>\s*<script src="icons\.js"><\/script>/.test(src)&&(src.match(/<script src=/g)||[]).length===2,'스크립트는 data.js · icons.js 둘만 읽음');
  report(!/\d\s*학년/.test(src),'앱 안에 학년 표시 없음');
  report(await ev(`Object.keys(CARDS).every(k=>ICONS[k]&&ICONS[k].startsWith('<svg'))`)&&Object.keys(await ev(`ICONS`)).length===12,'아이콘 12종');

  // 1. 모든 fx에 처리 함수가 있는지
  const missing=await ev(`[...SITUATIONS,...BONUS].flatMap(s=>Object.values(s.res).filter(r=>typeof SCENES[s.id]?.fx[r.fx]!=='function').map(r=>s.id+':'+r.fx))`);
  const fxCount=await ev(`new Set([...SITUATIONS,...BONUS].flatMap(s=>Object.values(s.res).map(r=>s.id+':'+r.fx))).size`);
  report(missing.length===0,`상황별 fx ${fxCount}가지 모두 처리 함수 있음`+(missing.length?' → 없음: '+missing:''));
  const incomplete=await ev(`[[SITUATIONS,BASE],[BONUS,EXT]].flatMap(([L,H])=>L.filter(s=>!H.every(k=>s.res[k])||s.res[s.answer]?.grade!=='ok'||Object.values(s.res).filter(r=>r.grade==='ok').length!==1).map(s=>s.id))`);
  report(incomplete.length===0,'모든 상황에 모든 카드 결과가 있고 ok는 정답 하나뿐');

  // 2. 모든 상황 × 모든 카드를 진짜 마우스로 누르기
  const seen=new Set(); let combos=0, bad=[];
  for(const [tab,listName,handName] of [[0,'SITUATIONS','BASE'],[1,'BONUS','EXT']]){
    await ev(`showTab(${tab})`);
    const list=await ev(listName), hand=await ev(handName);
    for(let i=0;i<list.length;i++){
      const sit=list[i], order=[...hand.filter(k=>k!==sit.answer),sit.answer];
      if(await ev(`document.querySelector('#sitT').textContent`)!==sit.title) bad.push(sit.id+' 제목');
      for(const k of order){
        const r=sit.res[k]; const where=`${sit.id}×${k}`;
        await click(card(k));
        await until(`document.querySelector('#stage').dataset.fx===${JSON.stringify(r.fx)}`);
        if(!await ev(`document.getAnimations().length>0`)) bad.push(where+' 움직임 없음');
        await until(resultOn);
        seen.add(sit.id+':'+r.fx); combos++;
        if(await ev(`document.querySelector('#rmsg').textContent`)!==r.msg) bad.push(where+' 글이 다름');
        if(!await ev(`document.querySelector('#result').classList.contains(${JSON.stringify(r.grade)})`)) bad.push(where+' 등급 표시');
        const nextOn=await ev(vis('#next')), retryOn=await ev(vis('#retry'));
        if(nextOn!==(r.grade==='ok')||retryOn===(r.grade==='ok')) bad.push(`${where} 버튼 (grade=${r.grade}, 다음=${nextOn}, 다시=${retryOn})`);
        if(r.grade==='ok') await click('#next');
        else { await click('#retry'); if(!await ev(`document.querySelector(${JSON.stringify(card(k))}).classList.contains('played')`)) bad.push(where+' 흐리게 안 됨'); }
      }
    }
    await until(vis('#final'));
    if(await ev(`st[${tab}].stars`)!==0) bad.push(listName+' 별 수(모두 두 번째 이상이면 0)');
  }
  report(bad.length===0,`상황 × 카드 ${combos}조합 눌러 봄 : 글·등급·버튼·흐림 확인, ok일 때만 다음 버튼`+(bad.length?' → '+bad.join(' / '):''));
  report(seen.size===fxCount,`실제로 돌아간 fx ${seen.size}/${fxCount}가지`);

  // 낸 카드를 다시 낼 수 있는지 · 공유 버튼 알림
  await load('',8);
  await click(card('o2')); await until(resultOn); await click('#retry');
  await click(card('o2')); await until(resultOn);
  report(await ev(`document.querySelector('#rmsg').textContent===SITUATIONS[0].res.o2.msg`),'흐려진 카드도 다시 낼 수 있음');
  await ev(`delete Navigator.prototype.share`); await click('#share'); await until(`document.querySelector('#toast').classList.contains('on')`);
  report(await ev(`document.querySelector('#toast').textContent==='주소가 복사됐어요'`),'공유 버튼 → "주소가 복사됐어요" (공유 시트가 없는 브라우저)');

  // 3. 첫 시도 별 · 마지막 화면 · 처음으로
  await load('',8);
  const n=await ev('SITUATIONS.length');
  for(let i=0;i<n;i++){ const a=await ev(`SITUATIONS[${i}].answer`); await click(card(a)); await until(resultOn); await click('#next'); }
  await until(vis('#final'));
  const fin=await ev(`({t:document.querySelector('#final').innerText,dots:document.querySelectorAll('.dot.first').length,star:st[0].stars,done:tabs[0].classList.contains('done')})`);
  report(fin.star===n&&fin.dots===n&&fin.done&&fin.t.includes('다 찾았어요!')&&fin.t.includes('보너스'),`모두 첫 번에 맞히면 ★${fin.star}, 금빛 점 ${fin.dots}개, "다 찾았어요!" + 보너스 안내`);
  await click('#finGo'); report(await ev(`cur===1&&document.querySelector('#hand').children.length===EXT.length`),'안내 버튼 → 보너스 탭 카드 4장');
  await ev(`showTab(0)`); await click('#finRe');
  report(await ev(`st[0].i===0&&st[0].stars===0&&document.querySelector('#sitT').textContent===SITUATIONS[0].title`),'처음부터 다시 → 첫 상황 · 별 0');

  // 4. 끌어다 놓기 (마우스 · 터치), 장면 밖에 놓으면 안 냄, 도중에 탭을 바꿔도 결과가 새지 않음
  await load('',8);
  const dragTo=async(k,target)=>{ const a=await center(card(k)), t=target||await center('#stage');
    await mouse('mouseMoved',a,{buttons:0,button:'none'}); await mouse('mousePressed',a);
    for(let i=1;i<=6;i++) await mouse('mouseMoved',{x:a.x+(t.x-a.x)*i/6,y:a.y+(t.y-a.y)*i/6});
    await mouse('mouseReleased',t); };
  await dragTo('o2'); await until(`document.querySelector('#stage').dataset.fx==='bigger'`); await until(resultOn);
  report(true,'마우스로 끌어다 놓기 → 산소 카드 결과');
  await click('#retry');
  const beside=await center('footer'); await dragTo('h2',beside); await sleep(150);
  report(await ev(`!document.querySelector('#stage').dataset.fx&&!document.querySelector('.ghost')`),'장면 밖에 놓으면 카드를 내지 않음');
  await click(card('h2')); await sleep(30); await ev(`tabs[2].click()`); await sleep(1000);
  report(await ev(`!document.querySelector('#result').classList.contains('on')&&!busy`),'애니메이션 도중 탭을 바꿔도 결과가 뒤늦게 나오지 않음');

  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await load('',8);
  const touch=async(type,p)=>send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:p.x,y:p.y}]});
  const a=await center(card('he')); await touch('touchStart',a); await touch('touchEnd',a);
  await until(`document.querySelector('#stage').dataset.fx==='none'`); await until(resultOn);
  report(true,'터치로 누르기 → 헬륨 카드 결과');
  await click('#retry');
  const a2=await center(card('co2')), t2=await center('#stage'); await touch('touchStart',a2);
  for(let i=1;i<=6;i++) await touch('touchMove',{x:a2.x+(t2.x-a2.x)*i/6,y:a2.y+(t2.y-a2.y)*i/6});
  await touch('touchEnd',t2);
  await until(`document.querySelector('#stage').dataset.fx==='out'`); await until(resultOn);
  report(await ev(vis('#next')),'터치로 끌어다 놓기 → 이산화 탄소 정답 · 다음 버튼');
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});

  // 5. 도감 · OX · 음소거
  await load('',8); await ev(`showTab(2)`);
  const dex=await ev(`[...document.querySelectorAll('#dex .gc')].map(b=>b.dataset.k)`); let dexBad=[];
  for(const k of dex){ const c=await ev(`CARDS[${JSON.stringify(k)}]`);
    await click(`#dex .gc[data-k="${k}"]`); const t=await ev(`(b=>b.innerText+' '+[...b.querySelectorAll('img')].map(i=>i.alt).join(' '))(document.querySelector('#bigB'))`);
    if(c.art&&!fs.existsSync(path.join(__dirname,c.art))) dexBad.push(k+':그림 파일 없음');
    if(c.art&&!await ev(`!!document.querySelector('#bigB img')`)) dexBad.push(k+':그림 안 뜸');
    const barY=()=>ev(`document.querySelector('#bigX').getBoundingClientRect().y`), y0=await barY();
    await ev(`(i=>i?i.decode().catch(()=>{}):0)(document.querySelector('#bigB img'))`); if(Math.abs(await barY()-y0)>1) dexBad.push(k+':그림이 뜨며 닫기 버튼이 움직임');
    for(const v of [c.name,c.nick,c.air,c.trait,c.sym,c.power]) if(!t.includes(v)) dexBad.push(k+':'+v);
    const labels=await ev(`[...document.querySelectorAll('#bigB .fr b')].map(b=>b.textContent)`);
    if(c.use&&!t.includes(c.use)) dexBad.push(k+':사용'); if(!c.use&&labels.includes('사용')) dexBad.push(k+':빈 사용 줄');
    if(!c.powerText&&t.includes('—')) dexBad.push(k+':빈 설명'); if(!!c.ext!==t.includes('확장 카드')) dexBad.push(k+':확장 표시');
    await click('#bigX'); }
  report(dex.length===12&&dexBad.length===0,`도감 ${dex.length}장 눌러 크게 읽기 · 빈 줄 없음`+(dexBad.length?' → '+dexBad:''));
  await ev(`showTab(3)`); const ox=await ev('OX'); let oxBad=[];
  for(let i=0;i<ox.length;i++){ await click(`#ox .${ox[i][1]?'o':'x'}`); const f=await ev(`document.querySelector('#qfb').textContent`); if(!f.includes(ox[i][2])) oxBad.push(i); await click('#qnext'); }
  report(oxBad.length===0&&await ev(`score===OX.length&&document.querySelector('#q').textContent.includes(OX.length+'문제 중 '+OX.length)`),`OX ${ox.length}문제 전부 맞히기 · 피드백 · 점수`);
  await click('#qnext'); await click(`#ox .${ox[0][1]?'x':'o'}`);
  report(await ev(`score===0&&document.querySelector('#qfb').classList.contains('bad')&&document.querySelector('#qnext').offsetParent!==null`),'OX 틀린 답 피드백');
  await click('#mute'); report(await ev(`muted===true&&audio()===null`),'음소거 버튼'); await click('#mute');

  // 6. 화면 크기마다 가로 넘침 · 카드 잘림 없음 (가장 긴 글의 결과 화면까지)
  const noOverflow=`document.documentElement.scrollWidth<=innerWidth&&document.body.scrollWidth<=innerWidth`;
  const cardsFit=`[...document.querySelectorAll('#hand .gc')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&b.scrollWidth<=b.clientWidth+1&&b.querySelector('.nm').scrollWidth<=b.clientWidth+1})`;
  for(const [w,h] of [[1280,800],[1024,768],[390,844]]){
    await view(w,h); await load('',8); let msgs=[];
    for(const [t,name] of [[0,'상황'],[1,'보너스'],[2,'도감'],[3,'OX']]){
      await ev(`showTab(${t})`); await sleep(40);
      if(!await ev(noOverflow)) msgs.push(name+' 가로 넘침');
      if(t<2&&!await ev(cardsFit)) msgs.push(name+' 카드 잘림');
    }
    const [li,lk]=await ev(`SITUATIONS.flatMap((s,i)=>Object.keys(s.res).map(k=>[i,k,s.res[k].msg.length,s.res[k].grade])).filter(a=>a[3]==='ok').sort((a,b)=>b[2]-a[2])[0]`);
    await ev(`showTab(0);st[0].i=${li};st[0].tried.clear();render()`);
    await click(card(lk)); await until(resultOn); await sleep(40);
    const fit=await ev(`(()=>{const r=document.querySelector('#next').getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0})()`);
    if(!fit) msgs.push('긴 글 결과에서 다음 버튼이 화면 밖');
    if(!await ev(noOverflow)) msgs.push('결과 가로 넘침');
    report(msgs.length===0,`${w}×${h} : 가로 스크롤 없음 · 카드 다 보임 · 버튼 보임`+(msgs.length?' → '+msgs.join(' / '):''));
  }

  report(errors.length===0,`자바스크립트 오류 ${errors.length}건`+(errors.length?' → '+[...new Set(errors)].slice(0,5).join(' | '):''));
  b.close();
  console.log(fails?`\n실패 ${fails}건`:'\n모두 통과');
  process.exit(fails?1:0);
}
if(require.main===module) main().catch(e=>{ console.error('[중단] '+e.message); process.exit(1); });
module.exports={open};
