import { describe, it, expect, beforeEach } from 'vitest'
import GameService, { PieceType, PieceColor, ChessPiece, Move } from '../GameService'

describe('GameService', () => {
  let gameService

  beforeEach(() => {
    gameService = new GameService()
  })

  describe('initializeBoard', () => {
    it('devrait initialiser le plateau avec 32 pièces', () => {
      const pieces = gameService.getAllPieces()
      const pieceCount = Object.keys(pieces).length
      expect(pieceCount).toBe(32)
    })

    it('devrait placer 16 pièces blanches', () => {
      const pieces = gameService.getAllPieces()
      const whitePieces = Object.values(pieces).filter(p => p.color === PieceColor.WHITE)
      expect(whitePieces.length).toBe(16)
    })

    it('devrait placer 16 pièces noires', () => {
      const pieces = gameService.getAllPieces()
      const blackPieces = Object.values(pieces).filter(p => p.color === PieceColor.BLACK)
      expect(blackPieces.length).toBe(16)
    })

    it('devrait placer le roi blanc en e1', () => {
      const piece = gameService.getPieceAt('e-1')
      expect(piece).not.toBeNull()
      expect(piece.type).toBe(PieceType.KING)
      expect(piece.color).toBe(PieceColor.WHITE)
    })

    it('devrait placer la reine blanche en d1', () => {
      const piece = gameService.getPieceAt('d-1')
      expect(piece).not.toBeNull()
      expect(piece.type).toBe(PieceType.QUEEN)
      expect(piece.color).toBe(PieceColor.WHITE)
    })

    it('devrait placer le roi noir en e8', () => {
      const piece = gameService.getPieceAt('e-8')
      expect(piece).not.toBeNull()
      expect(piece.type).toBe(PieceType.KING)
      expect(piece.color).toBe(PieceColor.BLACK)
    })

    it('devrait placer les pions blancs sur la rangée 2', () => {
      const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      columns.forEach(col => {
        const piece = gameService.getPieceAt(`${col}-2`)
        expect(piece).not.toBeNull()
        expect(piece.type).toBe(PieceType.PAWN)
        expect(piece.color).toBe(PieceColor.WHITE)
      })
    })

    it('devrait placer les pions noirs sur la rangée 7', () => {
      const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      columns.forEach(col => {
        const piece = gameService.getPieceAt(`${col}-7`)
        expect(piece).not.toBeNull()
        expect(piece.type).toBe(PieceType.PAWN)
        expect(piece.color).toBe(PieceColor.BLACK)
      })
    })

    it('devrait avoir les cases centrales vides', () => {
      const emptyPositions = ['e-4', 'e-5', 'd-4', 'd-5']
      emptyPositions.forEach(pos => {
        expect(gameService.getPieceAt(pos)).toBeNull()
      })
    })
  })

  describe('getPieceAt', () => {
    it('devrait retourner la pièce à une position donnée', () => {
      const piece = gameService.getPieceAt('a-1')
      expect(piece).not.toBeNull()
      expect(piece.type).toBe(PieceType.ROOK)
      expect(piece.color).toBe(PieceColor.WHITE)
    })

    it('devrait retourner null pour une case vide', () => {
      const piece = gameService.getPieceAt('e-4')
      expect(piece).toBeNull()
    })
  })

  describe('getPositionByPieceId', () => {
    it('devrait retourner la position d\'une pièce par son ID', () => {
      const piece = gameService.getPieceAt('e-1')
      const position = gameService.getPositionByPieceId(piece.id)
      expect(position).toBe('e-1')
    })

    it('devrait retourner null pour un ID inexistant', () => {
      const position = gameService.getPositionByPieceId(999)
      expect(position).toBeNull()
    })
  })

  describe('movePiece', () => {
    it('devrait déplacer une pièce vers une case vide', () => {
      const success = gameService.movePiece('e-2', 'e-4')
      expect(success).toBe(true)
      expect(gameService.getPieceAt('e-2')).toBeNull()
      expect(gameService.getPieceAt('e-4')).not.toBeNull()
      expect(gameService.getPieceAt('e-4').type).toBe(PieceType.PAWN)
    })

    it('devrait capturer une pièce sur la case de destination', () => {
      // Déplacer le pion blanc e2 vers e7 (où se trouve un pion noir)
      const blackPawn = gameService.getPieceAt('e-7')
      const success = gameService.movePiece('e-2', 'e-7')

      expect(success).toBe(true)
      expect(gameService.getPieceAt('e-7').color).toBe(PieceColor.WHITE)
      expect(gameService.getPieceAt('e-2')).toBeNull()

      // Vérifier que la capture est enregistrée dans l'historique
      const lastMove = gameService.getLastMove()
      expect(lastMove.capturedPiece).not.toBeNull()
      expect(lastMove.capturedPiece.id).toBe(blackPawn.id)
    })

    it('devrait retourner false si la case de départ est vide', () => {
      const success = gameService.movePiece('e-4', 'e-5')
      expect(success).toBe(false)
    })

    it('devrait ajouter le mouvement à l\'historique', () => {
      const initialCount = gameService.getMoveCount()
      gameService.movePiece('e-2', 'e-4')
      expect(gameService.getMoveCount()).toBe(initialCount + 1)
    })
  })

  describe('getMoveHistory', () => {
    it('devrait retourner un tableau vide au début', () => {
      const history = gameService.getMoveHistory()
      expect(history).toEqual([])
    })

    it('devrait retourner tous les mouvements effectués', () => {
      gameService.movePiece('e-2', 'e-4')
      gameService.movePiece('d-7', 'd-5')

      const history = gameService.getMoveHistory()
      expect(history.length).toBe(2)
      expect(history[0].fromPosition).toBe('e-2')
      expect(history[0].toPosition).toBe('e-4')
      expect(history[1].fromPosition).toBe('d-7')
      expect(history[1].toPosition).toBe('d-5')
    })

    it('devrait retourner une copie de l\'historique', () => {
      gameService.movePiece('e-2', 'e-4')
      const history = gameService.getMoveHistory()
      history.push(new Move(null, 'x-x', 'y-y'))
      expect(gameService.getMoveHistory().length).toBe(1)
    })
  })

  describe('getLastMove', () => {
    it('devrait retourner null si aucun mouvement n\'a été effectué', () => {
      expect(gameService.getLastMove()).toBeNull()
    })

    it('devrait retourner le dernier mouvement effectué', () => {
      gameService.movePiece('e-2', 'e-4')
      gameService.movePiece('d-7', 'd-5')

      const lastMove = gameService.getLastMove()
      expect(lastMove.fromPosition).toBe('d-7')
      expect(lastMove.toPosition).toBe('d-5')
    })
  })

  describe('getMoveCount', () => {
    it('devrait retourner 0 au début', () => {
      expect(gameService.getMoveCount()).toBe(0)
    })

    it('devrait compter correctement les mouvements', () => {
      gameService.movePiece('e-2', 'e-4')
      gameService.movePiece('d-7', 'd-5')
      gameService.movePiece('g-1', 'f-3')

      expect(gameService.getMoveCount()).toBe(3)
    })
  })

  describe('reset', () => {
    it('devrait réinitialiser le plateau à l\'état initial', () => {
      // Faire quelques mouvements
      gameService.movePiece('e-2', 'e-4')
      gameService.movePiece('d-7', 'd-5')

      // Réinitialiser
      gameService.reset()

      // Vérifier que le plateau est réinitialisé
      expect(gameService.getPieceAt('e-2')).not.toBeNull()
      expect(gameService.getPieceAt('e-4')).toBeNull()
      expect(gameService.getPieceAt('d-7')).not.toBeNull()
      expect(gameService.getPieceAt('d-5')).toBeNull()
    })

    it('devrait effacer l\'historique des mouvements', () => {
      gameService.movePiece('e-2', 'e-4')
      gameService.reset()
      expect(gameService.getMoveCount()).toBe(0)
      expect(gameService.getMoveHistory()).toEqual([])
    })
  })

  describe('Notation statique', () => {
    it('fromStandardNotation devrait convertir e4 en e-4', () => {
      expect(GameService.fromStandardNotation('e4')).toBe('e-4')
    })

    it('fromStandardNotation devrait convertir a1 en a-1', () => {
      expect(GameService.fromStandardNotation('a1')).toBe('a-1')
    })

    it('fromStandardNotation devrait retourner null pour une notation invalide', () => {
      expect(GameService.fromStandardNotation('invalid')).toBeNull()
    })

    it('toStandardNotation devrait convertir e-4 en e4', () => {
      expect(GameService.toStandardNotation('e-4')).toBe('e4')
    })
  })
})

