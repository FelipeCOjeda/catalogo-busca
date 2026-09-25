# Busca — Bitcoin e Liberdade

Página estática (GitHub Pages) para pesquisar temas nos vídeos do canal **Bitcoin e Liberdade**.

## Como funciona

- **Busca por texto** (padrão): pesquisa em títulos, tags e na transcrição dos vídeos. Roda 100% no navegador, sem servidor.
- **Busca semântica (IA)**: usa embeddings gerados no navegador pelo [Transformers.js](https://huggingface.co/docs/transformers.js) (modelo `Xenova/paraphrase-multilingual-MiniLM-L12-v2`) para achar vídeos por significado, mesmo sem as palavras exatas. O modelo baixa na primeira vez que você ativa a busca semântica (~120 MB, fica em cache depois).

## Arquivos

- `index.html` — a página de busca.
- `dados.js` — catálogo (títulos, tags, transcrições, links). Gerado pelo projeto de backup do canal.
- `embeddings.js` — vetores semânticos dos 608 vídeos. Gerado por `build_embeddings.mjs`.
- `build_embeddings.mjs` — gera os embeddings com o Transformers.js (Node.js).

## Regenerar os embeddings

Quando entrar vídeo novo no catálogo, rode:

```bash
npm install
node build_embeddings.mjs
git add dados.js embeddings.js
git commit -m "atualiza catálogo e embeddings"
git push
```

O script lê `dados.js` e escreve `embeddings.js`. O modelo usado é o mesmo da busca semântica no navegador, então consulta e vídeos ficam no mesmo espaço vetorial.
