<script setup>
import ChessBoard from './components/ChessBoard.vue'
</script>

<template>
  <div class="app">
    <header>
      <h1>Jeu d'Echecs</h1>
      <p class="subtitle">Glissez-déposez les pièces pour les déplacer</p>
    </header>
    <main>
      <ChessBoard />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid #333;
}

header h1 {
  margin: 0;
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: #888;
  font-size: 0.95rem;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2rem;
}
</style>
