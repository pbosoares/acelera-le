/* =========================================================
   Acelera Lê! · app.js
   Lê os livros de dados/estantes.json e desenha as estantes.
   Sem framework e sem build: é só abrir o index.html.

   Roteiro do arquivo:
   1) Configuração
   2) Progresso (localStorage)
   3) Carregar os dados
   4) Desenhar chips e estantes
   5) Painel de detalhes
   5b) Pesquisa visual de livros
   6) Sugerir livro e zerar progresso
   7) Começo de tudo
   ========================================================= */

// ---------- 1) Configuração ----------

// Endereço do repositório no GitHub (usado no rodapé e no "Sugerir livro").
const REPOSITORIO = "https://github.com/pbosoares/acelera-le";

// Nome do arquivo do modelo de issue em .github/ISSUE_TEMPLATE/
const MODELO_SUGESTAO = "sugerir-livro.yml";

// Busca da loja usada no botão "Buscar na Amazon" do painel (sem link de afiliado)
const LOJA_BUSCA = "https://www.amazon.com.br/s";

// Chave usada no localStorage (formato descrito em docs/tecnologia.md)
const CHAVE_LIDOS = "acelera-le:lidos";

// A mesma largura usada no CSS (@media max-width: 720px)
const CELULAR = window.matchMedia("(max-width: 720px)");

const NOMES_NIVEL = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

// Estado da página
let estantes = [];          // lista que veio do JSON
let lidos = new Set();      // ids dos livros lidos, ex.: "java-1"
let estanteAtiva = 0;       // índice da estante em destaque (no celular, a única visível)
let livroAberto = null;     // { estante, livro } aberto no painel
let lombadaQueAbriu = null; // para devolver o foco ao fechar o painel

// Atalho para buscar elementos pelo id
const $ = (id) => document.getElementById(id);

// Id único de cada livro: "<estante>-<degrau>"
const idDoLivro = (estante, livro) => `${estante.id}-${livro.degrau}`;

// ---------- 2) Progresso (localStorage) ----------
// Tudo dentro de try/catch: em aba anônima ou com o armazenamento
// bloqueado, o site continua funcionando, só não lembra o progresso.

function carregarLidos() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_LIDOS) || "[]");
    if (Array.isArray(salvo)) lidos = new Set(salvo);
  } catch (erro) {
    lidos = new Set();
  }
}

function salvarLidos() {
  try {
    localStorage.setItem(CHAVE_LIDOS, JSON.stringify([...lidos]));
  } catch (erro) {
    // Sem armazenamento: segue a vida, o progresso vale só até fechar a aba.
  }
}

// ---------- 3) Carregar os dados ----------

async function carregarDados() {
  // Caminho principal: o JSON (funciona em servidor e no GitHub Pages).
  try {
    const resposta = await fetch("dados/estantes.json");
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return await resposta.json();
  } catch (erro) {
    // Plano B: aberto com dois cliques (file://), o navegador bloqueia o fetch.
    // Aí usamos a cópia carregada por dados/estantes.js.
    if (window.ACELERA_LE_DADOS) return window.ACELERA_LE_DADOS;
    throw erro;
  }
}

// ---------- 4) Desenhar chips e estantes ----------

