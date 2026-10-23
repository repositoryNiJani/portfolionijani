(function(){
var solo=document.getElementById('solo'),heroToggle=document.getElementById('hero-toggle'),hero=document.getElementById('top'),tip=document.getElementById('tip'),cards=[].slice.call(document.querySelectorAll('.pc'));
var names=['About','Projects','Skills','Education','Contact'],stage=0;
function label(){
cards.forEach(function(c,i){
var f=c.classList.contains('flipped');
c.tabIndex=stage===0?-1:0;
c.setAttribute('aria-label',f?'Go to '+names[i]:'Turn over card '+(i+1));
c.setAttribute('aria-hidden',stage===0?'true':'false');
});
solo.tabIndex=stage===0?0:-1;solo.setAttribute('aria-hidden',stage===0?'false':'true');
heroToggle.setAttribute('aria-label',stage===0?'Open the portfolio cards':'Return the cards to their starting position');
}
function set(s){
stage=s;hero.className='hero s'+s;layout();
tip.textContent=s===0?'Tap the card to begin.':(cards.some(function(c){return c.classList.contains('flipped')})?'Tap a turned card to jump to that section.':'Tap a card to turn it over.');
label();
}
function toggleHero(){set(stage===0?1:0)}
solo.addEventListener('click',function(){if(stage===0)set(1)});
heroToggle.addEventListener('click',toggleHero);
cards.forEach(function(c){
c.addEventListener('click',function(e){
if(stage===0){e.preventDefault();return}
if(!c.classList.contains('flipped')){e.preventDefault();c.classList.add('flipped');set(1)}
});
});
function layout(){
var W=hero.clientWidth,H=hero.clientHeight,deck=document.getElementById('deck');
var phone=W<700,g=phone?10:Math.max(8,Math.min(20,W*.014)),w,ch,xs,ys;
if(phone){
w=Math.max(64,Math.min(104,(W-32-2*g)/3,(H-282-g)/2*.6));ch=w*5/3;
xs=[-1,0,1,-.5,.5].map(function(m){return m*(w+g)});
ys=[-(ch+g),-(ch+g),-(ch+g),0,0];
}else{
ch=Math.max(150,Math.min(383,(H-282)/1.15));w=Math.min(ch*.6,(W-32-4*g)/5);ch=w*5/3;
xs=[-2,-1,0,1,2].map(function(m){return m*(w+g)});ys=[0,0,0,0,0];
}
hero.style.setProperty('--w',w+'px');hero.style.setProperty('--g',g+'px');hero.style.setProperty('--h',ch+'px');
deck.style.bottom=(phone?96:46)+'px';
var sw=phone?Math.min(150,W*.4):Math.min(230,Math.max(w,170)),sh=sw*5/3,V=.42*sh;
solo.style.width=sw+'px';solo.style.marginLeft=(-sw/2)+'px';solo.style.bottom=(-(sh-V))+'px';
tip.style.bottom=(stage===0?V+30:(phone?66:14))+'px';
cards.forEach(function(c,i){c.style.setProperty('--x',xs[i]+'px');c.style.setProperty('--y',ys[i]+'px')});
}
window.addEventListener('resize',layout);
set(0);
var gu=document.getElementById('gu');
if('IntersectionObserver' in window){
new IntersectionObserver(function(en){gu.classList.toggle('on',!en[0].isIntersecting)},{threshold:.1}).observe(hero);
}
function eq(){
var s=[].slice.call(document.querySelectorAll('.sk'));
s.forEach(function(e){e.style.minHeight='0'});
if(window.innerWidth<=760)return;
var m=Math.max.apply(null,s.map(function(e){return e.offsetHeight}));
s.forEach(function(e){e.style.minHeight=m+'px'});
}
eq();window.addEventListener('resize',eq);window.addEventListener('load',eq);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(eq);
var track=document.getElementById('track'),skills=document.getElementById('skills');
if(track){
var orig=[].slice.call(track.children);
for(var r=0;r<2;r++)orig.forEach(function(n){var c=n.cloneNode(true);c.setAttribute('aria-hidden','true');track.appendChild(c)});
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var car=function(){
if(reduce)return;
var W=orig.length*(orig[0].offsetWidth+22);
var off=-skills.getBoundingClientRect().top*.8;
off=((off%W)+W)%W;
track.style.transform='translate3d('+(-off)+'px,0,0)';
};
window.addEventListener('scroll',car,{passive:true});window.addEventListener('resize',car);car();
}
var deck=document.getElementById('fdeck'),cs=[].slice.call(deck.querySelectorAll('.fcard')),order=cs.map(function(_,i){return i}),sel=null;
var panel=document.getElementById('panel'),ph=document.getElementById('ph'),pc=document.getElementById('pc'),prn=document.getElementById('prn'),pt=document.getElementById('pt'),pd=document.getElementById('pd'),pl=document.getElementById('pl');
function place(){order.forEach(function(ci,p){var c=cs[ci];c.style.setProperty('--p',p);c.style.zIndex=10-p;c.tabIndex=p===0?0:-1})}
function show(){
cs.forEach(function(c,i){c.classList.toggle('picked',i===sel)});
if(sel===null){panel.classList.remove('on');ph.hidden=false;pc.hidden=true;return}
var c=cs[sel];prn.textContent=c.dataset.n;pt.textContent=c.dataset.t;pd.textContent=c.dataset.d;
pl.innerHTML=c.querySelector('.skl').innerHTML;
[].forEach.call(pl.children,function(el,i){el.style.setProperty('--i',i)});
panel.classList.add('on');ph.hidden=true;pc.hidden=false;
}
function follow(){if(sel!==null)sel=order[0];show()}
function pick(ci){sel=ci;show();if(window.innerWidth<=900){var r=panel.getBoundingClientRect();if(r.top>window.innerHeight*.55)panel.scrollIntoView({behavior:"smooth",block:"start"})}}
function toTop(ci){while(order[0]!==ci)order.push(order.shift());place();pick(ci)}
function next(dir){
var c=cs[order[0]];dir=dir||-1;
c.style.transition='transform .35s ease,opacity .35s';
c.style.transform='translate('+dir*420+'px,-20px) rotate('+dir*24+'deg)';c.style.opacity='0';
setTimeout(function(){
order.push(order.shift());
c.style.transition='none';c.style.transform='';c.style.opacity='';place();
void c.offsetWidth;c.style.transition='';follow();
},330);
}
function prev(){order.unshift(order.pop());place();follow()}
function rnd(a,b){return a+Math.random()*(b-a)}
function shuffle(){
cs.forEach(function(c){c.style.transition='transform .35s ease';c.style.transform='translate('+rnd(-90,90)+'px,'+rnd(-30,30)+'px) rotate('+rnd(-22,22)+'deg)'});
setTimeout(function(){
var o=order.slice();
do{for(var i=o.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=o[i];o[i]=o[j];o[j]=t}}while(o[0]===order[0]);
order=o;cs.forEach(function(c){c.style.transition='';c.style.transform=''});place();follow();
},380);
}
cs.forEach(function(c,ci){
var sx=0,dx=0,drag=false,moved=false;
c.addEventListener('pointerdown',function(e){
if(order[0]!==ci)return;
sx=e.clientX;dx=0;drag=true;moved=false;
try{c.setPointerCapture(e.pointerId)}catch(x){}
c.style.transition='none';
});
c.addEventListener('pointermove',function(e){
if(!drag)return;
dx=e.clientX-sx;if(Math.abs(dx)>6)moved=true;
c.style.transform='translate('+dx+'px,0) rotate('+(dx/18)+'deg)';
});
c.addEventListener('pointerup',function(){
if(!drag)return;
drag=false;c.style.transition='';c._skip=true;
if(Math.abs(dx)>70){next(dx>0?1:-1)}
else{c.style.transform='';if(!moved)pick(ci)}
});
c.addEventListener('pointercancel',function(){if(drag){drag=false;c.style.transition='';c.style.transform=''}});
c.addEventListener('click',function(){
if(c._skip){c._skip=false;return}
if(order[0]!==ci)toTop(ci);else pick(ci);
});
c.addEventListener('keydown',function(e){
if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(ci)}
else if(e.key==='ArrowRight'){e.preventDefault();next(-1)}
else if(e.key==='ArrowLeft'){e.preventDefault();prev()}
});
});
document.getElementById('dnext').onclick=function(){next(-1)};
document.getElementById('dprev').onclick=prev;
document.getElementById('dshuf').onclick=shuffle;
function eqPanel(){
var was=sel;panel.style.height='';
panel.classList.add('on');ph.hidden=true;pc.hidden=false;
var max=0;
cs.forEach(function(c){prn.textContent=c.dataset.n;pt.textContent=c.dataset.t;pd.textContent=c.dataset.d;pl.innerHTML=c.querySelector('.skl').innerHTML;max=Math.max(max,panel.offsetHeight)});
panel.style.height=max+'px';sel=was;show();
}
place();show();eqPanel();
window.addEventListener('resize',eqPanel);window.addEventListener('load',eqPanel);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(eqPanel);
document.querySelectorAll('.cp').forEach(function(b){
b.addEventListener('click',function(){
var t=b.dataset.copy,done=function(){b.textContent='Copied!';setTimeout(function(){b.textContent='Copy'},1600)};
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){fb(t,done)})}else fb(t,done);
});
});
function fb(t,done){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(a);done()}
var noMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!noMotion)document.querySelectorAll('.so').forEach(function(a){
a.addEventListener('pointermove',function(e){var r=a.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;a.style.transform='perspective(600px) rotateX('+(-y*12)+'deg) rotateY('+(x*14)+'deg) translateY(-4px)'});
a.addEventListener('pointerleave',function(){a.style.transform=''});
});
var cf=document.getElementById('cform'),cfn=document.getElementById('cfn');
cf.addEventListener('submit',function(e){
e.preventDefault();
var n=document.getElementById('cn').value.trim(),m=document.getElementById('cm').value.trim();
if(!m){cfn.className='cfn err';cfn.textContent='Please write a message first.';return}
var url='mailto:xdjohnnysumulong12@gmail.com?subject='+encodeURIComponent('Portfolio message'+(n?' from '+n:''))+'&body='+encodeURIComponent(m+(n?'\n\n'+n:''));
var a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();document.body.removeChild(a);
cfn.className='cfn';cfn.textContent='Opening your email app… if nothing opens, email me at xdjohnnysumulong12@gmail.com.';
});
var tb=[].slice.call(document.querySelectorAll('.themes button'));
function theme(t,save){
if(t==='blue')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);
tb.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.t===t)});
if(save){try{localStorage.setItem('jani-theme',t)}catch(e){}}
}
tb.forEach(function(b){b.addEventListener('click',function(){theme(b.dataset.t,true)})});
theme(document.documentElement.getAttribute('data-theme')||'blue',false);
var projectModal=document.getElementById('project-modal'),projectTitle=document.getElementById('project-modal-title'),projectMeta=document.getElementById('project-modal-meta'),projectDetails=document.getElementById('project-modal-details'),projectTags=document.getElementById('project-modal-tags');
document.getElementById('project-modal-close').setAttribute('autofocus','');
function openProject(article){
projectTitle.textContent=article.querySelector('h3').textContent;
projectMeta.textContent=article.querySelector('.meta').textContent;
projectDetails.replaceChildren(article.querySelector('ul').cloneNode(true));
projectTags.replaceChildren.apply(projectTags,[].slice.call(article.querySelector('.tg').children).map(function(tag){return tag.cloneNode(true)}));
projectModal.showModal();
document.getElementById('project-modal-close').focus();
}
document.querySelectorAll('#projects .sk').forEach(function(article){
article.addEventListener('click',function(){openProject(article)});
article.addEventListener('keydown',function(e){
if(e.key==='Enter'||e.key===' '){e.preventDefault();openProject(article)}
});
});
document.getElementById('project-modal-close').addEventListener('click',function(){projectModal.close()});
projectModal.addEventListener('click',function(e){if(e.target===projectModal)projectModal.close()});
var educationModal=document.getElementById('education-modal'),educationTitle=document.getElementById('education-modal-title'),educationMeta=document.getElementById('education-modal-meta'),educationDate=document.getElementById('education-modal-date');
function openEducation(card){
educationTitle.textContent=card.querySelector('h3').textContent;
educationMeta.textContent=card.querySelector('p').textContent;
educationDate.textContent=card.querySelector('.when').textContent;
educationModal.showModal();
document.getElementById('education-modal-close').focus();
}
document.querySelectorAll('#education .edu').forEach(function(card){
card.addEventListener('click',function(){openEducation(card)});
card.addEventListener('keydown',function(e){
if(e.key==='Enter'||e.key===' '){e.preventDefault();openEducation(card)}
});
});
document.getElementById('education-modal-close').addEventListener('click',function(){educationModal.close()});
educationModal.addEventListener('click',function(e){if(e.target===educationModal)educationModal.close()});
var mobileToggle=document.getElementById('mobile-menu-toggle'),mobileMenu=document.getElementById('mobile-menu');
function closeMobileMenu(){
mobileMenu.hidden=true;mobileToggle.setAttribute('aria-expanded','false');mobileToggle.setAttribute('aria-label','Open navigation menu');
}
mobileToggle.addEventListener('click',function(){
var opening=mobileMenu.hidden;
mobileMenu.hidden=!opening;mobileToggle.setAttribute('aria-expanded',opening?'true':'false');mobileToggle.setAttribute('aria-label',opening?'Close navigation menu':'Open navigation menu');
});
mobileMenu.querySelectorAll('a').forEach(function(link){link.addEventListener('click',closeMobileMenu)});
document.addEventListener('click',function(e){
if(!mobileMenu.hidden&&!mobileMenu.contains(e.target)&&!mobileToggle.contains(e.target))closeMobileMenu();
});
document.addEventListener('keydown',function(e){
if(e.key!=='Escape')return;
if(projectModal.open){e.preventDefault();projectModal.close()}
if(educationModal.open){e.preventDefault();educationModal.close()}
if(!mobileMenu.hidden)closeMobileMenu();
});
var topnav=document.getElementById('topnav'),lastY=window.scrollY,links=[].slice.call(topnav.querySelectorAll('.nl a'));
window.addEventListener('scroll',function(){
var y=window.scrollY;
if(y<hero.offsetHeight*.6)topnav.classList.remove('show');
else if(y<lastY-4)topnav.classList.add('show');
else if(y>lastY+4)topnav.classList.remove('show');
lastY=y;
var cur='';links.forEach(function(a){var t=document.querySelector(a.getAttribute('href'));if(t&&t.getBoundingClientRect().top<=160)cur=a.getAttribute('href')});
links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')===cur)});
},{passive:true});
})();