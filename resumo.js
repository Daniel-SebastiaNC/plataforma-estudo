/* ---------- Resumo inteligente (IA mockada) ---------- */

const docBody = document.getElementById('docBody');
const docMeta = document.getElementById('docMeta');
const docSub  = document.getElementById('docSub');

/* escapa conteúdo do usuário antes de ir para innerHTML */
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

/* carrega os dados gerados pelo Caderno */
let data = null;
try { data = JSON.parse(sessionStorage.getItem('resumoIA')); } catch (e) { data = null; }

if (!data || !data.notes || !data.notes.length) {
  docSub.textContent = '';
  docBody.innerHTML = `<div class="vazio">
    Nenhuma marcação encontrada.<br>
    Volte ao <a href="index.html">Caderno</a>, marque trechos ou adicione observações e clique em <b>Mesclar tudo com IA</b>.
  </div>`;
} else {
  // cabeçalho
  const dt = new Date(data.geradoEm || Date.now());
  const dataFmt = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  docMeta.innerHTML = `${esc(data.curso || 'Curso')}<br>Gerado em ${esc(dataFmt)}`;
  docSub.innerHTML = `<strong>${esc(data.aula || 'Aula')}</strong> · consolidado a partir do seu Caderno do aluno`;

  // estado "gerando com IA"
  docBody.innerHTML = `<div class="gerando">
    <div class="spinner"></div>
    <span>Gerando resumo com IA<span class="dots"></span></span>
  </div>`;

  setTimeout(() => renderResumo(data), 1500);
}

function renderResumo(data) {
  const marcas = data.notes.filter(n => n.tipo === 'marca');
  const obs    = data.notes.filter(n => n.tipo === 'obs');
  const tema   = data.aula || 'este conteúdo';

  let html = `<div class="ai-badge">🤖 Mesclado por IA</div>`;

  // 1) parágrafo-resumo corrido
  html += `<p class="resumo-corrido">${paragrafoResumo(marcas, obs, tema)}</p>`;

  // 2) trechos marcados
  if (marcas.length) {
    html += `<h2 class="sec-title">■ Trechos marcados</h2>`;
    html += `<ul class="trecho-list">` +
      marcas.map(m => `<li>${esc(m.quote)}</li>`).join('') +
      `</ul>`;
  }

  // 3) observações + comentário da IA
  if (obs.length) {
    html += `<h2 class="sec-title">■ Suas observações</h2>`;
    html += obs.map((o, i) => `
      <div class="obs-block">
        <div class="obs-quote">"${esc(o.quote)}"</div>
        <div class="obs-nota"><b>Sua nota:</b> ${esc(o.texto)}</div>
        <div class="ia-coment">💡 <span><b>Comentário da IA:</b> ${esc(comentarioIA(o, i))}</span></div>
      </div>`).join('');
  }

  // 4) para revisar
  html += `<h2 class="sec-title">■ Para revisar</h2>`;
  html += `<ul class="revisar-list">` + pontosRevisar(marcas, obs, tema).map(p => `<li>${esc(p)}</li>`).join('') + `</ul>`;

  // rodapé
  html += `<div class="doc-footer">
    Documento gerado automaticamente pela Aprende · Resumo baseado nas suas ${data.notes.length} anotação(ões).<br>
    Este conteúdo é um apoio de estudo — revise sempre com o material original da aula.
  </div>`;

  docBody.innerHTML = html;
}

/* ----- geradores mockados ----- */

function primeirasPalavras(txt, n = 6) {
  return txt.split(/\s+/).slice(0, n).join(' ').replace(/[.,;:]$/, '');
}

function paragrafoResumo(marcas, obs, tema) {
  const nM = marcas.length, nO = obs.length;
  let p = `Nesta aula sobre <strong>${esc(tema)}</strong>, você destacou ${nM} trecho${nM === 1 ? '' : 's'} ` +
          `e registrou ${nO} observação${nO === 1 ? '' : 'ões'}. `;

  if (marcas.length) {
    const foco = marcas.slice(0, 2).map(m => `<strong>${esc(primeirasPalavras(m.quote))}</strong>`).join(' e ');
    p += `A leitura mostra que sua atenção se concentrou principalmente em ${foco}, ` +
         `pontos que sustentam a ideia central do tema. `;
  }
  if (obs.length) {
    p += `Suas anotações revelam um esforço de conexão entre os conceitos, o que indica um estudo ativo e não apenas passivo. `;
  }
  p += `Reunimos abaixo tudo o que você marcou e observou, organizado para facilitar a sua revisão.`;
  return p;
}

const POOL_COMENTARIOS = [
  'esse ponto costuma cair em provas — vale reescrevê-lo com suas próprias palavras para fixar.',
  'boa conexão! Tente relacionar essa ideia com um exemplo prático que você já tenha visto.',
  'anotação pertinente. Reforce isso comparando com o conceito oposto para entender melhor os limites.',
  'ótimo destaque — se conseguir explicar isso em voz alta para alguém, o aprendizado se consolida.',
  'esse trecho é um bom candidato a flashcard: transforme-o em uma pergunta e resposta.',
];
function comentarioIA(o, i) {
  return POOL_COMENTARIOS[i % POOL_COMENTARIOS.length];
}

function pontosRevisar(marcas, obs, tema) {
  const pts = [];
  marcas.slice(0, 4).forEach(m => pts.push(`Revisar: ${primeirasPalavras(m.quote, 9)}…`));
  if (obs.length) pts.push(`Reler as suas ${obs.length} observação(ões) e conferir se ainda fazem sentido.`);
  pts.push(`Fazer o simulado da aula para testar o que você fixou sobre ${tema}.`);
  return pts;
}
