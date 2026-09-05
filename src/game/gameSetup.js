import { buildLetterBag, shuffleBag } from "../layout/letterData.js";
import { balanceRack } from "../utils/rackBalance.js";
import { INITIAL_RACK_RULES, RACK_SIZE } from "./constants.js";

/** Crea el estado inicial sin depender de React ni del contexto. */
export function createInitialGame(names, timestamp = Date.now()) {
  let bag = shuffleBag(buildLetterBag());

  const players = names.map((name, index) => {
    const deal = balanceRack({
      rack: [],
      bag,
      rackSize: RACK_SIZE,
      ...INITIAL_RACK_RULES,
    });
    bag = deal.bag;

    return {
      id: `player-${index}-${timestamp}`,
      name,
      score: 0,
      rack: deal.rack,
    };
  });

  return { players, bag };
}
