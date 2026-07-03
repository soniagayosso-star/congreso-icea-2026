let DATA = null;
let view = 'inicio';
let filters = { day: 'all', mesa: 'all', modalidad: 'all', q: '' };
let searchTimer = null;
let countdownTimer = null;
const AGENDA_KEY = 'icea_congreso_agenda_2026';
const $ = (s) => document.querySelector(s);
const app = $('#app');

fetch('data/programa.json').then(r=>r.json()).then(d=>{ DATA=d; init(); }).catch(()=>{ app.innerHTML='<div class="empty">No se pudo cargar data/programa.json</div>'; });

function init(){
  document.querySelectorAll('.nav-link').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.view)));
  $('#globalSearch').addEventListener('input', e=>{ filters.q=e.target.value; if(view==='inicio') go('programa'); else render(); });
  $('#menuBtn').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#overlay').classList.add('show')});
  $('#overlay').addEventListener('click',()=>{$('#sidebar').classList.remove('open');$('#overlay').classList.remove('show')});
  updateAgendaCount();
  render();
}
function go(v){ view=v; document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===v)); $('#sidebar').classList.remove('open');$('#overlay').classList.remove('show'); render(); window.scrollTo({top:0,behavior:'smooth'}); }
function render(){
  if(!DATA) return;
  const active=document.activeElement;
  const keep=active && active.dataset && active.dataset.keepFocus==='1' ? {id:active.id, start:active.selectionStart, end:active.selectionEnd} : null;
  ({inicio:renderInicio, programa:renderPrograma, agenda:renderAgenda, eventos:renderEventos, carteles:renderCarteles, constancias:renderConstancias, info:renderInfo}[view]||renderInicio)();
  updateCountdown();
  if(keep && keep.id){
    requestAnimationFrame(()=>{
      const el=document.getElementById(keep.id);
      if(el){ el.focus(); try{ el.setSelectionRange(keep.start,keep.end); }catch(e){} }
    });
  }
}
function delayedRender(){ clearTimeout(searchTimer); searchTimer=setTimeout(()=>render(),320); }
function countdownParts(){ const target=new Date(DATA.evento.fechaInicio+'T09:00:00'); const now=new Date(); let diff=Math.max(0,target-now); const days=Math.floor(diff/86400000); diff-=days*86400000; const hours=Math.floor(diff/3600000); diff-=hours*3600000; const minutes=Math.floor(diff/60000); diff-=minutes*60000; const seconds=Math.floor(diff/1000); return {days,hours,minutes,seconds}; }
function updateCountdown(){ const box=$('#countdownLive'); if(!box||!DATA) return; const c=countdownParts(); box.innerHTML=`<div class="count-unit"><b>${c.days}</b><span>días</span></div><div class="count-unit"><b>${String(c.hours).padStart(2,'0')}</b><span>horas</span></div><div class="count-unit"><b>${String(c.minutes).padStart(2,'0')}</b><span>min</span></div><div class="count-unit"><b>${String(c.seconds).padStart(2,'0')}</b><span>seg</span></div>`; if(!countdownTimer){ countdownTimer=setInterval(updateCountdown,1000); } }
function mesaClass(mesa){ const n=(mesa||'').match(/\d+/)?.[0] || '0'; return `mesa-${n}`; }
function daysLeft(){ return countdownParts().days; }
function getAgenda(){ return JSON.parse(localStorage.getItem(AGENDA_KEY)||'[]'); }
function setAgenda(arr){ localStorage.setItem(AGENDA_KEY,JSON.stringify(arr)); updateAgendaCount(); }
function updateAgendaCount(){ const n=getAgenda().length; const el=$('#agendaCount'); if(el) el.textContent=n?n:''; }
function saved(code){ return getAgenda().includes(code); }
function toggleSave(code){ let a=getAgenda(); a=a.includes(code)?a.filter(x=>x!==code):[...a,code]; setAgenda(a); render(); }
function matches(t,q){ q=(q||'').toLowerCase().trim(); if(!q) return true; return [t.codigo,t.titulo,t.presenta,t.institucion,t.mesa,t.modalidad,t.tipo,(t.autores||[]).join(' '),(t.palabrasClave||[]).join(' ')].join(' ').toLowerCase().includes(q); }
function filteredWorks(onlyType){
  let q=filters.q || ($('#programSearch')?.value || '');
  return DATA.trabajos.filter(t=>{
    if(onlyType && t.tipo!==onlyType) return false;
    if(filters.day!=='all' && String(t.dia)!==String(filters.day)) return false;
    if(filters.mesa!=='all' && t.mesa!==filters.mesa) return false;
    if(filters.modalidad!=='all' && t.modalidad!==filters.modalidad) return false;
    return matches(t,q);
  });
}
function renderInicio(){
  app.innerHTML = `<div class="layout"><div>
    <section class="hero hero-building">
      <div class="hero-content-card">
        <div class="kicker">Sitio oficial del programa</div>
        <h1>11° Congreso Internacional ICEA 2026</h1>
        <p>Programa académico, eventos destacados, carteles y constancias en una sola plataforma.</p>
        <div id="countdownLive" class="countdown-live"></div>
        <div class="hero-actions"><button class="btn primary" onclick="go('programa')">Ver programa</button><button class="btn ghost" onclick="go('agenda')">Mi agenda</button><button class="btn ghost" onclick="go('constancias')">Constancias</button></div>
      </div>
    </section>
    <section class="stats">
      <div class="stat"><b>${daysLeft()}</b><span>días restantes</span></div>
      <div class="stat"><b>${DATA.evento.totales.trabajos}</b><span>trabajos</span></div>
      <div class="stat"><b>${DATA.evento.totales.mesas}</b><span>mesas</span></div>
      <div class="stat"><b>${DATA.evento.totales.ponencias}</b><span>ponencias</span></div>
      <div class="stat"><b>${DATA.evento.totales.carteles}</b><span>carteles</span></div>
    </section>
    ${mesaExplorer()}
    <div class="section-kicker">Agenda de hoy</div><h2 class="section-title">Actividad del Congreso</h2><p class="section-lead">Una vista breve para orientar a asistentes. El programa completo se consulta por día desde la sección Programa.</p>
    <div class="today-card">${todayRows()}</div>
  </div><aside class="side-col">${smartAssistantCard()}${noticesCard()}${constanciaMini()}${cartelesMini()}</aside></div>`;
}
function mesaExplorer(){
  const colors=['#7a001f','#174f86','#0f7f78','#c8102e','#a76400'];
  return `<section class="mesa-explorer"><div><div class="section-kicker">Explorador académico</div><h2>Mesas temáticas</h2><p>Identifica rápidamente el eje de cada actividad por color.</p></div><div class="mesa-strip">${DATA.mesas.map((m,i)=>`<button style="--m:${colors[i%colors.length]}" onclick="filters.mesa='${m.codigo}';go('programa')"><b>${m.codigo}</b><span>${m.nombre}</span><em>${m.total||''} trabajos</em></button>`).join('')}</div></section>`;
}
function smartAssistantCard(){
  return `<div class="side-card assistant-card"><h3>Modo asistente</h3><p>Busca tu ponencia, agrégala a Mi Agenda y consulta tus pendientes del día desde el mismo sitio.</p><button class="btn primary" onclick="go('programa')">Empezar recorrido →</button></div>`;
}
function todayRows(){
  const rows=[
    ['10:00','Ceremonia de inauguración','Auditorio / Plenaria'],
    ['10:45','Conferencia Magistral','Auditorio ICEA'],
    ['12:00','Mesas temáticas','Salas simultáneas'],
    ['16:30','Presentación de carteles','Galería ICEA']
  ];
  return rows.map(r=>`<div class="agenda-row"><time>${r[0]}</time><div><b>${r[1]}</b><span>${r[2]}</span></div><button class="small-btn" onclick="go('programa')">Ver</button></div>`).join('');
}
function noticesCard(){return `<div class="side-card"><h3>Avisos importantes</h3>
  <div class="notice"><i>!</i><div><b>Bienvenidos al 11° Congreso</b><p>Te esperamos los días 23, 24 y 25 de septiembre en el ICEA.</p></div></div>
  <div class="notice"><i>◷</i><div><b>Registro y acreditación</b><p>El registro abre a las 8:30 el primer día en el vestíbulo principal.</p></div></div>
  <div class="notice"><i>▣</i><div><b>Modalidad híbrida</b><p>Hay sesiones presenciales y virtuales cada día. Revisa tu horario en Programa.</p></div></div>
</div>`}
function constanciaMini(){return `<div class="side-card"><h3>Descarga tu constancia</h3><div class="mini-search"><input placeholder="Nombre, apellido o código…" onkeydown="if(event.key==='Enter'){filters.q=this.value;go('constancias')}"><button onclick="filters.q=this.previousElementSibling.value;go('constancias')">⌕</button></div><div class="note">Las constancias se podrán descargar una vez finalizado el congreso. Sube los PDF en la carpeta <b>constancias</b>.</div></div>`}
function cartelesMini(){return `<div class="side-card"><h3>Carteles del congreso</h3><div class="mini-search"><input placeholder="Código, autor o palabra clave…" onkeydown="if(event.key==='Enter'){filters.q=this.value;go('carteles')}"><button onclick="filters.q=this.previousElementSibling.value;go('carteles')">⌕</button></div><button class="btn" style="width:100%;justify-content:center;margin-top:14px" onclick="go('carteles')">Ver todos los carteles →</button></div>`}
function filterHeader(title,lead,onlyType){
 const mesas=['all',...DATA.mesas.map(m=>m.codigo)];
 return `<div class="section-kicker">${view==='programa'?'Programa académico':title}</div><h1 class="section-title">${title}</h1><p class="section-lead">${lead}</p>
 <div class="tabs">${[['all','Todos'],['1','Miércoles 23'],['2','Jueves 24'],['3','Viernes 25']].map(d=>`<button class="tab ${filters.day===d[0]?'active':''}" onclick="filters.day='${d[0]}';render()">${d[1]}</button>`).join('')}</div>
 <div class="toolbar"><input id="programSearch" data-keep-focus="1" value="${filters.q||''}" placeholder="Buscar por título, autor, institución o código…" oninput="filters.q=this.value;delayedRender()"><select onchange="filters.mesa=this.value;render()">${mesas.map(m=>`<option ${filters.mesa===m?'selected':''} value="${m}">${m==='all'?'Todas las mesas':m}</option>`).join('')}</select><select onchange="filters.modalidad=this.value;render()"><option value="all">Todas</option><option ${filters.modalidad==='Presencial'?'selected':''}>Presencial</option><option ${filters.modalidad==='Virtual'?'selected':''}>Virtual</option></select></div>`;
}
function renderPrograma(){ const items=filteredWorks(); app.innerHTML=filterHeader('Consulta por día, mesa o autor','Selecciona un día y filtra por mesa o modalidad. Cada asistente puede guardar ponencias en Mi Agenda.',null)+cards(items); }
function cards(items){ return items.length?`<div class="grid">${items.map(card).join('')}</div>`:`<div class="empty">No hay resultados con esos filtros.</div>`; }
function card(t){ const is=saved(t.codigo); return `<article class="card work-card ${mesaClass(t.mesa)}"><div class="mesa-pill">${t.mesa}</div><div class="meta">${t.codigo} · ${t.tipo} · ${t.modalidad}</div><h3>${t.titulo}</h3><p>${t.presenta||''}</p><p>${t.diaTexto} · ${t.horario}<br>${t.mesaNombre}<br>${t.sala}</p><div class="card-actions"><button class="small-btn ${is?'saved':''}" onclick="toggleSave('${t.codigo}')">${is?'★ Guardado':'☆ Agregar'}</button><button class="small-btn" onclick="showDetail('${t.codigo}')">Detalles</button>${t.tipo==='Cartel'?`<a class="small-btn" href="${t.cartelPdf}" target="_blank">Cartel PDF</a>`:''}</div></article>`; }
function renderAgenda(){ const codes=getAgenda(); const items=DATA.trabajos.filter(t=>codes.includes(t.codigo)); app.innerHTML=`<div class="section-kicker">Mi agenda</div><h1 class="section-title">Actividades guardadas</h1><p class="section-lead">Esta agenda se guarda en el navegador de cada asistente. No requiere cuenta ni base de datos.</p>${items.length?cards(items):'<div class="empty">Aún no has guardado actividades. Entra a Programa y usa ☆ Agregar.</div>'}`; }
function renderEventos(){ app.innerHTML=`<div class="section-kicker">Eventos destacados</div><h1 class="section-title">Tres momentos centrales</h1><p class="section-lead">Solo se muestran los eventos especiales confirmados para evitar duplicar información del programa.</p><div class="grid" style="grid-template-columns:1fr">${DATA.especiales.map((e,i)=>`<article class="card event-card"><div class="event-icon">${['🎤','🌎','📈'][i]}</div><div><div class="section-kicker">${e.tipo}</div><h3>${e.titulo}</h3><p><b>${e.diaTexto}</b> · ${e.horario} · ${e.sala}</p><p>${e.descripcion}</p></div></article>`).join('')}</div>`; }
function renderCarteles(){ const oldQ=filters.q; app.innerHTML=filterHeader('Carteles académicos','Busca por código, autor, institución o palabra clave. Al subir PDFs usa el código como nombre: CAR-003.pdf.','Cartel')+cards(filteredWorks('Cartel')); }
function renderConstancias(){
 const q=(filters.q||'').toLowerCase().trim();
 const items=DATA.constancias.filter(c=>!q||[c.nombre,(c.codigos||[]).join(' ')].join(' ').toLowerCase().includes(q));
 const shown=items.slice(0,72);
 app.innerHTML=`<div class="section-kicker">Constancias</div><h1 class="section-title">Busca y descarga constancias</h1><p class="section-lead">Escribe nombre, apellido o código. La búsqueda se mantiene ligera para que no se congele cuando haya muchos archivos.</p><div class="toolbar"><input id="constanciaSearch" data-keep-focus="1" value="${filters.q||''}" placeholder="Buscar por nombre, apellido o código…" oninput="filters.q=this.value;delayedRender()"></div><div class="result-summary">${items.length} resultado(s). ${items.length>shown.length?'Mostrando los primeros '+shown.length+'. Refina la búsqueda para ver menos.':''}</div>${shown.length?`<div class="grid constancia-grid">${shown.map(c=>`<article class="card work-card constancia-card"><div class="meta">${c.tipo}</div><h3>${c.nombre}</h3><p>${(c.codigos||[]).slice(0,4).join(', ')}${(c.codigos||[]).length>4?'…':''}</p><div class="status ${c.disponible?'ok':'pending'}">${c.disponible?'Disponible':'Pendiente de subir PDF'}</div><div class="card-actions"><a class="small-btn" href="${c.pdf}" target="_blank">Descargar PDF</a></div></article>`).join('')}</div>`:'<div class="empty">No hay constancias con esa búsqueda.</div>'}`;
}
function renderInfo(){ app.innerHTML=`<div class="section-kicker">Información</div><h1 class="section-title">Información del Congreso</h1><p class="section-lead">Datos útiles para asistentes, ponentes y organizadores.</p><div class="info-grid"><div class="card" style="padding:24px"><img class="info-img" src="assets/images/acceso-icea.jpeg" alt="Acceso principal ICEA"><h2>Sede</h2><p>Instituto de Ciencias Económico-Administrativas, UAEH. San Agustín Tlaxiaca, Hidalgo.</p><p><b>Registro:</b> vestíbulo principal · <b>Modalidad:</b> híbrida · <b>Fechas:</b> 23, 24 y 25 de septiembre de 2026.</p></div><div class="card" style="padding:24px"><h2>Operación rápida</h2><p>• Revisa tu horario en Programa.<br>• Guarda ponencias en Mi Agenda.<br>• Los carteles se subirán en la carpeta <b>carteles/</b>.<br>• Las constancias se subirán en <b>constancias/</b>.</p><h2>Contacto</h2><p>congreso.icea@uaeh.edu.mx</p></div></div>`; }
function showDetail(code){ const t=DATA.trabajos.find(x=>x.codigo===code); if(!t)return; $('#dialogContent').innerHTML=`<div class="dialog-body"><div class="meta">${t.codigo} · ${t.tipo} · ${t.modalidad}</div><h2>${t.titulo}</h2><p><b>Presenta:</b> ${t.presenta||''}</p><p><b>Autores:</b> ${(t.autores||[]).join(', ')}</p><p><b>Institución:</b> ${t.institucion||''}</p><p><b>Fecha:</b> ${t.diaTexto} · ${t.horario}</p><p><b>Mesa:</b> ${t.mesa} · ${t.mesaNombre}</p><p><b>Sala:</b> ${t.sala}</p>${t.resumen?`<p><b>Resumen:</b> ${t.resumen}${t.resumen.length>=900?'…':''}</p>`:''}<div class="card-actions"><button class="small-btn ${saved(t.codigo)?'saved':''}" onclick="toggleSave('${t.codigo}');showDetail('${t.codigo}')">${saved(t.codigo)?'★ Guardado':'☆ Agregar a Mi Agenda'}</button></div></div>`; $('#detailDialog').showModal(); }
function closeDialog(){ $('#detailDialog').close(); }
