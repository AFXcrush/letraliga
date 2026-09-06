import { useEffect, useState } from "react";
import { checkWordExists } from "../services/dictionary.js";

const IDLE_RESULT = { status: "idle", words: [] };

export function useWordPreviewValidation(preview) {
  const [result, setResult] = useState(IDLE_RESULT);

  useEffect(() => {
    if (!preview || preview.error || !preview.words?.length) {
      setResult(IDLE_RESULT);
      return undefined;
    }

    let active = true;
    setResult({ status: "checking", words: [] });
    const timeout = window.setTimeout(async () => {
      const words = await Promise.all(
        preview.words.map(async ({ word }) => ({
          word,
          ...(await checkWordExists(word)),
        })),
      );
      if (!active) return;

      const loadError = words.find(({ error }) => error);
      if (loadError) {
        setResult({ status: "error", words, message: loadError.error });
        return;
      }
      setResult({
        status: words.every(({ valid }) => valid) ? "valid" : "invalid",
        words,
      });
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [preview]);

  return result;
}
