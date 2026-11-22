# Tecnologia

## Decisão

**Site estático: HTML + CSS + JavaScript puro, dados em JSON, hospedado no GitHub Pages, com repositório aberto.**

Por quê:
- **Zero build e zero dependências:** qualquer iniciante da comunidade abre o código e entende.
- **Grátis:** o GitHub Pages hospeda sem custo e o site ganha uma URL pública.
- **Contribuição fácil:** adicionar um livro é editar um arquivo e abrir um PR.
- **Dá pra crescer:** se um dia precisar de busca, SEO ou páginas por livro, migra para Astro reaproveitando o mesmo JSON.

## Estrutura de pastas

```
acelera-le/
├── index.html
├── css/
│   └── estilo.css
├── js/
│   └── app.js
├── dados/
│   ├── estantes.json      ← fonte dos dados
│   └── estantes.js        ← cópia gerada (para abrir com dois cliques)
├── ferramentas/
│   └── gerar-estantes-js.js
├── docs/
│   ├── produto.md
│   ├── tecnologia.md
│   ├── nome.md
│   └── estantes/
│       ├── java.md
│       ├── python.md
│       ├── javascript.md
│       ├── ia.md
│       ├── engenharia-de-software.md
│       ├── banco-de-dados.md
│       ├── carreira.md
│       ├── devops.md
│       ├── design-system.md
│       └── proximas.md
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── sugerir-livro.yml
├── CLAUDE.md
├── CONTRIBUTING.md
└── README.md
```

## Formato de `dados/estantes.json`

```json
{
  "estantes": [
    {
      "id": "java",
      "nome": "Java",
      "descricao": "Da primeira classe até a JVM em produção.",
      "livros": [
        {
          "degrau": 1,
          "titulo": "Use a Cabeça! Java",
          "tituloOriginal": "Head First Java",
          "autores": ["Kathy Sierra", "Bert Bates"],
          "nivel": "iniciante",
          "porque": "Didática visual; ensina orientação a objetos e a linguagem do zero.",
          "edicaoPt": { "status": "sim", "editora": "Alta Books" },
          "link": null,
          "gratuito": false,
          "cor": "#C0392B"
        }
      ]
    }
  ]
}
```

- `nivel`: `"iniciante" | "intermediario" | "avancado"` (livros de transição, como 🟢→🟡, usam o nível mais alto)
- `edicaoPt.status`: `"sim" | "nao" | "confirmar" | "original"` (livro escrito em PT)
- `edicaoPt.nota` (opcional): anotação da curadoria, mostrada quando o status é `"confirmar"`
- `subtitulo` (opcional): aparece no painel; a lombada mostra só o `titulo`, para caber
- **Preferência da curadoria:** sempre que existir, use o título e a edição em português do Brasil

## Abrir com dois cliques (`file://`)

Aberto direto do disco, o navegador bloqueia o `fetch` do JSON. Por isso o `app.js` tenta o JSON primeiro e, se falhar, usa `dados/estantes.js`, uma cópia gerada.

Depois de editar o `estantes.json`, rode:

```
node ferramentas/gerar-estantes-js.js
```

O script também confere se nenhuma estante passou de 7 livros e se os degraus estão em ordem.

## Progresso no navegador

- Chave: `acelera-le:lidos` → array de ids `"java-1"`, `"python-3"`…
- Toda leitura e escrita dentro de `try/catch`.

## Publicação

1. Criar o repositório (ex.: `acelera-le`) na conta/organização da Acelera Dev.
2. Settings → Pages → Deploy from branch `main`, pasta `/`.
3. URL: `https://<org>.github.io/acelera-le/`
