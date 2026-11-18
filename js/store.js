/* NOVERSE STORE 1.09 — catálogo, fichas y microinteracciones */
(() => {
"use strict";
const $=s=>document.querySelector(s),screen=$("#store-screen"),detail=$("#store-detail");
if(!screen||!detail)return;
const grid=$("#store-grid"),featured=$("#store-featured"),categories=$("#store-categories"),search=$("#store-search"),content=$("#store-detail-content"),count=$("#store-result-count"),empty=$("#store-empty"),updatesPanel=$("#store-updates");
const apps=[
{id:"pulsar-rm",name:"Pulsar RM",subtitle:"Reproductor de Música",category:"Música",version:"1.05",size:"4.2 MB",developer:"ZioFabi",glyph:"♫",accent:"#5736c9",glow:"#a987ff",description:"Un reproductor de música moderno, ligero y totalmente personalizable. Disfruta de tu biblioteca local con una experiencia visual cuidada y controles a tu manera.",features:["Reproducción local","Mega personalización","Letras animadas","Interfaz inmersiva"],featured:true,whatsNew:"Nuevas animaciones para las letras y mejoras de experiencia.",screens:["Captura del reproductor","Tu biblioteca","Letras y controles"],assets:{banner:"Banner_PulsarRm_png",icon:"Icon_PulsarRm_png",screens:["Screenshot1_PulsarRm_png","Screenshot2_PulsarRm_png","Screenshot3_PulsarRm_png"],video:"Video_PulsarRm"}},
{id:"astralworld",name:"AstralWorld",subtitle:"Explora y crea tu universo",category:"Entretenimiento",version:"1.00",size:"APK · Android",developer:"ZioFabi",glyph:"◉",accent:"#8d4cc9",glow:"#d58aff",description:"Un espacio para descubrir videos, compartir contenido y explorar nuevas experiencias dentro del universo AstralWorld.",features:["Explorar contenido","Videos y Shorts","Perfiles personalizados","Importación múltiple de vídeos"],featured:true,whatsNew:"Primera versión Android: integración nativa, selector multimedia del sistema e importación de varios vídeos.",downloadUrl:"https://github.com/jhooni467/AstralWorld/releases/download/v1.00/app-debug.apk",screens:[],assets:{banner:"Banner_AstralWorld_png",icon:"Icon_AstralWorld_png",screens:[],video:"Video_AstralWorld"}}];
const cats=["Todo","Música","Entretenimiento","Juegos","Productividad"];
let active="Todo",query="",previousFocus=null;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function candidates(base,video){if(!base)return[];const exts=video?[".mp4",".webm",".mov"]:[".webp",".png",".jpg",".jpeg",".avif"];return exts.map(e=>"images/store/"+base+e).concat(exts.map(e=>"images/store/"+base.replace(/_png$/i,"")+e))}
const assetCache=new Map();
function probe(base,video){const key=(video?"video:":"image:")+base;if(assetCache.has(key))return assetCache.get(key);const task=new Promise(resolve=>{const list=candidates(base,video);let i=0;function next(){if(i>=list.length){resolve("");return}const url=list[i++];if(video){const v=document.createElement("video");v.preload="metadata";v.onloadedmetadata=()=>resolve(url);v.onerror=next;v.src=url}else{const im=new Image();im.decoding="async";im.onload=()=>resolve(url);im.onerror=next;im.src=url}}next()});assetCache.set(key,task);return task}
function img(url,alt,cls){return '<img class="'+cls+'" src="'+esc(url)+'" alt="'+esc(alt)+'">'}
function appCard(app){const el=document.createElement("article");el.className="store-app-card";el.tabIndex=0;el.setAttribute("role","button");el.setAttribute("aria-label","Ver "+app.name);el.style.setProperty("--app-accent",app.accent);el.style.setProperty("--app-glow",app.glow);el.innerHTML='<div class="store-app-art"><span class="store-app-glyph">'+esc(app.glyph)+'</span><span class="store-art-badge">APP</span></div><div class="store-card-copy"><div class="store-card-title"><h3>'+esc(app.name)+'</h3><span class="store-card-rating">✦ 4.9</span></div><p>'+esc(app.subtitle)+'</p><div class="store-app-meta"><span>'+esc(app.category)+'</span><span>v'+esc(app.version)+'</span></div></div>';probe(app.assets.icon,false).then(url=>{if(url&&el.isConnected){el.querySelector(".store-app-art").insertAdjacentHTML("afterbegin",img(url,app.name,"store-card-icon"))}});el.addEventListener("click",()=>openDetail(app));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(app)}});return el}
function render(){const list=apps.filter(a=>(active==="Todo"||a.category===active)&&[a.name,a.subtitle,a.category].join(" ").toLowerCase().includes(query));grid.replaceChildren();list.forEach(a=>grid.appendChild(appCard(a)));count.textContent=list.length+" "+(list.length===1?"aplicación":"aplicaciones");empty.hidden=list.length>0;featured.replaceChildren();const pick=apps.find(a=>a.featured);if(pick){const hero=document.createElement("article");hero.className="store-hero-card";hero.style.setProperty("--app-accent",pick.accent);hero.style.setProperty("--app-glow",pick.glow);hero.tabIndex=0;hero.setAttribute("role","button");hero.innerHTML='<div class="store-hero-copy"><small>DESTACADA DE LA SEMANA · '+esc(pick.category.toUpperCase())+'</small><h3>'+esc(pick.name)+'</h3><p>'+esc(pick.subtitle)+'</p><span class="store-hero-cta">Explorar aplicación <b>↗</b></span></div><span class="store-hero-art" aria-hidden="true">✦</span>';hero.addEventListener("click",()=>openDetail(pick));hero.addEventListener("keydown",e=>{if(e.key==="Enter")openDetail(pick)});featured.appendChild(hero);probe(pick.assets.banner,false).then(url=>{if(url&&hero.isConnected)hero.style.backgroundImage='linear-gradient(105deg,color-mix(in srgb,'+pick.accent+' 38%,#090711) 0%,#090711bd 54%,#09071130 100%),url("'+url+'")'});probe(pick.assets.icon,false).then(url=>{if(url&&hero.isConnected){const art=hero.querySelector(".store-hero-art");art.innerHTML=img(url,pick.name,"");art.classList.add("has-image")}})}categories.replaceChildren();cats.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="store-category"+(c===active?" active":"");b.textContent=c;b.setAttribute("aria-pressed",String(c===active));b.addEventListener("click",()=>{active=c;render()});categories.appendChild(b)})}
async function installApk(app,button){
 const native=window.NOVERSE?.Native;
 if(!native?.isNative||!native.startDownloadAndInstall||!native.getDownloadStatus){button.disabled=false;button.textContent="Instalación nativa no disponible · Reintentar";console.error("NOVERSE: puente nativo de Android no está disponible.");return;}
 if(button.dataset.busy==="yes")return;
 button.dataset.busy="yes";button.disabled=true;button.classList.add("is-installing");
 const label=button.querySelector?.(".store-install-label")||button;
 const track=button.querySelector?.(".store-install-track i");
 const progress=button.parentElement?.querySelector?.(".store-install-progress");
 const setLabel=value=>{label.textContent=value;};
 const setProgress=value=>{
  const pct=Math.max(0,Math.min(100,Math.round(Number(value)||0)));
  if(track)track.style.width=pct+"%";
  if(progress){progress.hidden=false;progress.querySelector("strong").textContent=pct+"%";}
  button.setAttribute("aria-valuenow",String(pct));
 };
 try{
  setLabel("Preparando descarga…");setProgress(0);
  const started=await native.startDownloadAndInstall({url:app.downloadUrl,fileName:(app.id||"app")+"-"+(app.version||"latest")+".apk"});
  if(started.status==="permission_required"){setLabel("Permite instalar apps y vuelve a tocar");button.disabled=false;button.dataset.busy="no";button.classList.remove("is-installing");if(progress)progress.hidden=true;return;}
  if(!started.downloadId)throw new Error("No se pudo iniciar la descarga.");
  setLabel("Descargando…");
  const id=started.downloadId,deadline=Date.now()+10*60*1000;
  while(Date.now()<deadline){
   await new Promise(resolve=>setTimeout(resolve,650));
   const state=await native.getDownloadStatus(id);
   if(Number.isFinite(Number(state.progress)))setProgress(state.progress);
   if(state.status==="downloading"||state.status==="pending"){setLabel("Descargando…");continue;}
   if(state.status==="paused"){setLabel("Descarga pausada…");continue;}
   if(state.status==="installer_opened"){setProgress(100);setLabel("Instalador de Android abierto");if(progress)progress.querySelector("span").textContent="Descarga completada";return;}
   if(state.status==="failed"||state.status==="missing"){const reasons={1:"Error de archivo o URL",2:"Error de conexión",3:"La descarga no está permitida",4:"No hay espacio suficiente",5:"La descarga ya no existe",6:"La descarga fue detenida"};throw new Error(state.reason?((reasons[state.reason]||"Error Android "+state.reason)+". Revisa la conexión e inténtalo otra vez."):"Android no pudo completar la descarga.");}
  }
  throw new Error("La descarga está tardando demasiado. Inténtalo de nuevo.");
 }catch(error){console.error("NOVERSE Store install:",error);const detail=String(error?.message||error||"Error desconocido").replace(/^Error:\s*/,"").slice(0,105);setLabel("Error: "+detail);button.classList.remove("is-installing");if(progress)progress.hidden=true;}
 finally{if(button.dataset.busy==="yes"&&button.textContent!=="Permite instalar apps y vuelve a tocar"){button.disabled=false;button.dataset.busy="no";}}
}
async function openDetail(app){
 previousFocus=document.activeElement;detail.hidden=false;detail.scrollTop=0;content.replaceChildren();document.body.style.overflow="hidden";
 const hero=document.createElement("div");hero.className="store-detail-hero";hero.style.setProperty("--app-accent",app.accent);hero.style.setProperty("--app-hero","radial-gradient(ellipse at 78% 22%,"+app.glow+"88,transparent 43%),linear-gradient(135deg,"+app.accent+",#090a18 72%)");
 const identity=document.createElement("div");identity.className="store-detail-identity";identity.innerHTML='<div class="store-app-icon">'+esc(app.glyph)+'</div><div class="store-app-heading"><span class="store-detail-kicker">APLICACIÓN DESTACADA</span><h1>'+esc(app.name)+'</h1><p>'+esc(app.subtitle)+'</p></div>';hero.appendChild(identity);content.appendChild(hero);
 const [icon,banner,video]=await Promise.all([probe(app.assets.icon,false),probe(app.assets.banner,false),probe(app.assets.video,true)]);
 if(!detail.contains(hero))return;
 if(icon&&detail.contains(identity))identity.querySelector(".store-app-icon").innerHTML=img(icon,app.name,"");
 if(banner&&detail.contains(hero)){hero.classList.add("has-banner");hero.style.backgroundImage="linear-gradient(105deg,color-mix(in srgb,"+app.accent+" 22%,#090711) 0%,#09071145 58%,#09071110 100%),url("+JSON.stringify(banner)+")";}
 if(video&&detail.contains(hero)){const v=document.createElement("video");v.src=video;v.autoplay=true;v.muted=true;v.loop=true;v.playsInline=true;hero.prepend(v);}
 const facts=document.createElement("div");facts.className="store-app-facts";facts.innerHTML='<div><small>DESARROLLADOR</small><strong>'+esc(app.developer)+'</strong></div><div><small>CATEGORÍA</small><strong>'+esc(app.category)+'</strong></div><div><small>VERSIÓN</small><strong>'+esc(app.version)+'</strong></div><div><small>TAMAÑO</small><strong>'+esc(app.size)+'</strong></div>';
 const installArea=document.createElement("div");installArea.className="store-install-area";
 const install=document.createElement("button");install.className="store-install";install.type="button";install.style.setProperty("--app-accent",app.accent);install.style.setProperty("--app-deep",app.deep||"#17102b");
 if(app.downloadUrl){install.innerHTML='<span class="store-install-label">↓  Instalar aplicación</span><span class="store-install-track" aria-hidden="true"><i></i></span>';install.setAttribute("aria-label","Instalar "+app.name);install.addEventListener("click",()=>installApk(app,install));}
 else{install.textContent="Próximamente";install.disabled=true;}
 const progress=document.createElement("div");progress.className="store-install-progress";progress.hidden=true;progress.innerHTML='<span>Descargando aplicación</span><strong>0%</strong>';installArea.append(install,progress);
 const gallery=document.createElement("div");gallery.className="store-gallery";const galleryUrls=await Promise.all(app.assets.screens.map(base=>probe(base,false)));if(!detail.contains(hero))return;
 galleryUrls.forEach((url,i)=>{if(url){const fig=document.createElement("figure");fig.innerHTML=img(url,app.name+" captura "+(i+1),"")+"<figcaption>"+esc(app.screens[i]||"Vista de la aplicación")+"</figcaption>";gallery.appendChild(fig);}});
 const about=document.createElement("section");about.className="store-detail-section";about.innerHTML='<h2>Acerca de esta aplicación</h2><p class="store-description">'+esc(app.description)+'</p>';
 const features=document.createElement("section");features.className="store-detail-section";features.innerHTML='<h2>Lo que encontrarás</h2><div class="store-feature-pills">'+app.features.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div>';
 const news=document.createElement("section");news.className="store-detail-section store-whats-new";news.innerHTML='<small>NOVEDADES · v'+esc(app.version)+'</small><p>'+esc(app.whatsNew)+'</p>';
 const close=document.createElement("button");close.type="button";close.className="store-detail-close";close.textContent="Volver a Noverse Store";close.addEventListener("click",closeDetail);
 content.append(facts,installArea);if(gallery.childElementCount)content.append(gallery);content.append(about,features,news,close);detail.scrollTop=0;$("#store-detail-back").focus({preventScroll:true});
}
function setPendingUpdates(items=[]){
 const navButton=document.querySelector('[data-tab="store"]');
 if(navButton)navButton.classList.toggle("has-updates",items.length>0);
 if(!updatesPanel)return;
 updatesPanel.hidden=!items.length;
 updatesPanel.replaceChildren();
 if(!items.length)return;
 const heading=document.createElement("div");heading.className="store-updates-heading";
 heading.innerHTML='<span>NOVERSE UPDATE CENTER</span><h2>Actualizaciones disponibles</h2><p>Hay nuevas versiones para tus aplicaciones instaladas.</p>';
 const list=document.createElement("div");list.className="store-updates-list";
 items.forEach(item=>{
  const card=document.createElement("article");card.className="store-update-card";
  const copy=document.createElement("div");copy.className="store-update-copy";
  const eyebrow=document.createElement("small");eyebrow.textContent="ACTUALIZACIÓN DISPONIBLE";
  const title=document.createElement("h3");title.textContent=item.name;
  const versions=document.createElement("p");versions.textContent="v"+item.installedVersion+" → v"+item.latestVersion;
  const summary=document.createElement("p");summary.textContent=item.summary||"Hay una nueva versión disponible.";
  copy.append(eyebrow,title,versions,summary);
  const link=document.createElement("button");link.type="button";link.className="store-update-action";link.textContent="Actualizar";link.addEventListener("click",()=>installApk(item,link));card.append(copy,link);list.appendChild(card);
 });
 updatesPanel.append(heading,list);
}
function closeDetail(restoreFocus=true){detail.hidden=true;document.body.style.overflow="";if(restoreFocus&&previousFocus&&previousFocus.focus)previousFocus.focus({preventScroll:true})}
$("#store-detail-back").addEventListener("click",closeDetail);$("#store-detail-more").addEventListener("click",()=>{const name=content.querySelector("h1")?.textContent||"Aplicación";if(navigator.share)navigator.share({title:name,text:"Descubre "+name+" en Noverse"}).catch(()=>{});else window.alert(name+" · Noverse Store")});search.addEventListener("input",()=>{query=search.value.trim().toLowerCase();render()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!detail.hidden)closeDetail();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"&&!screen.hidden){e.preventDefault();search.focus()}});window.NOVERSE=window.NOVERSE||{};window.NOVERSE.Store=Object.freeze({openApp:id=>{const app=apps.find(a=>a.id===id);if(app)openDetail(app)},closeDetail:()=>closeDetail(false),isDetailOpen:()=>!detail.hidden,refresh:render,setPendingUpdates});render();
})();