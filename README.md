# Busca — Bitcoin e Liberdade

Página estática (GitHub Pages) para pesquisar temas nos vídeos do canal **Bitcoin e Liberdade**.

## Como funciona

- **Busca por texto** (padrão): pesquisa em títulos, tags e na transcrição dos vídeos. Funciona 100% no navegador, sem servidor.
- **Busca semântica (IA)**: usa embeddings gerados pelo [Ollama](https://ollama.com) (modelo `nomic-embed-text`) para achar vídeos por significado, mesmo sem as palavras exatas. Precisa de um endpoint do Ollama acessível (ex.: rodando localmente, ou num servidor seu).

## Arquivos

- `index.html` — a página de busca.
- `dados.js` — catálogo (títulos, tags, transcrições, links). Gerado pelo projeto de backup do canal.
- `embeddings.js` — vetores semânticos dos vídeos. Gerado por `build_embeddings.py`.
- `build_embeddings.py` — script que gera os embeddings via Ollama.

## Regenerar os embeddings

```bash
ollama pull nomic-embed-text
ollama serve
python3 build_embeddings.py
```

O script lê `dados.js` e escreve `embeddings.js`.

## Busca semântica

Ative o botão **semântica (IA)** na página e informe o endpoint do Ollama (padrão `http://localhost:11434`). Sem endpoint acessível, a página volta sozinha para a busca por texto.
