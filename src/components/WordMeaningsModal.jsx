import { useEffect, useState } from "react";
import { getWordMeaning } from "../services/wordMeanings.js";

export default function WordMeaningsModal({
  playedWords,
  open,
  onClose,
  loadMeaning = getWordMeaning,
}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    setEntries([]);

    Promise.all(
      playedWords.map(async (play) => {
        try {
          return { ...play, meaning: await loadMeaning(play.word) };
        } catch {
          return { ...play, error: true };
        }
      }),
    ).then((nextEntries) => {
      if (!active) return;
      setEntries(nextEntries);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [loadMeaning, open, playedWords]);

  if (!open) return null;

  return (
    <div
      className="bag-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="bag-modal__dialog meanings-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meanings-modal-title"
      >
        <header className="bag-modal__header">
          <div>
            <h2 id="meanings-modal-title">Significados</h2>
            <p>Palabras confirmadas en esta partida</p>
          </div>
          <button
            type="button"
            className="bag-modal__close"
            onClick={onClose}
            aria-label="Cerrar significados"
          >
            ×
          </button>
        </header>

        {loading ? (
          <p className="meanings-modal__message" role="status">
            Buscando significados…
          </p>
        ) : (
          <div className="meanings-modal__list">
            {entries.map((entry, index) => (
              <article
                className="meanings-modal__entry"
                key={`${entry.word}-${entry.playerId}-${index}`}
              >
                <div className="meanings-modal__word-row">
                  <h3>{entry.word.toUpperCase()}</h3>
                  <span>
                    {entry.playerName} · {entry.points} pts
                  </span>
                </div>

                {entry.error ? (
                  <p>No se pudo consultar el significado en este momento.</p>
                ) : entry.meaning?.definitions.length ? (
                  <ol>
                    {entry.meaning.definitions.map((definition) => (
                      <li key={definition}>{definition}</li>
                    ))}
                  </ol>
                ) : (
                  <p>No encontramos una definición disponible.</p>
                )}

                {entry.meaning?.sourceUrl && (
                  <a
                    href={entry.meaning.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver entrada en Wikcionario
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
