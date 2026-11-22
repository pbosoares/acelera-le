# Produto e visual

## Ideia central

Uma **biblioteca**: a página mostra uma prateleira de madeira por tema. Em cada prateleira ficam até 7 **lombadas** de livros, da esquerda (iniciante) para a direita (avançado). A pessoa bate o olho e entende o caminho.

## Página

- **Topo:** logo "Acelera Lê!", subtítulo "A estante de leitura da Acelera Dev" e uma frase curta explicando o roadmap.
- **Navegação por tema:** chips/abas com os temas (Java, Python, JavaScript / Front-end, IA, Engenharia de Software, Banco de Dados, DevOps, Design System, Carreira). No desktop, todas as prateleiras aparecem empilhadas com rolagem e os chips levam até a prateleira. No celular, uma estante por vez.
- **Legenda de níveis:** 🟢 Iniciante · 🟡 Intermediário · 🔴 Avançado.
- **Rodapé:** "Feito para a comunidade Acelera Dev - Autor: Pablo Soares", link do repositório e o botão "Sugerir livro".

## Lombada (cada livro)

- Retângulo vertical, com altura e largura levemente diferentes entre os livros, para parecer uma estante real.
- Cor de fundo própria por livro (paleta definida no JSON).
- **Título escrito em pé** (`writing-mode: vertical-rl`) e autor em letra menor.
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

## Sugerir livro

- Botão "Sugerir livro" abre uma **issue no GitHub** com template pré-preenchido: estante, título, autor, nível sugerido, motivo e se tem edição em PT.
- Moderadores da comunidade avaliam e, se aprovado, o livro entra no `.md` da estante e no JSON.
- Alternativa, se a comunidade não usa GitHub: link para um Google Forms.

## Fora do escopo do protótipo

Login, comentários, avaliações por estrelas e páginas individuais por livro. Ficam para depois, se fizer sentido.
