export default function WordStatusBar({
  pendingWordPreview,
  statusMessage,
  checking,
  onConfirm,
  onPass,
}) {
  const hasPending = Boolean(
    pendingWordPreview && !pendingWordPreview.error,
  );
  const previewWords = pendingWordPreview?.words ?? [];

  return (
    <div className="word-status-bar">
      <div className="word-status-bar__info">
        {pendingWordPreview?.error ? (
          <span className="word-status-bar__hint word-status-bar__hint--error">
            {pendingWordPreview.error}
          </span>
        ) : hasPending ? (
          <span className="word-status-bar__hint">
            {previewWords.length > 1 ? "Palabras: " : "Palabra: "}
            <strong>
              {previewWords
                .map(({ word, points }) => `${word.toUpperCase()} (${points})`)
                .join(" + ") || pendingWordPreview.word.toUpperCase()}
            </strong>{" "}
            · Total: {pendingWordPreview.points} pts
          </span>
        ) : (
          <span className="word-status-bar__hint">
            Colocá fichas en el tablero para formar una palabra.
          </span>
        )}

        {statusMessage && (
          <span
            className={`word-status-bar__message word-status-bar__message--${statusMessage.type}`}
          >
            {statusMessage.type === "success" ? "✓" : "✕"} {statusMessage.text}
          </span>
        )}
      </div>

      <div className="word-status-bar__actions">
        <button type="button" className="btn btn--ghost" onClick={onPass}>
          Pasar turno
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onConfirm}
          disabled={!hasPending || checking}
        >
          {checking ? "Verificando…" : "Confirmar palabra"}
        </button>
      </div>
    </div>
  );
}
