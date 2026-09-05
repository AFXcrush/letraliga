export const RACK_SIZE = 7;
export const MIN_TILES_FIRST_TURN = 2;

export const GAME_PHASES = {
  LOBBY: "lobby",
  ONLINE_WAITING: "online-waiting",
  PLAYING: "playing",
  GAME_OVER: "gameover",
};

export const GAME_END_REASONS = {
  BAG_EMPTY: "bag-empty",
  SCORELESS_TURNS: "scoreless-turns",
  PLAYER_LEFT: "player-left",
};

export const SCORELESS_ROUNDS_TO_END = 2;

export const INITIAL_RACK_RULES = {
  minVowels: 2,
  minConsonants: 2,
};

export const TURN_RACK_RULES = {
  minVowels: 2,
  minConsonants: 1,
};
