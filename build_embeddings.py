#!/usr/bin/env python3
"""Gera embeddings semânticos do catálogo com o Ollama (nomic-embed-text).

Lê o catálogo (dados.js) e produz embeddings.js com window.EMBEDDINGS = {id: vetor}.
Cada vídeo é representado por título + tags + trecho inicial da transcrição.
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
DADOS = BASE / "dados.js"
OUT = BASE / "embeddings.js"
OLLAMA = "http://127.0.0.1:11434/api/embed"
MODEL = "nomic-embed-text"


def carregar_catalogo() -> list:
    raw = DADOS.read_text(encoding="utf-8").strip()
    prefix = "window.CATALOGO = "
    if raw.startswith(prefix):
        raw = raw[len(prefix):]
    raw = raw.rstrip().rstrip(";").rstrip()
    return json.loads(raw)


def embed(texts: list[str]) -> list[list[float]]:
    corpo = json.dumps({"model": MODEL, "input": texts}).encode()
    req = urllib.request.Request(OLLAMA, corpo, {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)["embeddings"]


def texto_para_embed(v: dict) -> str:
    titulo = (v.get("titulo") or "").strip()
    tags = " ".join((v.get("tags") or [])[:12])
    # remove marcadores de tempo do trecho da transcrição pra não poluir o embedding
    trecho = re.sub(r"\[[\d:]+\]\s*", " ", (v.get("transcricao") or "")[:400])
    return f"{titulo}. {tags}. {trecho}".strip()


def main() -> None:
    catalog = carregar_catalogo()
    print(f"{len(catalog)} vídeos", flush=True)

    embs: dict[str, list[float]] = {}
    BATCH = 8
    for i in range(0, len(catalog), BATCH):
        chunk = catalog[i:i + BATCH]
        try:
            vecs = embed([texto_para_embed(v) for v in chunk])
        except Exception as e:
            print(f"erro no lote {i}: {e}", file=sys.stderr, flush=True)
            time.sleep(3)
            continue
        for v, vec in zip(chunk, vecs):
            embs[v["id"]] = vec
        print(f"{min(i + BATCH, len(catalog))}/{len(catalog)}", flush=True)
        time.sleep(0.1)

    OUT.write_text("window.EMBEDDINGS = " + json.dumps(embs, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"OK: {len(embs)} embeddings -> {OUT}", flush=True)


if __name__ == "__main__":
    main()
