import fs from 'node:fs';
import { pipeline } from '@huggingface/transformers';

const MODEL = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
const BATCH = 16;

// carrega dados.js (window.CATALOGO = [...];)
const raw = fs.readFileSync('dados.js', 'utf8').trim();
const payload = raw.replace(/^window\.CATALOGO\s*=\s*/, '').replace(/;?\s*$/, '');
const catalog = JSON.parse(payload);

function texto(v) {
  const titulo = (v.titulo || '').trim();
  const tags = (v.tags || []).slice(0, 12).join(' ');
  const trecho = (v.transcricao || '').slice(0, 400).replace(/\[[\d:]+\]\s*/g, ' ');
  return `${titulo}. ${tags}. ${trecho}`.trim();
}

const extractor = await pipeline('feature-extraction', MODEL);
const embs = {};
console.log(`${catalog.length} vídeos`);

for (let i = 0; i < catalog.length; i += BATCH) {
  const chunk = catalog.slice(i, i + BATCH);
  const out = await extractor(chunk.map(texto), { pooling: 'mean', normalize: true });
  const mat = out.data;
  const dim = out.dims[1];
  for (let j = 0; j < chunk.length; j++) {
    const v = chunk[j];
    const vec = Array.from(mat.slice(j * dim, (j + 1) * dim), x => Math.round(x * 100000) / 100000);
    embs[v.id] = vec;
  }
  console.log(`${Math.min(i + BATCH, catalog.length)}/${catalog.length}`);
}

fs.writeFileSync('embeddings.js', 'window.EMBEDDINGS = ' + JSON.stringify(embs) + ';\n');
console.log(`OK: ${Object.keys(embs).length} embeddings -> embeddings.js`);
