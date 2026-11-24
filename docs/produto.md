# Produto e visual

## Ideia central

Uma **biblioteca**: a página mostra uma prateleira de madeira por tema. Em cada prateleira ficam até 7 **lombadas** de livros, da esquerda (iniciante) para a direita (avançado). A pessoa bate o olho e entende o caminho.

## Paleta "Papel e tinta"

Identidade própria, diferente do site da Acelera Dev: fundo creme de papel `#F6F1E7`, texto em tinta azul-marinho `#1E1B3A`, destaque terracota `#B04632` (texto e botões; `#C8553D` só decorativo) e azul-tinta `#2E4A7D` de apoio. Títulos em Fraunces (serifada), texto em Inter, rótulos em IBM Plex Mono. Contraste conferido no WCAG AA.

## Página

- **Topo:** logo "Acelera Lê!", subtítulo "A estante de leitura da Acelera Dev" e uma frase curta explicando o roadmap.
- **Navegação por tema:** chips/abas com os temas (Lógica de Programação, Java, Python, JavaScript / Front-end, IA, Engenharia de Software, Banco de Dados, DevOps, Design System, Carreira). No desktop, todas as prateleiras aparecem empilhadas com rolagem e os chips levam até a prateleira. No celular, uma estante por vez.
- **Legenda de níveis:** 🟢 Iniciante · 🟡 Intermediário · 🔴 Avançado.
- **Rodapé:** "Feito para a comunidade Acelera Dev - Autor: Pablo Soares" e os contribuidores (Lucas Bizoni), link do repositório e o botão "Sugerir livro".

## Título

Acabamento de folha de rosto de livro: o nome fica numa placa de papel claro com borda dourada dupla e pontinhos dourados nos cantos. "Acelera" em tinta com leve relevo de impressão, "Lê!" em itálico com degradê de terracota, um fleurão dourado (❦) entre dois filetes logo abaixo, subtítulo em Fraunces itálico e selo "Acelera Dev · Roadmaps de leitura" com borda dourada dupla.

## Enfeites do topo

Objetos de leitura e programação flutuando em volta do título, desenhados só com CSS (`css/enfeites.css`), sem imagens: dois livros 3D girando devagar, livro aberto, óculos de leitura, xícara de café com vapor, marcador de página, lápis, pilha de livros e os símbolos `</>`, `{ }`, `>_` e `;`.

- Ficam nas laterais e nunca passam por trás do texto (contraste continua AA).
- São decoração: `aria-hidden` e sem cliques.
- Telas médias mostram menos enfeites; no celular, 4 pequenos numa faixa acima do selo.
- Com "reduzir movimento", tudo fica parado.

## Prateleira

Cada estante é um móvel de madeira: tábua em cima, colunas laterais, painel de fundo com veios e uma tábua grossa embaixo (tampo claro e borda escura). Cada livro tem uma sombrinha embaixo, como se estivesse apoiado. Na pesquisa, a estante com resultado ganha um contorno terracota.

## Lombada (cada livro)

- Retângulo vertical, com altura e largura levemente diferentes entre os livros, para parecer uma estante real.
- Filetes dourados em cima e embaixo, como nos livros de capa dura.
- Cor de fundo própria por livro (paleta definida no JSON).
- **Título na horizontal**, quebrando em várias linhas para ler sem virar a cabeça, e autor em letra menor na base.
- **Capa 3D**: ao passar o mouse (ou focar pelo teclado) a capa abre como uma porta presa na lombada, mostrando nível, título, subtítulo e autor. No celular, o 1º toque abre a capa e o 2º abre os detalhes. A capa é desenhada em CSS (sem imagem de capa real).
- No celular, a prateleira rola para o lado para as lombadas terem largura de leitura.
- **Número do degrau** (1–7) num selo no topo.
- **Faixa de nível** na base: verde, amarela ou vermelha.
- Hover/foco: o livro "sai" um pouco da prateleira (translateY + sombra).
- Livro lido: uma **fita marcadora** pendurada no topo e um ✓ discreto.

## Painel de detalhes (ao clicar)

Abre um painel lateral no desktop e uma gaveta de baixo para cima no celular. Mostra:
- Título, autor e ano/edição recomendada
- Nível + posição ("Degrau 3 de 7 · Intermediário")
- **Por que está aqui:** o motivo do degrau
- **Edição em português:** Sim (editora) / Não / Confirmar
- Link (site da editora ou versão gratuita oficial, quando houver)
- Botão **"Marcar como lido"** / "Desmarcar"
- Navegação ← anterior / próximo → dentro da estante
- `Esc` ou clique fora fecha

## Pesquisa

- Campo de pesquisa acima dos chips: procura por título, subtítulo, título original, autor e no "por que está aqui", sem diferenciar acentos nem maiúsculas.
- Nada muda de lugar: os livros que não batem ficam apagados, a estante com resultado acende e o chip dela ganha um pontinho; estantes sem resultado somem enquanto houver pesquisa.
- `Esc` limpa a pesquisa.

## Onde encontrar

- O painel tem o botão "Buscar na Amazon", que abre uma busca por título e autor (sem link de afiliado e sem URL de produto inventada).

## Progresso

- Cada prateleira mostra "**3/7 lidos**" com uma barrinha.
- Salvo no `localStorage` do navegador (sem login, sem servidor). Se o localStorage falhar, o site continua funcionando, só não lembra o progresso.
- Botão "Zerar meu progresso" no rodapé.
- **Levar para outro aparelho** (rodapé): os lidos viram um código curto, como `logica.5~python.2`, ou um link `?progresso=...`. Abrir o link ou colar o código em outro navegador **soma** os lidos (nunca apaga). Sem login e sem servidor.

## Estatísticas de visita

- Vercel Web Analytics: anônimo e sem cookies, só no site publicado (no localhost nada é enviado).
- Além da página inicial, registra visitas virtuais `/estante/<id>` (ao escolher um tema ou chegar por link) e `/livro/<id>` (ao abrir um livro), para saber quais estantes e livros mais interessam.

## Sugerir livro

- Botão "Sugerir livro" abre uma **issue no GitHub** com template pré-preenchido: estante, título, autor, nível sugerido, motivo e se tem edição em PT.
- Moderadores da comunidade avaliam e, se aprovado, o livro entra no `.md` da estante e no JSON.
- Alternativa, se a comunidade não usa GitHub: link para um Google Forms.

## Fora do escopo do protótipo

Login, comentários, avaliações por estrelas e páginas individuais por livro. Ficam para depois, se fizer sentido.
