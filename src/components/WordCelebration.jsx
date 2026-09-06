import { useEffect } from "react";
import { playWordConfirmedSound } from "../services/soundEffects.js";

const CONFETTI_COLORS = ["coral", "gold", "green", "blue", "purple"];

export default function WordCelebration({ celebration, onDismiss }) {
  useEffect(() => {
    if (!celebration) return undefined;

    playWordConfirmedSound();
    const timeout = window.setTimeout(onDismiss, 2400);
    return () => window.clearTimeout(timeout);
  }, [celebration, onDismiss]);

  if (!celebration) return null;
  const words = celebration.words ?? [celebration.word];

  return (
    <div className="word-celebration" role="status" aria-live="polite">
      <div className="word-celebration__confetti" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <span
            key={index}
            className={`word-celebration__particle word-celebration__particle--${
              CONFETTI_COLORS[index % CONFETTI_COLORS.length]
            }`}
            style={{ "--particle-index": index }}
          />
        ))}
      </div>
      <div className="word-celebration__card" key={celebration.id}>
        <span className="word-celebration__eyebrow">
          {celebration.playerName
            ? `${celebration.playerName} confirmó`
            : "¡Palabra correcta!"}
        </span>
        <strong className="word-celebration__word">
          {words.map((word) => word.toUpperCase()).join(" + ")}
        </strong>
        <span className="word-celebration__points">
          +{celebration.points} puntos
        </span>
        {celebration.bonusPoints > 0 && (
          <span className="word-celebration__bonus">
            🎉 Bono por usar las 7 fichas: +{celebration.bonusPoints}
          </span>
        )}
      </div>
    </div>
  );
}