// Cria um elemento com classe e texto em uma linha só
function criar(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

// Junta autores no jeito brasileiro: "A, B e C"
function juntarAutores(autores) {
  if (autores.length <= 1) return autores.join("");
  return `${autores.slice(0, -1).join(", ")} e ${autores[autores.length - 1]}`;
}

// Um número "aleatório" fixo a partir de um texto, para que cada livro
// tenha sempre o mesmo tamanho (a estante não muda a cada visita).
function numeroDoTexto(texto) {
  let soma = 0;
  for (const letra of texto) soma = (soma * 31 + letra.charCodeAt(0)) % 1000;
  return soma;
}

function desenharChips() {
  const lista = $("temas");
  lista.innerHTML = "";

  estantes.forEach((estante, indice) => {
    const item = criar("li");
    const chip = criar("button", "chip", estante.nome);
    chip.type = "button";
    chip.dataset.indice = indice;
    chip.addEventListener("click", () => irParaEstante(indice));
    item.append(chip);
    lista.append(item);
  });
}

function desenharLombada(estante, livro, total) {
  const id = idDoLivro(estante, livro);
  const n = numeroDoTexto(livro.titulo);

  const botao = criar("button", `lombada lombada--${livro.nivel}`);
  botao.type = "button";
  botao.dataset.id = id;
  botao.style.setProperty("--cor", livro.cor);
  // Altura entre 290px e 340px; títulos longos ganham lombada mais grossa
  botao.style.setProperty("--altura", `${290 + (n % 51)}px`);
  botao.style.setProperty("--largura", `${(livro.titulo.length > 26 ? 100 : 86) + (n % 10)}px`);

  // Partes visuais (o leitor de tela usa o aria-label, mais abaixo)
  const fita = criar("span", "lombada__fita");
  const degrau = criar("span", "lombada__degrau", livro.degrau);
  const titulo = criar("span", "lombada__titulo", livro.titulo);
  const autor = criar("span", "lombada__autor", juntarAutores(livro.autores));
  const check = criar("span", "lombada__check", "✓");
  const nivel = criar("span", "lombada__nivel");
  for (const parte of [fita, degrau, titulo, autor, check, nivel]) {
    parte.setAttribute("aria-hidden", "true");
  }
  botao.append(fita, degrau, titulo, autor, check, nivel);

  botao.addEventListener("click", () => abrirPainel(estante, livro, botao));

  atualizarLombada(botao, estante, livro, total);
  return botao;
}

// Liga/desliga a fita de "lido" e refaz o rótulo acessível
function atualizarLombada(botao, estante, livro, total) {
  const lido = lidos.has(idDoLivro(estante, livro));
  botao.classList.toggle("lombada--lido", lido);
  botao.setAttribute(
    "aria-label",
    `Degrau ${livro.degrau} de ${total}, ${NOMES_NIVEL[livro.nivel]}: ` +
      `${livro.titulo}, de ${juntarAutores(livro.autores)}${lido ? ". Lido" : ""}`
  );
}

function desenharEstantes() {
  const area = $("estantes");
  area.innerHTML = "";

  estantes.forEach((estante, indice) => {
    const secao = criar("section", "estante");
    secao.id = estante.id;
    secao.dataset.indice = indice;
    secao.setAttribute("aria-labelledby", `nome-${estante.id}`);

    // Cabeçalho: nome, descrição e progresso
    const cabecalho = criar("div", "estante__cabecalho");
    const textos = criar("div");
    const nome = criar("h2", "estante__nome", estante.nome);
    nome.id = `nome-${estante.id}`;
    textos.append(nome, criar("p", "estante__descricao", estante.descricao));

    const progresso = criar("div", "progresso");
    const contagem = criar("span", "progresso__texto");
    const barra = criar("div", "progresso__barra");
    barra.setAttribute("aria-hidden", "true");
    barra.append(criar("div", "progresso__preenchido"));
    // "2 encontrados": só aparece durante a pesquisa (ver aplicarBusca)
    const achados = criar("span", "estante__achados");
    achados.hidden = true;
    progresso.append(achados, contagem, barra);

    cabecalho.append(textos, progresso);

    // A prateleira com as lombadas (lista ordenada: a ordem importa!)
    const prateleira = criar("div", "prateleira");
    const lista = criar("ol", "prateleira__livros");
    lista.setAttribute("aria-label", `Livros de ${estante.nome}, do iniciante ao avançado`);
    estante.livros.forEach((livro) => {
      const item = criar("li");
      item.append(desenharLombada(estante, livro, estante.livros.length));
      lista.append(item);
    });
    prateleira.append(lista, criar("div", "prateleira__tabua"));

    secao.append(cabecalho, prateleira);
    area.append(secao);
    atualizarProgresso(indice);
  });

  // Se já havia algo digitado na pesquisa, as lombadas novas seguem o filtro
  aplicarBusca();
}

// Atualiza o "3/7 lidos" e a barrinha de uma estante
function atualizarProgresso(indice) {
  const estante = estantes[indice];
  const secao = $(estante.id);
  const total = estante.livros.length;
  const feitos = estante.livros.filter((livro) => lidos.has(idDoLivro(estante, livro))).length;

  secao.querySelector(".progresso__texto").textContent = `${feitos}/${total} lidos`;
  secao.querySelector(".progresso__preenchido").style.width = `${(feitos / total) * 100}%`;
}

// Marca o chip ativo e, no celular, mostra só a estante escolhida
function marcarEstanteAtiva(indice) {
  estanteAtiva = indice;
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("aria-current", String(Number(chip.dataset.indice) === indice));
  });
  document.querySelectorAll(".estante").forEach((secao) => {
    secao.classList.toggle("estante--ativa", Number(secao.dataset.indice) === indice);
  });
}

