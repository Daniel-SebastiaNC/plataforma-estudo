/* ---------- Simulado detalhado (mock) ---------- */

const perguntas = [
  {
    q: "Qual elemento representa um conteúdo independente, que faz sentido sozinho (como um post ou notícia)?",
    opts: ["section", "article", "aside", "div"],
    correta: 1,
    explica: "O article é um bloco autossuficiente e reutilizável; faria sentido publicado isoladamente."
  },
  {
    q: "Qual tag deve envolver a navegação principal do site?",
    opts: ["menu", "nav", "header", "section"],
    correta: 1,
    explica: "nav marca blocos de navegação. header pode conter a nav, mas quem descreve a navegação é a nav."
  },
  {
    q: "Quantos elementos main deve haver, no máximo, por documento?",
    opts: ["Um", "Dois", "Um por seção", "Ilimitado"],
    correta: 0,
    explica: "Só deve existir um main visível por documento — ele marca o conteúdo principal da página."
  },
  {
    q: "O elemento aside é indicado para qual tipo de conteúdo?",
    opts: [
      "O conteúdo central da página",
      "Conteúdo secundário/complementar (ex.: barra lateral)",
      "O rodapé com créditos",
      "O título principal"
    ],
    correta: 1,
    explica: "aside guarda conteúdo lateral e complementar, que não é o foco principal da página."
  },
  {
    q: "Qual a principal diferença entre section e article?",
    opts: [
      "Não há diferença, são sinônimos",
      "article é independente; section agrupa conteúdo de um mesmo tema",
      "section é independente; article só serve para estilo",
      "article só pode aparecer uma vez"
    ],
    correta: 1,
    explica: "article se sustenta sozinho; section agrupa conteúdo relacionado, normalmente com um título próprio."
  },
  {
    q: "Por que o HTML semântico ajuda na acessibilidade?",
    opts: [
      "Porque deixa a página mais colorida",
      "Porque permite que leitores de tela pulem direto para regiões (landmarks)",
      "Porque diminui o tamanho do arquivo",
      "Porque substitui o CSS"
    ],
    correta: 1,
    explica: "Tags como main, nav e header funcionam como landmarks, permitindo navegar a página por regiões."
  },
  {
    q: "O que é a chamada \"div-soup\"?",
    opts: [
      "Um framework de CSS",
      "Resolver toda a estrutura com divs aninhadas, sem tags semânticas",
      "Uma tag nova do HTML5",
      "Um leitor de tela"
    ],
    correta: 1,
    explica: "É o antipadrão de montar tudo com divs genéricas — funciona visualmente, mas perde significado."
  },
  {
    q: "Qual elemento fecha uma página ou seção com informações de rodapé (créditos, contato)?",
    opts: ["footer", "aside", "bottom", "end"],
    correta: 0,
    explica: "footer fecha a página ou uma seção com informações de rodapé, como créditos e links legais."
  },
];

const letras = ["A", "B", "C", "D"];
let atual = 0;
const respostas = new Array(perguntas.length).fill(null);

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function renderQuestao() {
  const p = perguntas[atual];
  const total = perguntas.length;

  document.getElementById('progLabel').textContent = `Questão ${atual + 1} de ${total}`;
  document.getElementById('progFill').style.width = ((atual + 1) / total * 100) + '%';
  document.getElementById('enunciado').textContent = p.q;

  document.getElementById('opcoes').innerHTML = p.opts.map((opt, i) => `
    <div class="quiz-opt${respostas[atual] === i ? ' sel' : ''}" onclick="escolher(${i})">
      <span class="letter">${letras[i]}</span> ${esc(opt)}
    </div>`).join('');

  document.getElementById('btnAnt').disabled = atual === 0;
  const btnProx = document.getElementById('btnProx');
  btnProx.textContent = atual === total - 1 ? 'Finalizar ✓' : 'Próxima →';
}

function escolher(i) {
  respostas[atual] = i;
  renderQuestao();
}

function ant() {
  if (atual > 0) { atual--; renderQuestao(); }
}

function prox() {
  if (atual < perguntas.length - 1) { atual++; renderQuestao(); }
  else finalizar();
}

function finalizar() {
  const total = perguntas.length;
  const acertos = respostas.filter((r, i) => r === perguntas[i].correta).length;
  const pct = Math.round(acertos / total * 100);
  const nivel = pct >= 70 ? 'bom' : pct >= 50 ? 'medio' : 'ruim';
  const msg = pct >= 70
    ? 'Muito bem! Você domina os pontos principais desta aula.'
    : pct >= 50
      ? 'Quase lá — revise os pontos que errou e tente de novo.'
      : 'Vale reassistir a aula e revisar o Caderno antes de refazer.';

  const gabarito = perguntas.map((p, i) => {
    const acertou = respostas[i] === p.correta;
    const suaResp = respostas[i] == null ? 'Não respondida' : `${letras[respostas[i]]}) ${p.opts[respostas[i]]}`;
    const certa = `${letras[p.correta]}) ${p.opts[p.correta]}`;
    return `
      <div class="gab-item ${acertou ? 'acerto' : 'erro'}">
        <div class="gab-q">${i + 1}. ${esc(p.q)}</div>
        ${acertou
          ? `<div class="gab-line certa">✔ Você acertou: ${esc(certa)}</div>`
          : `<div class="gab-line sua-errada">✘ Sua resposta: ${esc(suaResp)}</div>
             <div class="gab-line certa">✔ Correta: ${esc(certa)}</div>`}
        <div class="gab-explica">${esc(p.explica)}</div>
      </div>`;
  }).join('');

  document.getElementById('quizArea').style.display = 'none';
  const area = document.getElementById('resultArea');
  area.style.display = 'block';
  area.innerHTML = `
    <div class="result-head">
      <div class="result-score ${nivel}">${pct}%</div>
      <div class="result-frac">Você acertou ${acertos} de ${total} questões</div>
      <div class="result-msg">${msg}</div>
    </div>
    <h2 class="gabarito-title">Gabarito comentado</h2>
    ${gabarito}
    <div class="result-actions">
      <button class="btn btn-ghost" onclick="refazer()">↻ Refazer</button>
      <a class="btn btn-primary" href="index.html" style="text-decoration:none;">Voltar ao curso</a>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refazer() {
  atual = 0;
  respostas.fill(null);
  document.getElementById('resultArea').style.display = 'none';
  document.getElementById('quizArea').style.display = 'block';
  renderQuestao();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

renderQuestao();
