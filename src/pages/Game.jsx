import { useEffect, useMemo, useState } from "react";
import Board from "../components/Board.jsx";
import BagContentsModal from "../components/BagContentsModal.jsx";
import WordMeaningsModal from "../components/WordMeaningsModal.jsx";
import GameOptionsModal from "../components/GameOptionsModal.jsx";
import PanZoom from "../components/PanZoom.jsx";
import Rack from "../components/Rack.jsx";
import PlayerList from "../components/PlayerList.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import WordStatusBar from "../components/WordStatusBar.jsx";
import WordCelebration from "../components/WordCelebration.jsx";
import { useGame } from "../context/GameContext.jsx";
import { useWordPreviewValidation } from "../hooks/useWordPreviewValidation.js";
import { unlockSoundEffects } from "../services/soundEffects.js";
import { MIN_TILES_FIRST_TURN } from "../game/constants.js";

export default function Game() {
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isMeaningsOpen, setIsMeaningsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const {
    players,
    currentPlayerIndex,
    currentPlayer,
    localPlayer,
    tilesRemaining,
    bag,
    bagCounts,
    placedTiles,
    pendingTiles,
    remotePendingKeys,
    lastMoveKeys,
    isOpeningTurn,
    pendingWordPreview,
    statusMessage,
    celebration,
    checking,
    darkMode,
    playedWords,
    isFinalTurn,
    isFinalTurnOwnerTurn,
    isOnlineGame,
    canTakeTurn,
    canReorderRack,
    onlineSession,
    placeTile,
    returnTileToRack,
    recallPendingTiles,
    shuffleRack,
    reorderRack,
    assignBlank,
    exchangeTiles,
    confirmWord,
    passTurn,
    toggleDarkMode,
    dismissCelebration,
    startGame,
    resetToLobby,
    leaveOnlineSession,
  } = useGame();

  const selectedTile = useMemo(
    () => currentPlayer?.rack.find((tile) => tile.id === selectedTileId) ?? null,
    [currentPlayer, selectedTileId],
  );
  const pendingTileCount = Object.keys(pendingTiles).length;
  const hasMinimumPreviewTiles =
    pendingTileCount >= (isOpeningTurn ? MIN_TILES_FIRST_TURN : 1);
  const previewValidation = useWordPreviewValidation(
    hasMinimumPreviewTiles ? pendingWordPreview : null,
  );

  useEffect(() => {
    if (selectedTileId && !selectedTile) setSelectedTileId(null);
  }, [selectedTile, selectedTileId]);

  useEffect(() => {
    if (!canTakeTurn) setSelectedTileId(null);
  }, [canTakeTurn]);

  useEffect(() => {
    const unlock = () => unlockSoundEffects();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const selectRackTile = (tileId) => {
    setSelectedTileId((currentId) => (currentId === tileId ? null : tileId));
  };

  const placeSelectedTile = ({ row, col }) => {
    if (!selectedTile) return;
    placeTile({ row, col, tile: { ...selectedTile, from: "rack" } });
    setSelectedTileId(null);
  };

  return (
    <div className="app">
      <WordCelebration
        celebration={celebration}
        onDismiss={dismissCelebration}
      />
      <BagContentsModal
        bag={bag}
        bagCounts={bagCounts}
        total={tilesRemaining}
        open={isBagOpen}
        onClose={() => setIsBagOpen(false)}
      />
      <WordMeaningsModal
        playedWords={playedWords}
        open={isMeaningsOpen}
        onClose={() => setIsMeaningsOpen(false)}
      />
      <GameOptionsModal
        open={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onRestart={() => startGame(players.map(({ name }) => name))}
        onAbandon={isOnlineGame ? leaveOnlineSession : resetToLobby}
        canRestart={!isOnlineGame}
      />
      <div className="app__top-bar">
        <div className="score-counter">
          <div className="score-counter__header">
            <span className="score-counter__label">Fichas en la bolsa</span>
            <button
              type="button"
              className="score-counter__inspect"
              onClick={() => setIsBagOpen(true)}
              aria-label="Ver fichas en la bolsa"
              title="Ver fichas en la bolsa"
            >
              👁️
            </button>
          </div>
          <span className="score-counter__value">{tilesRemaining}</span>
          <button
            type="button"
            className="score-counter__meanings"
            onClick={() => setIsMeaningsOpen(true)}
            disabled={playedWords.length === 0}
            title={
              playedWords.length === 0
                ? "Confirma una palabra para consultar su significado"
                : "Ver significados de las palabras confirmadas"
            }
          >
            <span aria-hidden="true">📖</span> Significados
          </button>
        </div>
        <div className="game-toolbar">
          <button
            type="button"
            className="game-toolbar__options"
            onClick={() => setIsOptionsOpen(true)}
            aria-label="Opciones de partida"
            title="Opciones"
          >
            <span className="game-toolbar__options-icon" aria-hidden="true">
              ⚙
            </span>
            <span className="game-toolbar__options-label">Opciones</span>
          </button>
          <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
        </div>
      </div>

      <PlayerList
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        localPlayerId={onlineSession?.playerId}
      />

      <p className="app-title">
        Letra Liga · {isOnlineGame && `Sala ${onlineSession?.roomCode} · `}
        {isOnlineGame && !canTakeTurn
          ? "Esperando a"
          : isFinalTurnOwnerTurn
            ? "Último turno de"
            : isFinalTurn
              ? "Ronda final · Turno de"
              : "Turno de"}{" "}
        {currentPlayer?.name}
      </p>

      <PanZoom>
        {(scale) => (
          <Board
            scale={scale}
            placedTiles={placedTiles}
            pendingTiles={pendingTiles}
            maskedPendingKeys={remotePendingKeys}
            lastMoveKeys={pendingTileCount > 0 ? [] : lastMoveKeys}
            celebratingKeys={celebration?.cellsKeys ?? []}
            onDropTile={canTakeTurn ? placeTile : undefined}
            onSelectCell={canTakeTurn ? placeSelectedTile : undefined}
            hasSelectedTile={canTakeTurn && Boolean(selectedTile)}
          />
        )}
      </PanZoom>

      <WordStatusBar
        pendingWordPreview={pendingWordPreview}
        pendingTileCount={pendingTileCount}
        previewValidation={previewValidation}
        isOpeningTurn={isOpeningTurn}
        statusMessage={statusMessage}
        checking={checking}
        disabled={!canTakeTurn}
        onConfirm={confirmWord}
        onPass={passTurn}
      />

      <Rack
        tiles={localPlayer?.rack ?? []}
        onReturnTile={returnTileToRack}
        onRecall={recallPendingTiles}
        onShuffle={shuffleRack}
        onReorderTile={reorderRack}
        onAssignBlank={assignBlank}
        onExchange={exchangeTiles}
        onSelectTile={selectRackTile}
        selectedTileId={selectedTileId}
        canRecall={Object.keys(pendingTiles).length > 0}
        turnDisabled={checking || !canTakeTurn}
        reorderDisabled={!canReorderRack}
        bagCount={tilesRemaining}
      />
    </div>
  );
}
