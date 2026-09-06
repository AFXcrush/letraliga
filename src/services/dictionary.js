// Diccionario español local. Se carga de forma diferida la primera vez que
// se confirma una palabra, de modo que el arranque del juego no queda
// bloqueado por la lista completa.

const cache = new Map();
let spanishWordSetPromise = null;

// Las fichas no incluyen vocales acentuadas, por lo que esas marcas se
// eliminan. La Ñ sí es una letra distinta de la N y debe conservarse.
export function normalizeWord(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/n\u0303/g, "ñ")
    .replace(/[\u0300-\u036f]/g, "");
}

async function loadSpanishWords() {
  // Vite transforma este JSON en un módulo JavaScript compatible con el
  // navegador durante el desarrollo y la compilación.
  const module = await import("an-array-of-spanish-words/index.json");
  return module.default ?? module;
}

async function getSpanishWordSet() {
  if (!spanishWordSetPromise) {
    spanishWordSetPromise = loadSpanishWords().then(
      (words) => new Set(words.map(normalizeWord)),
    );
  }

  return spanishWordSetPromise;
}

/**
 * Verifica si una palabra existe en el diccionario español.
 * @param {string} word
 * @param {() => Promise<Set<string>>} [loadWordSet]
 * @returns {Promise<{ valid: boolean, word: string, error?: string }>}
 */
export async function checkWordExists(word, loadWordSet = getSpanishWordSet) {
  const normalized = normalizeWord(word);

  if (!normalized) {
    return { valid: false, word: normalized };
  }

  if (cache.has(normalized)) {
    return { valid: cache.get(normalized), word: normalized };
  }

  try {
    const wordSet = await loadWordSet();
    const valid = wordSet.has(normalized);
    cache.set(normalized, valid);
    return { valid, word: normalized };
  } catch {
    return {
      valid: false,
      word: normalized,
      error: "No se pudo cargar el diccionario. Inténtalo de nuevo más tarde.",
    };
  }
}