function irParaEstante(indice) {
  marcarEstanteAtiva(indice);
  const secao = $(estantes[indice].id);
  history.replaceState(null, "", `#${estantes[indice].id}`);

  if (!CELULAR.matches) {
    // Desktop: todas as estantes estão empilhadas, então rolamos até ela
    secao.scrollIntoView({ block: "start" });
  }
}

// No desktop, o chip acompanha a estante que está na tela durante a rolagem
function acompanharRolagem() {
  if (!("IntersectionObserver" in window)) return;
  const observador = new IntersectionObserver(
    (entradas) => {
      if (CELULAR.matches) return;
      for (const entrada of entradas) {
        if (entrada.isIntersecting) marcarEstanteAtiva(Number(entrada.target.dataset.indice));
      }
    },
    { rootMargin: "-40% 0px -55% 0px" } // conta como "na tela" a faixa do meio
  );
  document.querySelectorAll(".estante").forEach((secao) => observador.observe(secao));
}

// ---------- 5) Painel de detalhes ----------

function textoEdicao(edicao) {
  switch (edicao.status) {
    case "sim":
      return edicao.editora ? `Sim (${edicao.editora})` : "Sim";
    case "nao":
      return "Não";
    case "original":
      return "Sim: o livro foi escrito em português";
    default:
      // "confirmar": mostramos a anotação da curadoria, sem inventar
      return edicao.nota || "A confirmar";
  }
}

// Busca direcionada na loja: título + primeiro autor, sem inventar URL de produto.
// Tiramos "2ª ed." do título e o "et al." do autor, que atrapalham a busca.
function linkBusca(livro) {
  const titulo = livro.titulo.replace(/,?\s*\d+ª ed\.?/, "");
  const autor = livro.autores[0].replace(/\s*et al\.?/, "");
  const parametros = new URLSearchParams({ k: `${titulo} ${autor}`, i: "stripbooks" });
  return `${LOJA_BUSCA}?${parametros}`;
}

function abrirPainel(estante, livro, botao) {
  livroAberto = { estante, livro };
  if (botao) lombadaQueAbriu = botao;
  preencherPainel();

  const painel = $("painel");
  if (!painel.open) painel.showModal();
}

function preencherPainel() {
  const { estante, livro } = livroAberto;
  const total = estante.livros.length;
  const painel = $("painel");
  const lido = lidos.has(idDoLivro(estante, livro));

  painel.style.setProperty("--cor", livro.cor);
  painel.style.setProperty("--cor-nivel", `var(--${livro.nivel})`);

  $("painel-degrau").textContent = `Degrau ${livro.degrau} de ${total} · ${NOMES_NIVEL[livro.nivel]}`;
  $("painel-titulo").textContent = livro.titulo;
  $("painel-subtitulo").textContent = livro.subtitulo || "";
  $("painel-subtitulo").hidden = !livro.subtitulo;
  $("painel-original").textContent = livro.tituloOriginal ? `Título original: ${livro.tituloOriginal}` : "";
  $("painel-original").hidden = !livro.tituloOriginal;
  $("painel-autores").textContent = juntarAutores(livro.autores);
  $("painel-porque").textContent = livro.porque;

  // Edição em PT, com selo quando ainda falta um humano confirmar
  const edicao = $("painel-edicao");
  edicao.textContent = textoEdicao(livro.edicaoPt);
  if (livro.edicaoPt.status === "confirmar") {
    edicao.append(criar("span", "selo-confirmar", "a confirmar"));
  }

  // Link oficial (só quando existe)
  const areaLink = $("painel-link-area");
  areaLink.hidden = !livro.link;
  if (livro.link) {
    $("painel-link").href = livro.link;
    $("painel-link").textContent = livro.gratuito
      ? "Ler gratuitamente no site oficial ↗"
      : "Site oficial ↗";
  }

  // Onde encontrar: busca na loja por título e autor
  $("painel-comprar").href = linkBusca(livro);
  $("painel-comprar").setAttribute("aria-label", `Buscar ${livro.titulo} na Amazon (abre em nova aba)`);

  const botaoLido = $("painel-lido");
  botaoLido.textContent = lido ? "✓ Lido · desmarcar" : "Marcar como lido";
  botaoLido.setAttribute("aria-pressed", String(lido));

  const posicao = estante.livros.indexOf(livro);
  $("painel-anterior").disabled = posicao === 0;
  $("painel-proximo").disabled = posicao === total - 1;
}

