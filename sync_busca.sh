#!/bin/bash
# Sincroniza catálogo de vídeos + artigos do Substack com o site de busca no GitHub Pages.
set -euo pipefail

BACKUP_DADOS="/home/felipe/Backups/bitcoineliberdade/catalogo/dados.js"
BACKUP_DIR="/home/felipe/Backups/bitcoineliberdade"
REPO="/home/felipe/Bots/catalogo-busca"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') [sync-busca] $*"; }

[ -f "$BACKUP_DADOS" ] || { log "dados.js não encontrado; abortando"; exit 1; }
cd "$REPO" || { log "repositório não encontrado"; exit 1; }

# 1) catálogo de vídeos
cp "$BACKUP_DADOS" dados.js

# 2) artigos do Substack (com cache de 6h pra não raspar a cada hora)
if [ ! -f textos.js ] || [ $(( $(date +%s) - $(stat -c %Y textos.js) )) -gt 21600 ]; then
  (cd "$BACKUP_DIR" && python3 coletar_substack.py >> /tmp/coletar_substack.log 2>&1)
fi

# se nada mudou, não regenera embeddings nem publica
if git diff --quiet; then
  log "nada mudou; nada a publicar"
  exit 0
fi

log "mudanças detectadas; regenerando embeddings…"
[ -d node_modules ] || npm install --silent
node build_embeddings.mjs
node build_embeddings_textos.mjs

git add -A
git commit -q -m "atualiza catálogo, artigos e embeddings ($(date '+%Y-%m-%d %H:%M'))"
git push -q
log "publicado com sucesso"

# compartilha os itens novos nas redes sociais (Telegram + Buffer + WhatsApp)
cd "$BACKUP_DIR" && python3 compartilhar_redes.py >> compartilhar.log 2>&1
