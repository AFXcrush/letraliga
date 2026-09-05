import { normalizeWord } from "./dictionary.js";

const WIKTIONARY_API = "https://es.wiktionary.org/w/api.php";
const meaningCache = new Map();

function cleanLine(value) {
  return value
    .replace(/\[[0-9]+\]/g, "")
    .replace(/[ⓘ¦]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function finishDefinition(definitions, parts) {
  const definition = cleanLine(parts.join(" "));
  if (definition && !definitions.includes(definition)) {
    definitions.push(definition);
  }
}

/** Extrae las primeras acepciones del apartado español de Wikcionario. */
export function parseSpanishDefinitions(extract, limit = 3) {
  if (!extract) return [];

  const spanishHeading = /^==\s*Español\s*==\s*$/im;
  const spanishMatch = spanishHeading.exec(extract);
  if (!spanishMatch) return [];

  const remainder = extract.slice(spanishMatch.index + spanishMatch[0].length);
  const nextLanguage = /^==\s*[^=].*?\s*==\s*$/m.exec(remainder);
  const section = nextLanguage
    ? remainder.slice(0, nextLanguage.index)
    : remainder;
  const lines = section.split(/\r?\n/).map((line) => line.trim());
  const definitions = [];
  let currentParts = null;

  for (const line of lines) {
    if (!line) continue;

    const numbered = /^(\d+)(?:[.):\-–—]\s*|\s+)?(.*)$/.exec(line);
    if (numbered) {
      if (currentParts) finishDefinition(definitions, currentParts);
      if (definitions.length >= limit) break;
      currentParts = numbered[2] ? [numbered[2]] : [];
      continue;
    }

    if (!currentParts || /^={3,}.*={3,}$/.test(line)) continue;
    if (/^(Uso|Sin[oó]nimos?|Ant[oó]nimos?|[ÁA]mbito|Ejemplos?|Nota|V[ée]ase):/i.test(line)) {
      continue;
    }

    currentParts.push(line);
  }

  if (currentParts && definitions.length < limit) {
    finishDefinition(definitions, currentParts);
  }

  return definitions.slice(0, limit);
}

export function buildWiktionaryUrl(word) {
  return `https://es.wiktionary.org/wiki/${encodeURIComponent(word)}`;
}

/**
 * Busca una palabra en Wikcionario. La búsqueda tolera que las fichas no
 * lleven tilde y devuelve un resultado vacío cuando no hay una acepción útil.
 */
export async function getWordMeaning(word, fetchImpl = fetch) {
  const normalized = normalizeWord(word);
  if (!normalized) {
    return { word: normalized, title: normalized, definitions: [], sourceUrl: "" };
  }

  if (meaningCache.has(normalized) && fetchImpl === fetch) {
    return meaningCache.get(normalized);
  }

  const params = new URLSearchParams({
    origin: "*",
    action: "query",
    generator: "search",
    gsrsearch: normalized,
    gsrnamespace: "0",
    gsrlimit: "1",
    prop: "extracts",
    explaintext: "1",
    redirects: "1",
    format: "json",
    formatversion: "2",
  });

  const response = await fetchImpl(`${WIKTIONARY_API}?${params}`);
  if (!response.ok) throw new Error("No se pudo consultar Wikcionario.");

  const data = await response.json();
  const page = data?.query?.pages?.[0];
  const title = page?.title ?? normalized;
  const result = {
    word: normalized,
    title,
    definitions: parseSpanishDefinitions(page?.extract),
    sourceUrl: page ? buildWiktionaryUrl(title) : "",
  };

  if (fetchImpl === fetch) meaningCache.set(normalized, result);
  return result;
}