function fecharPainel() {
  $("painel").close();
}

// Vai para o livro anterior (-1) ou próximo (+1) da mesma estante
function navegarNoPainel(passo) {
  const { estante, livro } = livroAberto;
  const novo = estante.livros[estante.livros.indexOf(livro) + passo];
  if (!novo) return;
  // O foco volta para a lombada do livro que estiver aberto no fim
  lombadaQueAbriu = document.querySelector(`[data-id="${idDoLivro(estante, novo)}"]`);
  abrirPainel(estante, novo);
}

function alternarLido() {
  const { estante, livro } = livroAberto;
  const id = idDoLivro(estante, livro);

  if (lidos.has(id)) lidos.delete(id);
  else lidos.add(id);
  salvarLidos();

  const botao = document.querySelector(`[data-id="${id}"]`);
  atualizarLombada(botao, estante, livro, estante.livros.length);
  atualizarProgresso(estantes.indexOf(estante));
  preencherPainel();
  avisar(lidos.has(id) ? `${livro.titulo} marcado como lido` : `${livro.titulo} desmarcado`);
}

// Fala com o leitor de tela sem mexer no foco
function avisar(mensagem) {
  $("aviso").textContent = mensagem;
}

function prepararPainel() {
  const painel = $("painel");

  painel.querySelector("[data-fechar]").addEventListener("click", fecharPainel);
  $("painel-lido").addEventListener("click", alternarLido);
  $("painel-anterior").addEventListener("click", () => navegarNoPainel(-1));
  $("painel-proximo").addEventListener("click", () => navegarNoPainel(1));

  // Clique fora (no fundo escurecido) fecha. O fundo pertence ao próprio <dialog>.
  painel.addEventListener("click", (evento) => {
    if (evento.target === painel) fecharPainel();
  });

  // Setas ← → também trocam de livro com o painel aberto
  painel.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowLeft") navegarNoPainel(-1);
    if (evento.key === "ArrowRight") navegarNoPainel(1);
  });

  // O Esc já fecha o <dialog> sozinho. Ao fechar, o foco volta para a lombada.
  // Só mostramos o contorno de foco se a pessoa está usando o teclado
  // (no celular, depois de um toque, o contorno aparecia sem necessidade).
  painel.addEventListener("close", () => {
    if (lombadaQueAbriu) {
      lombadaQueAbriu.focus({ preventScroll: true, focusVisible: usandoTeclado });
    }
    livroAberto = null;
  });
}

// Descobre se a pessoa está navegando pelo teclado ou por toque/mouse
let usandoTeclado = false;
document.addEventListener("keydown", () => { usandoTeclado = true; });
document.addEventListener("pointerdown", () => { usandoTeclado = false; });

// ---------- 5b) Pesquisa visual de livros ----------
// Nada sai do lugar: quem não bate com a pesquisa só ganha a classe
// "lombada--apagada" (escuro + blur). Quem bate fica como sempre, e a estante
// dele (a mesma do JSON) ganha destaque, junto com o chip do tema.

// Minúsculas e sem acento: "ação" e "ACAO" são o mesmo texto
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Só campos que existem no JSON: títulos, autores e o "porque" da curadoria
function textoPesquisavel(livro) {
  const partes = [livro.titulo, livro.subtitulo, livro.tituloOriginal, ...livro.autores, livro.porque];
  return normalizar(partes.filter(Boolean).join(" "));
}

