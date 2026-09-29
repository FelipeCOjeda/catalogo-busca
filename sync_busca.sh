#!/bin/bash
# Sincroniza o catálogo do backup (Bitcoin e Liberdade) com o site de busca no GitHub Pages.
# Roda depois do catalogo.py regenerar o dados.js. Se o catálogo mudou, regenera os
# embeddings e publica no GitHub.
set -euo pipefail

BACKUP_DADOS="/home/felipe/Backups/bitcoineliberdade/catalogo/dados.js"
REPO="/home/felipe/Bots/catalogo-busca"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') [sync-busca] $*"; }

if [ ! -f "$BACKUP_DADOS" ]; then
  log "dados.js do backup não encontrado; abortando"
  exit 1
fi

cd "$REPO" || { log "repositório não encontrado"; exit 1; }

# atualiza o catálogo no repositório
cp "$BACKUP_DADOS" "$REPO/dados.js"

# se o catálogo não mudou em relação ao que está versionado, não faz nada
if git diff --quiet -- dados.js; then
  log "catálogo inalterado; nada a publicar"
  exit 0
fi

log "catálogo mudou; regenerando embeddings…"
[ -d node_modules ] || npm install --silent
node build_embeddings.mjs

git add dados.js embeddings.js
git commit -q -m "atualiza catálogo e embeddings ($(date '+%Y-%m-%d %H:%M'))"
git push -q
log "publicado com sucesso"
