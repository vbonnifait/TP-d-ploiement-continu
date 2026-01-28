<template>
  <div class="chess-container">
    <div class="chess-board">
      <!-- Numéros de rangées (8 à 1) -->
      <div class="row-labels">
        <div v-for="row in rows" :key="'label-' + row" class="row-label">
          {{ row }}
        </div>
      </div>

      <!-- Plateau -->
      <div class="board">
        <div
          v-for="row in rows"
          :key="'row-' + row"
          class="board-row"
        >
          <div
            v-for="col in columns"
            :key="col + '-' + row"
            class="square"
            :class="[
              getSquareColor(col, row),
              { 'drag-over': dragOverSquare === `${col}-${row}` }
            ]"
            @dragover.prevent="onDragOver(`${col}-${row}`)"
            @dragleave="onDragLeave"
            @drop="onDrop(`${col}-${row}`)"
          >
            <ChessPiece
              v-if="board[`${col}-${row}`]"
              :piece="board[`${col}-${row}`]"
              :position="`${col}-${row}`"
              @dragstart="onPieceDragStart"
            />
          </div>
        </div>

        <!-- Lettres des colonnes -->
        <div class="column-labels">
          <div v-for="col in columns" :key="'col-label-' + col" class="column-label">
            {{ col }}
          </div>
        </div>
      </div>
    </div>

    <!-- Panneau d'informations -->
    <div class="info-panel">
      <h3>Historique des mouvements</h3>
      <div class="move-count">Total: {{ moveHistory.length }} mouvement(s)</div>
      <div class="move-history">
        <div
          v-for="(move, index) in reversedHistory"
          :key="index"
          class="move-entry"
        >
          <span class="move-number">{{ moveHistory.length - index }}.</span>
          <span class="piece-symbol" :class="move.piece.color">
            {{ getPieceSymbol(move.piece) }}
          </span>
          <span class="move-notation">
            {{ formatPosition(move.fromPosition) }} → {{ formatPosition(move.toPosition) }}
          </span>
          <span v-if="move.capturedPiece" class="captured">
            (capture {{ getPieceSymbol(move.capturedPiece) }})
          </span>
        </div>
        <div v-if="moveHistory.length === 0" class="no-moves">
          Aucun mouvement
        </div>
      </div>

      <button class="reset-button" @click="resetGame">
        Réinitialiser le plateau
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import ChessPiece from './ChessPiece.vue'
import { gameService, PieceType, PieceColor } from '../services/GameService'

// Colonnes et rangées
const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const rows = [8, 7, 6, 5, 4, 3, 2, 1]

// État réactif du plateau
const board = reactive({ ...gameService.board })
const moveHistory = ref([...gameService.getMoveHistory()])
const dragOverSquare = ref(null)
const draggedFrom = ref(null)

// Historique inversé pour afficher les derniers mouvements en premier
const reversedHistory = computed(() => {
  return [...moveHistory.value].reverse()
})

// Symboles des pièces
const pieceSymbols = {
  [PieceColor.WHITE]: {
    [PieceType.KING]: '♔',
    [PieceType.QUEEN]: '♕',
    [PieceType.ROOK]: '♖',
    [PieceType.BISHOP]: '♗',
    [PieceType.KNIGHT]: '♘',
    [PieceType.PAWN]: '♙'
  },
  [PieceColor.BLACK]: {
    [PieceType.KING]: '♚',
    [PieceType.QUEEN]: '♛',
    [PieceType.ROOK]: '♜',
    [PieceType.BISHOP]: '♝',
    [PieceType.KNIGHT]: '♞',
    [PieceType.PAWN]: '♟'
  }
}

function getPieceSymbol(piece) {
  return pieceSymbols[piece.color][piece.type]
}

function formatPosition(position) {
  return position.replace('-', '')
}

// Déterminer la couleur d'une case
function getSquareColor(col, row) {
  const colIndex = columns.indexOf(col)
  const isLight = (colIndex + row) % 2 === 1
  return isLight ? 'light' : 'dark'
}

// Gestion du drag & drop
function onPieceDragStart(event) {
  draggedFrom.value = event.position
}

function onDragOver(position) {
  dragOverSquare.value = position
}

function onDragLeave() {
  dragOverSquare.value = null
}

function onDrop(toPosition) {
  dragOverSquare.value = null

  if (!draggedFrom.value || draggedFrom.value === toPosition) {
    return
  }

  // Effectuer le mouvement via le service
  const success = gameService.movePiece(draggedFrom.value, toPosition)

  if (success) {
    // Synchroniser l'état réactif
    syncBoard()
  }

  draggedFrom.value = null
}

// Synchroniser l'état du composant avec le service
function syncBoard() {
  Object.keys(board).forEach(key => delete board[key])
  Object.assign(board, gameService.board)
  moveHistory.value = [...gameService.getMoveHistory()]
}

// Réinitialiser le jeu
function resetGame() {
  gameService.reset()
  syncBoard()
}
</script>

<style scoped>
.chess-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}

.chess-board {
  display: flex;
  background: #2c2c2c;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.row-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding-right: 0.5rem;
}

.row-label {
  color: #888;
  font-size: 0.9rem;
  font-weight: bold;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board {
  display: flex;
  flex-direction: column;
}

.board-row {
  display: flex;
}

.square {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.square.light {
  background-color: #f0d9b5;
}

.square.dark {
  background-color: #b58863;
}

.square.drag-over {
  background-color: #7fc97f !important;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
}

.column-labels {
  display: flex;
  justify-content: space-around;
  padding-top: 0.5rem;
}

.column-label {
  color: #888;
  font-size: 0.9rem;
  font-weight: bold;
  width: 60px;
  text-align: center;
}

/* Panneau d'informations */
.info-panel {
  background: #2c2c2c;
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 280px;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.info-panel h3 {
  margin: 0 0 1rem 0;
  color: #fff;
  font-size: 1.1rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}

.move-count {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.move-history {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.move-entry {
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  background: #3a3a3a;
  color: #ddd;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.move-number {
  color: #888;
  min-width: 24px;
}

.piece-symbol {
  font-size: 1.2rem;
}

.piece-symbol.white {
  color: #fff;
  text-shadow: 1px 1px 1px #000;
}

.piece-symbol.black {
  color: #333;
}

.move-notation {
  color: #aaa;
}

.captured {
  color: #e57373;
  font-size: 0.8rem;
}

.no-moves {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.reset-button {
  width: 100%;
  padding: 0.75rem;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reset-button:hover {
  background: #3a7bc8;
}

/* Scrollbar personnalisée */
.move-history::-webkit-scrollbar {
  width: 6px;
}

.move-history::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.move-history::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.move-history::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>
