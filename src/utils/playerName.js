export const MAX_PLAYER_NAME_LENGTH = 12;

const PLAYER_NAME_CHARACTER = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]$/;
const VALID_PLAYER_NAME =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+)*$/;

export function sanitizePlayerName(value) {
  return Array.from(value)
    .map((character) => (/\s/.test(character) ? " " : character))
    .filter(
      (character) =>
        character === " " || PLAYER_NAME_CHARACTER.test(character),
    )
    .join("")
    .replace(/ +/g, " ")
    .replace(/^ /, "")
    .slice(0, MAX_PLAYER_NAME_LENGTH);
}

export function isValidPlayerName(value) {
  return value.length <= MAX_PLAYER_NAME_LENGTH && VALID_PLAYER_NAME.test(value);
}
