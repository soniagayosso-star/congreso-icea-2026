const $ = (s) => document.querySelector(s);
let DATA = {evento:{}, trabajos:[], mesas:[], especiales:[], constancias:[], avisos:[]};
let view = 'inicio';
let filters = {q:'', day:'all', mesa:'all', modalidad:'all'};
let renderTimer = null;
const AGENDA_KEY = 'iceaAgenda2026';
const EVENT_KEY_PREFIX = 'EV-';
const mesaColors = {
  'Mesa 1':'#7a001f','Mesa 2':'#174f86','Mesa 3':'#0f7f78','Mesa 4':'#c8102e','Mesa 5':'#a76400'
};
const eventDetails = {
  magistral:{icon:'🎤', cls:'', title:'Conferencia Magistral', theme:'Actividad central del Congreso', date:'Miércoles 23 de septiembre', time:'10:45–11:45', place:'Auditorio ICEA', people:[{name:'Ponente magistral', role:'Semblanza pendiente de carga', inst:'Institución por confirmar'}], desc:'Espacio académico de apertura para dialogar sobre investigación, innovación y tendencias económico-administrativas. Este bloque tendrá visible la semblanza del conferencista, el título oficial y los datos de sede cuando estén confirmados.'},
  'foro-turismo':{icon:'🌎', cls:'foro', title:'Foro de Turismo', theme:'Agenda digital e innovación turística', date:'Jueves 24 de septiembre', time:'Horario pendiente de confirmar', place:'ICEA', people:[{name:'Moderador(a) del foro', role:'Moderación', inst:'Pendiente'},{name:'Ponente 1', role:'Panelista', inst:'Semblanza pendiente'},{name:'Ponente 2', role:'Panelista', inst:'Semblanza pendiente'},{name:'Ponente 3', role:'Panelista', inst:'Semblanza pendiente'}], desc:'Diálogo especializado sobre retos, oportunidades y transformación del turismo desde enfoques interdisciplinarios. Se mostrarán las semblanzas de cada participante dentro de esta misma plataforma, sin descargar archivos.'},
  'panel-economia':{icon:'📈', cls:'panel', title:'Panel de Economía', theme:'Reconfiguración económica y escenarios actuales', date:'Viernes 25 de septiembre', time:'Horario pendiente de confirmar', place:'ICEA', people:[{name:'Moderador(a) del panel', role:'Moderación', inst:'Pendiente'},{name:'Panelista 1', role:'Economía', inst:'Semblanza pendiente'},{name:'Panelista 2', role:'Economía', inst:'Semblanza pendiente'},{name:'Panelista 3', role:'Economía', inst:'Semblanza pendiente'}], desc:'Conversación académica para analizar el contexto económico actual y sus implicaciones regionales e internacionales. Las semblanzas de panelistas se consultarán en pantalla.'}
};

