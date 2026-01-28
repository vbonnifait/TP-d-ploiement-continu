/**
 * Service de gestion du jeu d'échecs
 * Gère les positions des pièces et l'historique des déplacements
 */

// Types de pièces
export const PieceType = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  BISHOP: 'bishop',
  KNIGHT: 'knight',
  PAWN: 'pawn'
}

// Couleurs des pièces
export const PieceColor = {
  WHITE: 'white',
  BLACK: 'black'
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
  constructor(piece, fromPosition, toPosition, capturedPiece = null) {
    this.piece = piece
    this.fromPosition = fromPosition
    this.toPosition = toPosition
    this.capturedPiece = capturedPiece
    this.timestamp = new Date()
  }
}

/**
 * Service principal de gestion du jeu
 */
class GameService {
  constructor() {
    // Plateau: objet avec clé "col-row" (ex: "a-1") et valeur ChessPiece ou null
    this.board = {}
    // Historique des mouvements
    this.moveHistory = []
    // Initialiser le plateau
    this.initializeBoard()
  }

  /**
   * Initialise le plateau avec toutes les pièces dans leur position de départ
   */
  initializeBoard() {
    this.board = {}
    this.moveHistory = []

    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    let pieceId = 0

    // Placement des pièces blanches (rangées 1 et 2)
    // Rangée 1: pièces majeures
    const backRowPieces = [
      PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
      PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK
    ]

    columns.forEach((col, index) => {
      // Pièces blanches - rangée 1
      this.board[`${col}-1`] = new ChessPiece(backRowPieces[index], PieceColor.WHITE, pieceId++)
      // Pions blancs - rangée 2
      this.board[`${col}-2`] = new ChessPiece(PieceType.PAWN, PieceColor.WHITE, pieceId++)
    })

    // Placement des pièces noires (rangées 7 et 8)
    columns.forEach((col, index) => {
      // Pions noirs - rangée 7
      this.board[`${col}-7`] = new ChessPiece(PieceType.PAWN, PieceColor.BLACK, pieceId++)
      // Pièces noires - rangée 8
      this.board[`${col}-8`] = new ChessPiece(backRowPieces[index], PieceColor.BLACK, pieceId++)
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
   * @returns {Object} Objet avec les positions comme clés et les pièces comme valeurs
   */
  getAllPieces() {
    const pieces = {}
    Object.keys(this.board).forEach(position => {
      if (this.board[position]) {
        pieces[position] = this.board[position]
      }
    })
    return pieces
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
   * Déplace une pièce d'une position à une autre
   * @param {string} fromPosition - Position de départ
   * @param {string} toPosition - Position d'arrivée
   * @returns {boolean} true si le déplacement a réussi
   */
  movePiece(fromPosition, toPosition) {
    const piece = this.board[fromPosition]

    if (!piece) {
      console.warn(`Aucune pièce à la position ${fromPosition}`)
      return false
    }

    // Vérifier si une pièce est capturée
    const capturedPiece = this.board[toPosition] || null

    // Créer l'enregistrement du mouvement
    const move = new Move(piece, fromPosition, toPosition, capturedPiece)
    this.moveHistory.push(move)

    // Effectuer le déplacement
    this.board[toPosition] = piece
    this.board[fromPosition] = null

    return true
  }

  /**
   * Obtient l'historique complet des mouvements
   * @returns {Move[]}
   */
  getMoveHistory() {
    return [...this.moveHistory]
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
   * Réinitialise le jeu
   */
  reset() {
    this.initializeBoard()
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