describe('ChessPiece', () => {
  it('devrait créer une pièce avec les bonnes propriétés', () => {
    const piece = new ChessPiece(PieceType.KING, PieceColor.WHITE, 1)
    expect(piece.type).toBe(PieceType.KING)
    expect(piece.color).toBe(PieceColor.WHITE)
    expect(piece.id).toBe(1)
  })
})

describe('Move', () => {
  it('devrait créer un mouvement avec les bonnes propriétés', () => {
    const piece = new ChessPiece(PieceType.PAWN, PieceColor.WHITE, 1)
    const move = new Move(piece, 'e-2', 'e-4', null)

    expect(move.piece).toBe(piece)
    expect(move.fromPosition).toBe('e-2')
    expect(move.toPosition).toBe('e-4')
    expect(move.capturedPiece).toBeNull()
    expect(move.timestamp).toBeInstanceOf(Date)
  })

  it('devrait enregistrer une pièce capturée', () => {
    const piece = new ChessPiece(PieceType.PAWN, PieceColor.WHITE, 1)
    const capturedPiece = new ChessPiece(PieceType.PAWN, PieceColor.BLACK, 2)
    const move = new Move(piece, 'e-4', 'e-5', capturedPiece)

    expect(move.capturedPiece).toBe(capturedPiece)
  })
})