function aplicarBusca() {
  const campo = $("busca");
  if (!campo || estantes.length === 0) return;

  // Cada palavra digitada precisa aparecer no livro (ordem não importa)
  const termos = normalizar(campo.value).split(/\s+/).filter(Boolean);
  const pesquisando = termos.length > 0;
  const achadosPorEstante = estantes.map(() => 0);

  estantes.forEach((estante, indice) => {
    for (const livro of estante.livros) {
      const bate = pesquisando && termos.every((termo) => textoPesquisavel(livro).includes(termo));
      document
        .querySelector(`[data-id="${idDoLivro(estante, livro)}"]`)
        .classList.toggle("lombada--apagada", pesquisando && !bate);
      if (bate) achadosPorEstante[indice]++;
    }

    const n = achadosPorEstante[indice];
    const secao = $(estante.id);
    secao.classList.toggle("estante--achada", n > 0);

    const selo = secao.querySelector(".estante__achados");
    selo.hidden = n === 0;
    selo.textContent = n === 1 ? "1 encontrado" : `${n} encontrados`;

    const chip = document.querySelector(`.chip[data-indice="${indice}"]`);
    chip.classList.toggle("chip--achado", n > 0);
    if (n > 0) chip.setAttribute("aria-label", `${estante.nome}, ${selo.textContent}`);
    else chip.removeAttribute("aria-label");
  });

  // No celular só uma estante aparece por vez: se a atual não tem resultado,
  // vamos para a primeira que tem (os livros continuam nas mesmas estantes).
  const primeira = achadosPorEstante.findIndex((n) => n > 0);
  if (pesquisando && CELULAR.matches && primeira >= 0 && achadosPorEstante[estanteAtiva] === 0) {
    marcarEstanteAtiva(primeira);
  }

  const total = achadosPorEstante.reduce((soma, n) => soma + n, 0);

  // Com resultados, as estantes sem nenhum livro encontrado ficam escondidas
  // (e o chip delas também). É só visual: o catálogo e a ordem não mudam.
  // Sem nenhum resultado, nada é escondido: todos os livros só ficam apagados.
  estantes.forEach((estante, indice) => {
    const ocultar = pesquisando && total > 0 && achadosPorEstante[indice] === 0;
    $(estante.id).classList.toggle("estante--oculta", ocultar);
    document.querySelector(`.chip[data-indice="${indice}"]`).parentElement.hidden = ocultar;
  });

  if (!pesquisando) avisar("");
  else if (total === 0) avisar("Nenhum livro encontrado.");
  else avisar(total === 1 ? "1 livro encontrado." : `${total} livros encontrados.`);
}

function prepararBusca() {
  const campo = $("busca");
  campo.addEventListener("input", aplicarBusca);
  // Esc limpa a pesquisa (alguns navegadores já fazem isso sozinhos)
  campo.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && campo.value) {
      campo.value = "";
      aplicarBusca();
    }
  });
}

// ---------- 6) Sugerir livro e zerar progresso ----------

// Monta o link de "nova issue" já com o modelo e a estante preenchidos
function linkSugestao(nomeEstante) {
  const parametros = new URLSearchParams({ template: MODELO_SUGESTAO });
  if (nomeEstante) parametros.set("estante", nomeEstante);
  return `${REPOSITORIO}/issues/new?${parametros}`;
}

function prepararRodape() {
  $("link-repositorio").href = REPOSITORIO;

  // O botão do rodapé sugere para a estante que está em destaque
  const sugerir = $("sugerir-livro");
  sugerir.href = linkSugestao();
  sugerir.addEventListener("click", () => {
    sugerir.href = linkSugestao(estantes[estanteAtiva] && estantes[estanteAtiva].nome);
  });

  $("zerar-progresso").addEventListener("click", () => {
    if (lidos.size === 0) {
      avisar("Você ainda não marcou nenhum livro.");
      return;
    }
    if (!confirm("Zerar seu progresso? Todos os livros voltam para \"não lido\".")) return;
    lidos.clear();
    salvarLidos();
    desenharEstantes();
    marcarEstanteAtiva(estanteAtiva);
    acompanharRolagem();
    avisar("Progresso zerado.");
  });
}

// ---------- 7) Começo de tudo ----------

async function iniciar() {
  carregarLidos();
  prepararPainel();

  try {
    const dados = await carregarDados();
    estantes = dados.estantes;
  } catch (erro) {
    $("estantes").innerHTML =
      '<p class="erro">Não foi possível carregar as estantes. Tente recarregar a página.</p>';
    console.error("Erro ao carregar dados/estantes.json:", erro);
    return;
  }

  desenharChips();
  desenharEstantes();
  prepararRodape();
  prepararBusca();
  acompanharRolagem();

  // Se o endereço já tem #java, #python… começa por essa estante
  const pedida = estantes.findIndex((estante) => `#${estante.id}` === location.hash);
  marcarEstanteAtiva(pedida >= 0 ? pedida : 0);
  if (pedida >= 0 && !CELULAR.matches) $(estantes[pedida].id).scrollIntoView();
}

iniciar();
