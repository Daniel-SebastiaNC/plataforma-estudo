/* ---------- Dados ---------- */
  const lessons = [
    { t: "Como funciona a web", meta: "6 min", done: true },
    { t: "Seu primeiro arquivo HTML", meta: "9 min", done: true },
    { t: "Estrutura semântica com HTML5", meta: "8 min", done: false, active: true },
    { t: "Estilizando com CSS", meta: "12 min", done: false },
    { t: "Layout com Flexbox", meta: "14 min", done: false },
    { t: "Interatividade com JavaScript", meta: "16 min", done: false },
  ];

  const transcript = [
    ["00:00", "Bem-vindos a mais uma aula. Hoje o assunto é HTML semântico, um dos pilares para escrever código de qualidade."],
    ["00:24", "A ideia central é simples: cada elemento tem um significado, e a gente deve usar o elemento certo para cada tipo de conteúdo."],
    ["01:02", "Muita gente resolve tudo com div. Funciona, mas o navegador e os leitores de tela não entendem o que aquilo representa."],
    ["01:47", "Quando você usa header, nav, main e footer, você está descrevendo a função de cada parte da página."],
    ["02:30", "Isso melhora a acessibilidade, porque a pessoa que usa leitor de tela consegue pular direto para o conteúdo principal."],
    ["03:15", "Também ajuda no SEO: os buscadores entendem melhor a hierarquia e a importância de cada bloco."],
    ["04:05", "Vamos falar de article e section. O article é um conteúdo que se sustenta sozinho, como uma notícia ou um post."],
    ["04:58", "Já o section agrupa conteúdo relacionado, normalmente com um título próprio dentro de um mesmo tema."],
    ["05:40", "E o aside é para conteúdo lateral, complementar, que não é o foco principal da página."],
    ["06:30", "Na próxima aula, começamos a estilizar essa estrutura com CSS. Até lá, pratique reescrevendo uma página só com divs."],
  ];

  /* ---------- Render aulas ---------- */
  const lessonList = document.getElementById('lessonList');
  lessons.forEach((l, i) => {
    const el = document.createElement('div');
    el.className = 'lesson' + (l.done ? ' done' : '') + (l.active ? ' active' : '');
    el.innerHTML = `
      <span class="lesson-check">✓</span>
      <div class="lesson-info">
        <div class="lesson-title">${l.t}</div>
        <div class="lesson-meta">${l.done ? 'Concluída' : 'Não vista'} · ${l.meta}</div>
      </div>`;
    el.onclick = () => selecionarAula(i);
    lessonList.appendChild(el);
  });

  function selecionarAula(i) {
    document.querySelectorAll('.lesson').forEach((e,idx)=>e.classList.toggle('active', idx===i));
    document.getElementById('videoTitle').textContent = lessons[i].t;
    document.getElementById('mainTitle').textContent = lessons[i].t;
  }

  /* ---------- Render transcrição ---------- */
  const tb = document.getElementById('transcriptBody');
  transcript.forEach(([ts, txt]) => {
    const l = document.createElement('div');
    l.className = 'transcript-line';
    l.innerHTML = `<span class="ts">${ts}</span><span>${txt}</span>`;
    tb.appendChild(l);
  });

  /* ---------- Tabs centro ---------- */
  document.querySelectorAll('.tab').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('tab-'+t.dataset.tab).classList.add('active');
    };
  });

  /* ---------- Nav direita ---------- */
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('.nav-tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('panel-'+t.dataset.panel).classList.add('active');
      if (t.dataset.panel === 'caderno') renderNotebook();
    };
  });

  /* ---------- Caderno (estado em memória) ---------- */
  const notes = []; // {tipo, quote, texto}
  let currentSelection = "";
  let currentRange = null;

  function renderNotebook() {
    const nb = document.getElementById('notebook');
    if (notes.length === 0) {
      nb.innerHTML = `<div class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
        <div>Seu caderno está vazio.<br>Marque trechos ou adicione observações no conteúdo da aula.</div>
      </div>`;
      return;
    }
    nb.innerHTML = notes.map((n, i) => `
      <div class="note-card">
        <div class="note-src">${n.tipo === 'marca' ? '✏️ Trecho marcado' : '💬 Observação'} · Aula 03</div>
        <div class="note-quote">"${n.quote}"</div>
        ${n.texto ? `<div class="note-text">${n.texto}</div>` : ''}
        <button class="note-del" onclick="delNote(${i})">Remover</button>
      </div>`).join('');
  }
  function delNote(i){
    const note = notes[i];
    if (note && note.el) unwrap(note.el);
    notes.splice(i,1);
    renderNotebook();
    updateCadernoBadge();
  }
  function unwrap(el) {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
    parent.normalize();
  }

  /* ---------- Seleção de texto ---------- */
  const popover = document.getElementById('popover');
  function handleSelection() {
    const sel = window.getSelection();
    const txt = sel.toString().trim();
    if (txt.length > 3) {
      currentSelection = txt;
      currentRange = sel.getRangeAt(0).cloneRange();
      const r = sel.getRangeAt(0).getBoundingClientRect();
      popover.style.display = 'flex';
      popover.style.left = (r.left + r.width/2 - 70) + 'px';
      popover.style.top = (r.top - 46) + 'px';
    } else {
      popover.style.display = 'none';
    }
  }
  document.getElementById('contentBody').addEventListener('mouseup', handleSelection);
  document.getElementById('transcriptBody').addEventListener('mouseup', handleSelection);
  document.addEventListener('mousedown', e => {
    if (!popover.contains(e.target)) popover.style.display = 'none';
  });

  function marcarTrecho() {
    const el = wrapRange(currentRange, 'marca');
    notes.push({ tipo:'marca', quote: currentSelection, texto:'', el });
    popover.style.display = 'none';
    window.getSelection().removeAllRanges();
    flashCaderno();
  }
  function wrapRange(range, className, obsText) {
    if (!range) return null;
    try {
      const el = document.createElement('span');
      el.className = className;
      if (obsText) el.setAttribute('data-obs', obsText); // atributo, não innerHTML — seguro contra aspas/HTML
      range.surroundContents(el);
      return el;
    } catch(e){ return null; /* seleção cruzando elementos */ }
  }

  /* ---------- Modal observação ---------- */
  function abrirObs() {
    document.getElementById('modalQuote').textContent = '"' + currentSelection + '"';
    document.getElementById('obsText').value = '';
    document.getElementById('modalObs').classList.add('open');
    popover.style.display = 'none';
    setTimeout(()=>document.getElementById('obsText').focus(), 50);
  }
  function fecharObs(){ document.getElementById('modalObs').classList.remove('open'); }
  function salvarObs() {
    const texto = document.getElementById('obsText').value.trim();
    if (!texto) { document.getElementById('obsText').focus(); return; }
    const el = wrapRange(currentRange, 'obs-mark', texto);
    notes.push({ tipo:'obs', quote: currentSelection, texto, el });
    fecharObs();
    flashCaderno();
    window.getSelection().removeAllRanges();
  }

  /* feedback visual no caderno */
  function updateCadernoBadge(){}
  function flashCaderno() {
    const btn = [...document.querySelectorAll('.nav-tab')].find(b=>b.dataset.panel==='caderno');
    btn.style.color = 'var(--verde)';
    setTimeout(()=>{ btn.style.color=''; }, 900);
  }

  /* ---------- Chats ---------- */
  function enviarDuvida(){ pushMsg('chatDuvidas','inputDuvida','Monitor','Boa pergunta! Vou detalhar isso pra você já já.'); }
  function pushMsg(chatId, inputId, who, reply) {
    const inp = document.getElementById(inputId);
    const txt = inp.value.trim();
    if (!txt) return;
    const chat = document.getElementById(chatId);
    chat.insertAdjacentHTML('beforeend', `<div class="msg me">${txt}</div>`);
    inp.value = '';
    chat.scrollTop = chat.scrollHeight;
    setTimeout(()=>{
      chat.insertAdjacentHTML('beforeend', `<div class="msg prof"><div class="who">${who}</div>${reply}</div>`);
      chat.scrollTop = chat.scrollHeight;
    }, 700);
  }
  document.getElementById('inputDuvida').addEventListener('keydown',e=>{if(e.key==='Enter')enviarDuvida();});

  /* ---------- Simulado ---------- */
  let quizSel = null, quizCorreta = false;
  function selOpt(el, correta) {
    document.querySelectorAll('.quiz-opt').forEach(o=>o.classList.remove('sel'));
    el.classList.add('sel');
    quizSel = el; quizCorreta = correta;
    document.getElementById('quizFeedback').textContent = '';
  }
  function conferir() {
    const fb = document.getElementById('quizFeedback');
    if (!quizSel) { fb.style.color='var(--cinza-500)'; fb.textContent='Selecione uma alternativa.'; return; }
    if (quizCorreta) { fb.style.color='var(--verde)'; fb.textContent='✓ Correto! article é independente.'; }
    else { fb.style.color='#d64545'; fb.textContent='✗ Não é essa. Tente novamente.'; }
  }

  /* ---------- Baixar áudio (simulado) ---------- */
  function baixarAudio() {
    const blob = new Blob(['Áudio da aula 03 — Estrutura semântica com HTML5 (demo)'], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aula-03-audio.txt';
    a.click();
  }

  renderNotebook();