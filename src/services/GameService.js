/**
 * Service de gestion du jeu d'échecs
 * Gère les positions des pièces et l'historique des déplacements
 * Utilise chess.js pour la logique du jeu
 */

import { Chess } from 'chess.js'

// Types de pièces (mapping avec chess.js)
export const PieceType = {
  KING: 'k',
  QUEEN: 'q',
  ROOK: 'r',
  BISHOP: 'b',
  KNIGHT: 'n',
  PAWN: 'p'
}

// Couleurs des pièces (mapping avec chess.js)
export const PieceColor = {
  WHITE: 'w',
  BLACK: 'b'
}

/**
 * Représente une pièce d'échecs
 */
export class ChessPiece {
  constructor(type, color, id) {
    this.type = type
    this.color = color
    this.id = id
  }
}

/**
 * Représente un mouvement
 */
export class Move {
  constructor(piece, fromPosition, toPosition, capturedPiece = null, san = '') {
    this.piece = piece
    this.fromPosition = fromPosition
    this.toPosition = toPosition
    this.capturedPiece = capturedPiece
    this.san = san // Standard Algebraic Notation
    this.timestamp = new Date()
  }
}

/**
 * Service principal de gestion du jeu
 */
class GameService {
  constructor() {
    this.chess = new Chess()
    // Plateau: objet avec clé "col-row" (ex: "a-1") et valeur ChessPiece ou null
    this.board = {}
    // Historique des mouvements (notre format interne)
    this.moveHistory = []

    // Initialiser le plateau
    this.initializeBoard()
  }

  /**
   * Initialise le plateau avec chess.js
   */
  initializeBoard() {
    this.board = {}
    this.moveHistory = []
    this.syncBoardFromChess()
  }

  /**
   * Synchronise l'état interne 'board' à partir de l'état de chess.js
   */
  syncBoardFromChess() {
    // Vider le plateau actuel
    Object.keys(this.board).forEach(key => delete this.board[key])

    const chessBoard = this.chess.board() // Retourne un tableau 8x8
    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

    // Parcourir le tableau de chess.js (rangée 0 = rangée 8 sur l'échiquier)
    chessBoard.forEach((row, rowIndex) => {
      const rowLabel = 8 - rowIndex // 0 -> 8, 1 -> 7, ...

      row.forEach((square, colIndex) => {
        if (square) {
          const colLabel = columns[colIndex]
          const position = `${colLabel}-${rowLabel}`
          // Créer une pièce avec un ID unique basé sur la position et le type (pour l'affichage Vue)
          // Note: chess.js ne garde pas d'ID persistent pour les pièces, on en génère un simple
          const id = `${square.color}-${square.type}-${colIndex}-${rowIndex}`
          this.board[position] = new ChessPiece(square.type, square.color, id)
        }
      })
    })
  }

  /**
   * Obtient la pièce à une position donnée
   * @param {string} position - Position au format "col-row" (ex: "e-4")
   * @returns {ChessPiece|null}
   */
  getPieceAt(position) {
    return this.board[position] || null
  }

  /**
   * Obtient toutes les positions avec leurs pièces
   */
  getAllPieces() {
    return { ...this.board }
  }

  /**
   * Déplace une pièce d'une position à une autre en utilisant chess.js
   * @param {string} fromPosition - Position de départ (ex: "e-2")
   * @param {string} toPosition - Position d'arrivée (ex: "e-4")
   * @returns {boolean} true si le déplacement a réussi
   */
  movePiece(fromPosition, toPosition) {
    const from = fromPosition.replace('-', '')
    const to = toPosition.replace('-', '')

    try {
      // Tenter le mouvement avec chess.js
      // move() retourne null si le mouvement est invalide
      // On gère la promotion automatique en Dame pour simplifier
      const moveResult = this.chess.move({ from, to, promotion: 'q' })

      if (!moveResult) {
        console.warn(`Mouvement invalide: ${from} -> ${to}`)
        return false
      }

      // If the move is valid
      const piece = new ChessPiece(moveResult.piece, moveResult.color, `${moveResult.color}-${moveResult.piece}-${Date.now()}`)

      // Handle capture
      let capturedPiece = null
      if (moveResult.captured) {
        // We cannot easily retrieve the exact captured piece object from the previous state without storing it
        // But we can create a representation
        const capturedColor = moveResult.color === 'w' ? 'b' : 'w'
        capturedPiece = new ChessPiece(moveResult.captured, capturedColor, 'captured')
      }

      // Record the move in our history
      const moveValues = new Move(piece, fromPosition, toPosition, capturedPiece, moveResult.san)
      this.moveHistory.push(moveValues)

      // Synchronize the board
      this.syncBoardFromChess()

      return true
    } catch (e) {
      // console.warn("Mouvement invalide ou erreur:", e.message)
      return false
    }
  }

  /**
   * Obtient l'historique complet des mouvements
   */
  getMoveHistory() {
    return [...this.moveHistory]
  }

  /**
   * Réinitialise le jeu
   */
  reset() {
    this.chess.reset()
    this.initializeBoard()
  }
  /**
   * Obtient la position d'une pièce par son ID
   * @param {number} pieceId - ID de la pièce
   * @returns {string|null} Position ou null si non trouvée
   */
  getPositionByPieceId(pieceId) {
    for (const position in this.board) {
      if (this.board[position] && this.board[position].id === pieceId) {
        return position
      }
    }
    return null
  }

  /**
   * Obtient le dernier mouvement effectué
   * @returns {Move|null}
   */
  getLastMove() {
    return this.moveHistory.length > 0
      ? this.moveHistory[this.moveHistory.length - 1]
      : null
  }

  /**
   * Obtient le nombre de mouvements effectués
   * @returns {number}
   */
  getMoveCount() {
    return this.moveHistory.length
  }

  /**
   * Convertit une position notation standard (ex: "e4") en format interne (ex: "e-4")
   * @param {string} notation - Notation standard
   * @returns {string} Format interne
   */
  static fromStandardNotation(notation) {
    if (notation.length !== 2) return null
    const col = notation[0].toLowerCase()
    const row = notation[1]
    return `${col}-${row}`
  }

  /**
   * Convertit une position interne en notation standard
   * @param {string} position - Format interne (ex: "e-4")
   * @returns {string} Notation standard (ex: "e4")
   */
  static toStandardNotation(position) {
    return position.replace('-', '')
  }
}

// Export d'une instance singleton
export const gameService = new GameService()

// Export de la classe pour les tests
export default GameService
