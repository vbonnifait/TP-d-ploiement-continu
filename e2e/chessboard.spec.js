import { test, expect } from '@playwright/test'

test.describe('ChessBoard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Affichage initial', () => {
    test('devrait afficher le titre de la page', async ({ page }) => {
      await expect(page.locator('h1')).toHaveText("Jeu d'Echecs")
    })

    test('devrait afficher le plateau avec 64 cases', async ({ page }) => {
      const squares = page.locator('.square')
      await expect(squares).toHaveCount(64)
    })

    test('devrait afficher 32 cases claires et 32 cases sombres', async ({ page }) => {
      const lightSquares = page.locator('.square.light')
      const darkSquares = page.locator('.square.dark')
      await expect(lightSquares).toHaveCount(32)
      await expect(darkSquares).toHaveCount(32)
    })

    test('devrait afficher les labels des colonnes (a-h)', async ({ page }) => {
      const columnLabels = page.locator('.column-label')
      await expect(columnLabels).toHaveCount(8)

      const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      for (let i = 0; i < 8; i++) {
        await expect(columnLabels.nth(i)).toHaveText(labels[i])
      }
    })

    test('devrait afficher les labels des rangées (1-8)', async ({ page }) => {
      const rowLabels = page.locator('.row-label')
      await expect(rowLabels).toHaveCount(8)

      const labels = ['8', '7', '6', '5', '4', '3', '2', '1']
      for (let i = 0; i < 8; i++) {
        await expect(rowLabels.nth(i)).toHaveText(labels[i])
      }
    })
  })

  test.describe('Pièces initiales', () => {
    test('devrait afficher 32 pièces au total', async ({ page }) => {
      const pieces = page.locator('.chess-piece')
      await expect(pieces).toHaveCount(32)
    })

    test('devrait afficher 16 pièces blanches', async ({ page }) => {
      const whitePieces = page.locator('.chess-piece.white')
      await expect(whitePieces).toHaveCount(16)
    })

    test('devrait afficher 16 pièces noires', async ({ page }) => {
      const blackPieces = page.locator('.chess-piece.black')
      await expect(blackPieces).toHaveCount(16)
    })

    test('devrait afficher le roi blanc (♔) sur le plateau', async ({ page }) => {
      const whiteKing = page.locator('.chess-piece.white:has-text("♔")')
      await expect(whiteKing).toHaveCount(1)
    })

    test('devrait afficher la reine blanche (♕) sur le plateau', async ({ page }) => {
      const whiteQueen = page.locator('.chess-piece.white:has-text("♕")')
      await expect(whiteQueen).toHaveCount(1)
    })

    test('devrait afficher 8 pions blancs (♙)', async ({ page }) => {
      const whitePawns = page.locator('.chess-piece.white:has-text("♙")')
      await expect(whitePawns).toHaveCount(8)
    })

    test('devrait afficher 8 pions noirs (♟)', async ({ page }) => {
      const blackPawns = page.locator('.chess-piece.black:has-text("♟")')
      await expect(blackPawns).toHaveCount(8)
    })

    test('devrait afficher 2 tours blanches (♖)', async ({ page }) => {
      const whiteRooks = page.locator('.chess-piece.white:has-text("♖")')
      await expect(whiteRooks).toHaveCount(2)
    })

    test('devrait afficher 2 cavaliers blancs (♘)', async ({ page }) => {
      const whiteKnights = page.locator('.chess-piece.white:has-text("♘")')
      await expect(whiteKnights).toHaveCount(2)
    })

    test('devrait afficher 2 fous blancs (♗)', async ({ page }) => {
      const whiteBishops = page.locator('.chess-piece.white:has-text("♗")')
      await expect(whiteBishops).toHaveCount(2)
    })
  })

  test.describe('Panneau d\'informations', () => {
    test('devrait afficher le titre "Historique des mouvements"', async ({ page }) => {
      await expect(page.locator('.info-panel h3')).toHaveText('Historique des mouvements')
    })

    test('devrait afficher "Aucun mouvement" au début', async ({ page }) => {
      await expect(page.locator('.no-moves')).toHaveText('Aucun mouvement')
    })

    test('devrait afficher le compteur à 0 au début', async ({ page }) => {
      await expect(page.locator('.move-count')).toHaveText('Total: 0 mouvement(s)')
    })

    test('devrait afficher le bouton de réinitialisation', async ({ page }) => {
      const resetButton = page.locator('.reset-button')
      await expect(resetButton).toBeVisible()
      await expect(resetButton).toHaveText('Réinitialiser le plateau')
    })
  })

  test.describe('Drag and Drop', () => {
    test('les pièces devraient être draggables', async ({ page }) => {
      const piece = page.locator('.chess-piece').first()
      await expect(piece).toHaveAttribute('draggable', 'true')
    })

    test('devrait pouvoir déplacer un pion blanc', async ({ page }) => {
      // Trouver le pion en e2 (5ème case de la 7ème rangée du haut)
      // Les rangées sont affichées de 8 à 1, donc rangée 2 = index 6
      const squares = page.locator('.board-row').nth(6).locator('.square')
      const e2Square = squares.nth(4) // colonne e = index 4
      const pawn = e2Square.locator('.chess-piece')

      // Vérifier que le pion est présent
      await expect(pawn).toBeVisible()

      // Case de destination e4 (rangée 4 = index 4)
      const e4Square = page.locator('.board-row').nth(4).locator('.square').nth(4)

      // Drag and drop
      await pawn.dragTo(e4Square)

      // Vérifier que le pion est maintenant en e4
      const movedPawn = e4Square.locator('.chess-piece')
      await expect(movedPawn).toBeVisible()

      // Vérifier que e2 est maintenant vide
      const e2Piece = e2Square.locator('.chess-piece')
      await expect(e2Piece).toHaveCount(0)
    })

    test('devrait enregistrer le mouvement dans l\'historique', async ({ page }) => {
      // Déplacer un pion
      const squares = page.locator('.board-row').nth(6).locator('.square')
      const e2Square = squares.nth(4)
      const pawn = e2Square.locator('.chess-piece')
      const e4Square = page.locator('.board-row').nth(4).locator('.square').nth(4)

      await pawn.dragTo(e4Square)

      // Vérifier que l'historique contient le mouvement
      await expect(page.locator('.move-count')).toHaveText('Total: 1 mouvement(s)')
      await expect(page.locator('.move-entry')).toHaveCount(1)
      await expect(page.locator('.no-moves')).toHaveCount(0)
    })

    test('devrait afficher la notation du mouvement dans l\'historique', async ({ page }) => {
      // Déplacer un pion de e2 à e4
      const e2Square = page.locator('.board-row').nth(6).locator('.square').nth(4)
      const pawn = e2Square.locator('.chess-piece')
      const e4Square = page.locator('.board-row').nth(4).locator('.square').nth(4)

      await pawn.dragTo(e4Square)

      // Vérifier la notation
      const moveEntry = page.locator('.move-entry').first()
      await expect(moveEntry.locator('.move-notation')).toContainText('e2 → e4')
    })

    test('devrait pouvoir capturer une pièce adverse', async ({ page }) => {
      // D'abord, déplacer le pion blanc e2 vers e7 pour capturer le pion noir
      const e2Square = page.locator('.board-row').nth(6).locator('.square').nth(4)
      const whitePawn = e2Square.locator('.chess-piece')
      const e7Square = page.locator('.board-row').nth(1).locator('.square').nth(4)

      // Vérifier qu'il y a un pion noir en e7
      await expect(e7Square.locator('.chess-piece.black')).toBeVisible()

      await whitePawn.dragTo(e7Square)

      // Vérifier que c'est maintenant un pion blanc en e7
      await expect(e7Square.locator('.chess-piece.white')).toBeVisible()

      // Vérifier que la capture est mentionnée dans l'historique
      const moveEntry = page.locator('.move-entry').first()
      await expect(moveEntry.locator('.captured')).toBeVisible()
    })
  })

  test.describe('Bouton de réinitialisation', () => {
    test('devrait réinitialiser le plateau après des mouvements', async ({ page }) => {
      // Faire un mouvement
      const e2Square = page.locator('.board-row').nth(6).locator('.square').nth(4)
      const pawn = e2Square.locator('.chess-piece')
      const e4Square = page.locator('.board-row').nth(4).locator('.square').nth(4)

      await pawn.dragTo(e4Square)

      // Vérifier que le mouvement a été fait
      await expect(page.locator('.move-count')).toHaveText('Total: 1 mouvement(s)')

      // Cliquer sur réinitialiser
      await page.locator('.reset-button').click()

      // Vérifier que l'historique est vide
      await expect(page.locator('.move-count')).toHaveText('Total: 0 mouvement(s)')
      await expect(page.locator('.no-moves')).toHaveText('Aucun mouvement')

      // Vérifier que le pion est de retour en e2
      const resetPawn = e2Square.locator('.chess-piece')
      await expect(resetPawn).toBeVisible()

      // Vérifier que e4 est vide
      const e4Piece = e4Square.locator('.chess-piece')
      await expect(e4Piece).toHaveCount(0)
    })

    test('devrait restaurer toutes les 32 pièces après réinitialisation', async ({ page }) => {
      // Faire plusieurs mouvements avec capture
      const e2Square = page.locator('.board-row').nth(6).locator('.square').nth(4)
      const whitePawn = e2Square.locator('.chess-piece')
      const e7Square = page.locator('.board-row').nth(1).locator('.square').nth(4)

      await whitePawn.dragTo(e7Square)

      // Maintenant il y a 31 pièces
      await expect(page.locator('.chess-piece')).toHaveCount(31)

      // Réinitialiser
      await page.locator('.reset-button').click()

      // Vérifier que toutes les pièces sont de retour
      await expect(page.locator('.chess-piece')).toHaveCount(32)
    })
  })

  test.describe('Plusieurs mouvements', () => {
    test('devrait enregistrer plusieurs mouvements consécutifs', async ({ page }) => {
      // Mouvement 1: e2 -> e4
      const e2Square = page.locator('.board-row').nth(6).locator('.square').nth(4)
      const e4Square = page.locator('.board-row').nth(4).locator('.square').nth(4)
      await e2Square.locator('.chess-piece').dragTo(e4Square)

      // Mouvement 2: d7 -> d5
      const d7Square = page.locator('.board-row').nth(1).locator('.square').nth(3)
      const d5Square = page.locator('.board-row').nth(3).locator('.square').nth(3)
      await d7Square.locator('.chess-piece').dragTo(d5Square)

      // Mouvement 3: g1 -> f3 (cavalier)
      const g1Square = page.locator('.board-row').nth(7).locator('.square').nth(6)
      const f3Square = page.locator('.board-row').nth(5).locator('.square').nth(5)
      await g1Square.locator('.chess-piece').dragTo(f3Square)

      // Vérifier le compteur
      await expect(page.locator('.move-count')).toHaveText('Total: 3 mouvement(s)')

      // Vérifier qu'il y a 3 entrées dans l'historique
      await expect(page.locator('.move-entry')).toHaveCount(3)
    })
  })
})
