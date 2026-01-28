<template>
  <div
    class="chess-piece"
    :class="[piece.color, { dragging: isDragging }]"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    {{ pieceSymbol }}
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PieceType, PieceColor } from '../services/GameService'

const props = defineProps({
  piece: {
    type: Object,
    required: true
  },
  position: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['dragstart', 'dragend'])

const isDragging = ref(false)

// Symboles Unicode pour les pièces d'échecs
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

const pieceSymbol = computed(() => {
  return pieceSymbols[props.piece.color][props.piece.type]
})

function onDragStart(event) {
  isDragging.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', props.position)
  emit('dragstart', { position: props.position, piece: props.piece })
}

function onDragEnd() {
  isDragging.value = false
  emit('dragend')
}
</script>

<style scoped>
.chess-piece {
  font-size: 3rem;
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: transform 0.1s ease;
}

.chess-piece:hover {
  transform: scale(1.1);
}

.chess-piece.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.chess-piece.white {
  color: #fff;
  text-shadow:
    1px 1px 2px #000,
    -1px -1px 2px #000,
    1px -1px 2px #000,
    -1px 1px 2px #000;
}

.chess-piece.black {
  color: #1a1a1a;
  text-shadow:
    1px 1px 1px rgba(255, 255, 255, 0.3);
}
</style>