async function boot(){
  try{
    const res = await fetch('data/programa.json', {cache:'no-store'});
    DATA = await res.json();
  }catch(e){
    console.warn('No se pudo cargar data/programa.json', e);
  }
  DATA.trabajos = (DATA.trabajos||[]).map(t=>({
    ...t,
    cartelPdf: t.cartelPdf || `carteles/${t.codigo}.pdf`,
    constanciaPdf: t.constanciaPdf || `constancias/${t.tipo==='Cartel'?'carteles':'ponencias'}/${safeName(t.presenta||t.codigo)}.pdf`,
    semblanza: t.semblanza || `Semblanza pendiente de captura para ${t.presenta||'la persona ponente'}. Aquí se podrá incorporar una breve trayectoria académica/profesional de quien presenta la ponencia.`
  }));
  if(!DATA.constancias || !DATA.constancias.length){
    DATA.constancias = DATA.trabajos.map(t=>({nombre:t.presenta||t.codigo,tipo:t.tipo,codigos:[t.codigo],pdf:t.constanciaPdf,disponible:false}));
  }
  bind();
  updateAgendaCount();
  render();
  startCountdown();
}
function bind(){
  document.querySelectorAll('.nav-link').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
  $('#menuBtn').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#overlay').classList.add('show')});
  $('#overlay').addEventListener('click',()=>{$('#sidebar').classList.remove('open');$('#overlay').classList.remove('show')});
  $('#dialogClose').addEventListener('click',closeDialog);
  $('#globalSearch').addEventListener('input',(e)=>{filters.q=e.target.value;view='programa';setActive();delayedRender();});
}
function go(v){ view=v; setActive(); $('#sidebar').classList.remove('open'); $('#overlay').classList.remove('show'); render(); window.scrollTo({top:0,behavior:'smooth'}); }
function setActive(){ document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.view===view)); }
function delayedRender(){ clearTimeout(renderTimer); renderTimer=setTimeout(render,120); }
function render(){
  setActive();
  const app = $('#app');
  if(view==='inicio') app.innerHTML=renderInicio();
  if(view==='programa') app.innerHTML=renderPrograma();
  if(view==='agenda') app.innerHTML=renderAgenda();
  if(view==='eventos') app.innerHTML=renderEventos();
  if(view==='carteles') app.innerHTML=renderCarteles();
  if(view==='constancias') app.innerHTML=renderConstancias();
  if(view==='info') app.innerHTML=renderInfo();
  const input = app.querySelector('[data-focus]');
  if(input){ input.focus(); input.setSelectionRange(input.value.length,input.value.length); }
}
function renderInicio(){
  const totals = DATA.evento?.totales || {trabajos:135, mesas:5, ponencias:97, carteles:38};
  return `<div class="layout"><div>
    <section class="hero">
      <div class="kicker">Plataforma oficial</div>
      <h1>11° Congreso Internacional ICEA 2026</h1>
      <p>Programa académico, eventos destacados, carteles, constancias y orientación para asistentes en una sola plataforma.</p>
      <div class="hero-actions"><button class="btn primary" onclick="go('programa')">Ver programa</button><button class="btn ghost" onclick="go('eventos')">Eventos destacados</button><button class="btn ghost" onclick="go('info')">Croquis ICEA</button></div>
    </section>
    <section class="stats">
      <div class="stat"><div class="countdown" id="countdown"><div><b>--</b><span>Días</span></div><div><b>--</b><span>Horas</span></div><div><b>--</b><span>Min</span></div><div><b>--</b><span>Seg</span></div></div></div>
      <div class="stat"><b>${totals.trabajos||DATA.trabajos.length}</b><span>Trabajos</span></div>
      <div class="stat"><b>${totals.mesas||DATA.mesas.length}</b><span>Mesas</span></div>
      <div class="stat"><b>${totals.ponencias||DATA.trabajos.filter(t=>t.tipo==='Ponencia').length}</b><span>Ponencias</span></div>
      <div class="stat"><b>${totals.carteles||DATA.trabajos.filter(t=>t.tipo==='Cartel').length}</b><span>Carteles</span></div>
    </section>
    ${renderSpecialPreview()}
    <section style="margin-top:26px"><div class="section-kicker">Agenda de hoy</div><h2 class="section-title">Actividad del Congreso</h2><p class="section-lead">Vista breve para orientar asistentes. El programa completo se consulta por día desde la sección Programa.</p><div class="today-card">${todayRows()}</div></section>
  </div><aside class="side-col">${noticesCard()}${croquisMini()}${constanciaMini()}${cartelesMini()}</aside></div>`;
}
function renderSpecialPreview(){
  const ids=['magistral','foro-turismo','panel-economia'];
  return `<section><div class="section-kicker">Eventos destacados</div><h2 class="section-title">Tres momentos centrales</h2><p class="section-lead">Conferencia Magistral, Foro de Turismo y Panel de Economía con semblanzas visibles en la plataforma.</p><div class="special-grid">${ids.map(id=>specialCard(id,true)).join('')}</div></section>`;
}
function specialCard(id,compact=false){
  const e=eventDetails[id];
  return `<article class="special-card ${e.cls}"><div><div class="special-top"><div><div class="section-kicker" style="color:#fff;opacity:.85">${e.title}</div><h3>${e.theme}</h3></div><div class="special-icon">${e.icon}</div></div><p>${e.desc}</p></div><div><p><b>📅 ${e.date}</b><br>⏱ ${e.time}<br>📍 ${e.place}</p><div class="card-actions"><button class="small-btn" onclick="showEvent('${id}')">Ver detalles</button><button class="small-btn ${saved(EVENT_KEY_PREFIX+id)?'saved':''}" onclick="toggleSave('${EVENT_KEY_PREFIX+id}')">${saved(EVENT_KEY_PREFIX+id)?'★ Guardado':'☆ Agregar'}</button></div></div></article>`;
}
function todayRows(){
  const rows=[['10:00','Ceremonia de inauguración','Auditorio / Plenaria'],['10:45','Conferencia Magistral','Auditorio ICEA'],['12:00','Mesas temáticas','Salas simultáneas'],['16:30','Presentación de carteles','Galería ICEA']];
  return rows.map(r=>`<div class="agenda-row"><time>${r[0]}</time><div><b>${r[1]}</b><span>${r[2]}</span></div><button class="small-btn" onclick="go('programa')">Ver</button></div>`).join('');
}
function noticesCard(){return `<div class="side-card"><h3>Avisos importantes</h3>
  <div class="notice"><i>!</i><div><b>Bienvenidos al 11° Congreso</b><p>Te esperamos los días 23, 24 y 25 de septiembre en el ICEA.</p></div></div>
  <div class="notice"><i>◷</i><div><b>Registro y acreditación</b><p>El registro abre a las 8:30 el primer día en el vestíbulo principal.</p></div></div>
  <div class="notice"><i>▣</i><div><b>Modalidad híbrida</b><p>Hay sesiones presenciales y virtuales cada día. Revisa tu horario en Programa.</p></div></div>
  <div class="notice"><i>✓</i><div><b>Constancias</b><p>Se habilitarán una vez finalizado el congreso.</p></div></div>
</div>`}
function croquisMini(){return `<div class="side-card croquis-card"><h3>Croquis ICEA</h3><img src="assets/images/croquis-icea.png" alt="Croquis ICEA"><button class="btn" style="width:100%;justify-content:center;margin-top:14px" onclick="go('info')">Ver mapa y sedes →</button></div>`}
function constanciaMini(){return `<div class="side-card"><h3>Descarga tu constancia</h3><div class="mini-search"><input placeholder="Nombre, apellido o código…" onkeydown="if(event.key==='Enter'){filters.q=this.value;go('constancias')}"><button onclick="filters.q=this.previousElementSibling.value;go('constancias')">⌕</button></div><div class="note">Sube los PDF en <b>constancias/ponencias</b> o <b>constancias/carteles</b> siguiendo el README.</div></div>`}
function cartelesMini(){return `<div class="side-card"><h3>Carteles del congreso</h3><div class="mini-search"><input placeholder="Código, autor o palabra clave…" onkeydown="if(event.key==='Enter'){filters.q=this.value;go('carteles')}"><button onclick="filters.q=this.previousElementSibling.value;go('carteles')">⌕</button></div><button class="btn" style="width:100%;justify-content:center;margin-top:14px" onclick="go('carteles')">Ver todos los carteles →</button></div>`}
function filterHeader(title,lead){
  const mesas=['all',...DATA.mesas.map(m=>m.codigo)];
  return `<div class="section-kicker">${view==='programa'?'Programa académico':title}</div><h1 class="section-title">${title}</h1><p class="section-lead">${lead}</p>
  <div class="tabs">${[['all','Todos'],['1','Miércoles 23'],['2','Jueves 24'],['3','Viernes 25']].map(d=>`<button class="tab ${filters.day===d[0]?'active':''}" onclick="filters.day='${d[0]}';render()">${d[1]}</button>`).join('')}</div>
  <div class="toolbar"><input data-focus id="programSearch" value="${esc(filters.q)}" placeholder="Buscar por título, autor, institución o código…" oninput="filters.q=this.value;delayedRender()"><select onchange="filters.mesa=this.value;render()">${mesas.map(m=>`<option ${filters.mesa===m?'selected':''} value="${m}">${m==='all'?'Todas las mesas':m}</option>`).join('')}</select><select onchange="filters.modalidad=this.value;render()"><option value="all">Todas</option><option ${filters.modalidad==='Presencial'?'selected':''}>Presencial</option><option ${filters.modalidad==='Virtual'?'selected':''}>Virtual</option></select></div>`;
}
function renderPrograma(){ const items=filteredWorks(); return filterHeader('Consulta por día, mesa o autor','Selecciona un día y filtra por mesa o modalidad. Cada asistente puede guardar ponencias en Mi Agenda.')+cards(items); }
function renderCarteles(){ return filterHeader('Carteles académicos','Busca por código, autor, institución o palabra clave. Al subir PDFs usa el código como nombre: CAR-003.pdf.')+cards(filteredWorks('Cartel')); }
function cards(items){ return items.length?`<div class="grid">${items.map(card).join('')}</div>`:`<div class="empty">No hay resultados con esos filtros.</div>`; }
function card(t){ const is=saved(t.codigo); return `<article class="card work-card" style="--mesa:${mesaColors[t.mesa]||'#c8102e'}"><div class="mesa-pill">${t.mesa}</div><div class="meta">${t.codigo} · ${t.tipo} · ${t.modalidad}</div><h3>${t.titulo}</h3><p>${t.presenta||''}</p><p>${t.diaTexto} · ${t.horario}<br>${t.mesaNombre}<br>${t.sala}</p><div class="card-actions"><button class="small-btn ${is?'saved':''}" onclick="toggleSave('${t.codigo}')">${is?'★ Guardado':'☆ Agregar'}</button><button class="small-btn" onclick="showDetail('${t.codigo}')">Detalles y semblanza</button>${t.tipo==='Cartel'?`<a class="small-btn" href="${t.cartelPdf}" target="_blank">Cartel PDF</a>`:''}</div></article>`; }
function filteredWorks(type){
  const q=(filters.q||'').toLowerCase().trim();
  return DATA.trabajos.filter(t=>{
    if(type && t.tipo!==type) return false;
    if(filters.day!=='all' && String(t.dia)!==filters.day) return false;
    if(filters.mesa!=='all' && t.mesa!==filters.mesa) return false;
    if(filters.modalidad!=='all' && t.modalidad!==filters.modalidad) return false;
    if(q){ const blob=[t.codigo,t.titulo,t.presenta,t.institucion,t.mesa,t.mesaNombre,t.sala,(t.autores||[]).join(' '),(t.palabrasClave||[]).join(' ')].join(' ').toLowerCase(); if(!blob.includes(q)) return false; }
    return true;
  });
}
function renderAgenda(){
  const codes=getAgenda();
  const works=DATA.trabajos.filter(t=>codes.includes(t.codigo));
  const events=Object.keys(eventDetails).filter(id=>codes.includes(EVENT_KEY_PREFIX+id));
  const eventCards=events.map(id=>`<article class="card event-card" style="padding:22px"><div class="meta">Evento destacado</div><h3>${eventDetails[id].title}</h3><p>${eventDetails[id].date} · ${eventDetails[id].time}<br>${eventDetails[id].place}</p><div class="card-actions"><button class="small-btn" onclick="showEvent('${id}')">Ver detalles</button><button class="small-btn saved" onclick="toggleSave('${EVENT_KEY_PREFIX+id}')">Quitar</button></div></article>`).join('');
  return `<div class="section-kicker">Mi agenda</div><h1 class="section-title">Actividades guardadas</h1><p class="section-lead">Se guarda en el navegador del asistente. No requiere cuenta ni base de datos.</p>${works.length||events.length?`<div class="grid">${eventCards}${works.map(card).join('')}</div>`:'<div class="empty">Aún no has guardado actividades. Entra a Programa o Eventos destacados y usa ☆ Agregar.</div>'}`;
}
function renderEventos(){
  return `<div class="section-kicker">Eventos destacados</div><h1 class="section-title">Tres experiencias centrales</h1><p class="section-lead">Cada evento tendrá semblanzas visibles en pantalla. No se descargan: se consultan directamente desde la plataforma.</p><div class="special-grid">${['magistral','foro-turismo','panel-economia'].map(id=>specialCard(id)).join('')}</div><section style="margin-top:28px"><div class="section-kicker">Participantes</div><h2 class="section-title">Semblanzas en pantalla</h2><p class="section-lead">Usa “Ver detalles” para abrir el panel con objetivo, participantes y semblanzas. Cuando tengas datos finales, solo reemplazas los textos del archivo app.js.</p></section>`;
}
function renderConstancias(){
  const q=(filters.q||'').toLowerCase().trim();
  const items=DATA.constancias.filter(c=>!q||[c.nombre,c.tipo,(c.codigos||[]).join(' ')].join(' ').toLowerCase().includes(q));
  const shown=items.slice(0,96);
  return `<div class="section-kicker">Constancias</div><h1 class="section-title">Busca y descarga constancias</h1><p class="section-lead">Escribe nombre, apellido o código. Para evitar errores, respeta la nomenclatura indicada en el README.</p><div class="toolbar"><input data-focus id="constanciaSearch" value="${esc(filters.q)}" placeholder="Buscar por nombre, apellido o código…" oninput="filters.q=this.value;delayedRender()"></div><div class="result-summary">${items.length} resultado(s). ${items.length>shown.length?'Mostrando los primeros '+shown.length+'. Refina la búsqueda para ver menos.':''}</div>${shown.length?`<div class="grid">${shown.map(c=>`<article class="card work-card"><div class="meta">${c.tipo}</div><h3>${c.nombre}</h3><p>${(c.codigos||[]).slice(0,5).join(', ')}</p><div class="status ${c.disponible?'ok':'pending'}">${c.disponible?'Disponible':'Pendiente de subir PDF'}</div><div class="card-actions"><a class="small-btn" href="${c.pdf}" target="_blank">Descargar PDF</a></div></article>`).join('')}</div>`:'<div class="empty">No hay constancias con esa búsqueda.</div>'}`;
}
function renderInfo(){ return `<div class="section-kicker">Información</div><h1 class="section-title">Sede, croquis y orientación</h1><p class="section-lead">El croquis ayuda a identificar edificios, accesos y espacios del Congreso.</p><div class="info-grid"><div class="card" style="padding:24px"><img class="croquis-main" src="assets/images/croquis-icea.png" alt="Croquis ICEA"><div class="map-legend">${legendItems()}</div></div><div class="card" style="padding:24px"><img class="info-img" src="assets/images/acceso-icea.jpeg" alt="Acceso principal ICEA"><h2>Sede</h2><p>Instituto de Ciencias Económico-Administrativas, UAEH. San Agustín Tlaxiaca, Hidalgo.</p><p><b>Registro:</b> vestíbulo principal.<br><b>Modalidad:</b> híbrida.<br><b>Fechas:</b> 23, 24 y 25 de septiembre de 2026.</p><h2>Operación rápida</h2><p>• Revisa tu horario en Programa.<br>• Guarda ponencias en Mi Agenda.<br>• Sube carteles en <b>carteles/</b>.<br>• Sube constancias en <b>constancias/</b>.</p></div></div>`; }
function legendItems(){ const items=[['A','Economía','#d71857'],['B','Contaduría','#6d3ec8'],['C','Administración','#008a91'],['D','Comercio Exterior','#f28b18'],['E','Mercadotecnia','#1f5ab6'],['F','Turismo y Gastronomía','#d6469a'],['1','Audiovisual 1','#078a9a'],['2','Audiovisual 2','#078a9a']]; return items.map(i=>`<div class="legend-item"><span class="dot" style="--c:${i[2]}">${i[0]}</span>${i[1]}</div>`).join(''); }
function showDetail(code){
  const t=DATA.trabajos.find(x=>x.codigo===code); if(!t)return;
  $('#dialogContent').innerHTML=`<div class="dialog-body"><div class="dialog-hero" style="background:linear-gradient(135deg,${mesaColors[t.mesa]||'#c8102e'},#111018)"><div><div class="section-kicker" style="color:#fff;opacity:.85">${t.codigo} · ${t.tipo} · ${t.modalidad}</div><h2>${t.titulo}</h2></div></div><p><b>Presenta:</b> ${t.presenta||''}</p><p><b>Autores:</b> ${(t.autores||[]).join(', ')}</p><p><b>Institución:</b> ${t.institucion||''}</p><p><b>Fecha:</b> ${t.diaTexto} · ${t.horario}</p><p><b>Mesa:</b> ${t.mesa} · ${t.mesaNombre}</p><p><b>Sala:</b> ${t.sala}</p><div class="bio-box"><h3>Semblanza de quien presenta</h3><p>${t.semblanza}</p></div>${t.resumen?`<div class="bio-box"><h3>Resumen</h3><p>${t.resumen}${t.resumen.length>=900?'…':''}</p></div>`:''}<div class="card-actions"><button class="small-btn ${saved(t.codigo)?'saved':''}" onclick="toggleSave('${t.codigo}');showDetail('${t.codigo}')">${saved(t.codigo)?'★ Guardado':'☆ Agregar a Mi Agenda'}</button>${t.tipo==='Cartel'?`<a class="small-btn" href="${t.cartelPdf}" target="_blank">Ver cartel PDF</a>`:''}<button class="small-btn" onclick="go('info');closeDialog()">Ver croquis</button></div></div>`;
  $('#detailDialog').showModal();
}
function showEvent(id){
  const e=eventDetails[id];
  $('#dialogContent').innerHTML=`<div class="dialog-body"><div class="dialog-hero" style="background:linear-gradient(135deg,${id==='foro-turismo'?'#4b247a':id==='panel-economia'?'#174f86':'#c8102e'},#111018)"><div><div class="section-kicker" style="color:#fff;opacity:.85">${e.title}</div><h2>${e.theme}</h2></div></div><p>${e.desc}</p><p><b>Fecha:</b> ${e.date}<br><b>Horario:</b> ${e.time}<br><b>Lugar:</b> ${e.place}</p><div class="bio-box"><h3>Semblanzas</h3><div class="people-list">${e.people.map(p=>`<div class="person-chip"><div class="avatar">${initials(p.name)}</div><div><b>${p.name}</b><span>${p.role}<br>${p.inst}</span></div></div>`).join('')}</div></div><div class="card-actions"><button class="small-btn ${saved(EVENT_KEY_PREFIX+id)?'saved':''}" onclick="toggleSave('${EVENT_KEY_PREFIX+id}');showEvent('${id}')">${saved(EVENT_KEY_PREFIX+id)?'★ Guardado':'☆ Agregar a Mi Agenda'}</button><button class="small-btn" onclick="go('info');closeDialog()">Ver croquis</button></div></div>`;
  $('#detailDialog').showModal();
}
function closeDialog(){ $('#detailDialog').close(); }
function getAgenda(){ try{return JSON.parse(localStorage.getItem(AGENDA_KEY)||'[]')}catch{return []} }
function saved(code){ return getAgenda().includes(code); }
function toggleSave(code){ const set=new Set(getAgenda()); set.has(code)?set.delete(code):set.add(code); localStorage.setItem(AGENDA_KEY,JSON.stringify([...set])); updateAgendaCount(); render(); }
function updateAgendaCount(){ const el=$('#agendaCount'); const n=getAgenda().length; el.textContent=n; el.classList.toggle('show', n>0); }
function startCountdown(){ setInterval(()=>{ const el=$('#countdown'); if(!el) return; const target=new Date('2026-09-23T09:00:00-06:00').getTime(); let diff=Math.max(0,target-Date.now()); const d=Math.floor(diff/86400000); diff-=d*86400000; const h=Math.floor(diff/3600000); diff-=h*3600000; const m=Math.floor(diff/60000); diff-=m*60000; const s=Math.floor(diff/1000); el.innerHTML=[['Días',d],['Horas',h],['Min',m],['Seg',s]].map(x=>`<div><b>${String(x[1]).padStart(2,'0')}</b><span>${x[0]}</span></div>`).join(''); },1000); }
function esc(s=''){ return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function safeName(s=''){ return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,''); }
function initials(s=''){ return s.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'P'; }
boot();
