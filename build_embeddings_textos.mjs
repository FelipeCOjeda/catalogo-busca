import fs from 'node:fs';
import { pipeline } from '@huggingface/transformers';

const MODEL = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
const BATCH = 16;

const raw = fs.readFileSync('textos.js', 'utf8').trim();
const payload = raw.replace(/^window\.TEXTOS\s*=\s*/, '').replace(/;?\s*$/, '');
const textos = JSON.parse(payload);

function texto(t) {
  return `${t.titulo}. ${(t.texto || '').slice(0, 800)}`.trim();
}

const extractor = await pipeline('feature-extraction', MODEL);
const embs = {};
console.log(`${textos.length} artigos`);

for (let i = 0; i < textos.length; i += BATCH) {
  const chunk = textos.slice(i, i + BATCH);
  const out = await extractor(chunk.map(texto), { pooling: 'mean', normalize: true });
  const mat = out.data;
  const dim = out.dims[1];
  for (let j = 0; j < chunk.length; j++) {
    const t = chunk[j];
    embs[t.id] = Array.from(mat.slice(j * dim, (j + 1) * dim), x => Math.round(x * 100000) / 100000);
  }
  console.log(`${Math.min(i + BATCH, textos.length)}/${textos.length}`);
}

fs.writeFileSync('embeddings_textos.js', 'window.EMBEDDINGS_TEXTOS = ' + JSON.stringify(embs) + ';\n');
console.log(`OK: ${Object.keys(embs).length} embeddings -> embeddings_textos.js`);
