(function(){
var d=document,root=d.documentElement;
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
/* nav */
var nav=d.getElementById("nav"),bg=d.getElementById("burger"),links=d.getElementById("links");
if(nav){addEventListener("scroll",function(){nav.classList.toggle("solid",scrollY>24)},{passive:true});}
if(bg&&links){
bg.addEventListener("click",function(){var o=links.classList.toggle("open");bg.setAttribute("aria-expanded",o)});
links.addEventListener("click",function(e){if(e.target.closest("a")){links.classList.remove("open");bg.setAttribute("aria-expanded","false")}});
d.addEventListener("keydown",function(e){if(e.key==="Escape"){links.classList.remove("open");bg.setAttribute("aria-expanded","false")}});
}
/* reveal */
var rv=[].slice.call(d.querySelectorAll(".rv"));
if("IntersectionObserver" in window&&!reduce){
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:.08});
rv.forEach(function(el){io.observe(el)});
}else rv.forEach(function(el){el.classList.add("in")});
/* step sequencer: a wave that morphs between sine and square */
var seq=d.getElementById("seq");
if(seq){
var C=16,R=8,cells=[];
for(var r=0;r<R;r++)for(var c=0;c<C;c++){var i=d.createElement("i");seq.appendChild(i);cells.push(i)}
var step=0,t0=performance.now();
function shape(m){var out=[];for(var c=0;c<C;c++){var s=Math.sin(c/C*Math.PI*4+.4),q=s>=0?1:-1,v=s*(1-m)+q*m;out.push(Math.round((1-(v+1)/2)*(R-1)))}return out}
function paint(){
var m=reduce?.85:(Math.sin((performance.now()-t0)/2600)+1)/2,rows=shape(m);
for(var r=0;r<R;r++)for(var c=0;c<C;c++){var el=cells[r*C+c];el.className=(rows[c]===r?"on":"")+(c===step?" pl":"")}
}
paint();
if(!reduce){setInterval(function(){step=(step+1)%C;paint()},140)}
}
/* carousel */
var track=d.getElementById("track"),dots=d.getElementById("dots");
if(track&&dots){
var slides=[].slice.call(track.children);
var stp=function(){return slides[0].offsetWidth+20};
var cur=function(){return Math.round(track.scrollLeft/stp())};
var go=function(i){track.scrollTo({left:Math.max(0,Math.min(slides.length-1,i))*stp(),behavior:reduce?"auto":"smooth"})};
slides.forEach(function(s,i){var b=d.createElement("button");b.type="button";b.setAttribute("aria-label","Show sample "+(i+1));b.onclick=function(){go(i)};dots.appendChild(b)});
var mark=function(){[].slice.call(dots.children).forEach(function(b,i){b.setAttribute("aria-current",i===cur())})};
track.addEventListener("scroll",mark,{passive:true});mark();
d.getElementById("prev").onclick=function(){go(cur()-1)};
d.getElementById("next").onclick=function(){go(cur()+1)};
track.addEventListener("keydown",function(e){if(e.key==="ArrowRight"){e.preventDefault();go(cur()+1)}if(e.key==="ArrowLeft"){e.preventDefault();go(cur()-1)}});
}
/* plan buttons preselect the form */
[].slice.call(d.querySelectorAll("[data-plan]")).forEach(function(a){a.addEventListener("click",function(){var s=d.querySelector('select[name="package"]');if(s)s.value=a.getAttribute("data-plan")})});
/* forms */
var KEY="3e4a5492-6895-48c5-baa2-1a1f72392342",MAIL="contact@synthpage.co.uk";
[].slice.call(d.querySelectorAll("form[data-form]")).forEach(function(f){
f.addEventListener("submit",async function(e){
e.preventDefault();
var s=f.querySelector(".status");
if(!f.checkValidity()){f.reportValidity();return}
var fd=new FormData(f);
if(fd.get("website"))return;
fd.delete("website");
fd.append("access_key",KEY);
fd.append("from_name",fd.get("name")||"Website visitor");
s.className="status";s.textContent="Sending…";
try{
var r=await fetch("https://api.web3forms.com/submit",{method:"POST",body:fd,headers:{Accept:"application/json"}});
var j=await r.json();
if(!r.ok||!j.success)throw new Error();
f.reset();s.className="status ok";s.textContent="Thanks! We’ll be in touch soon.";
}catch(_){s.className="status";s.textContent="Sorry, that didn’t send. Please email "+MAIL+".";}
});
});
})();
