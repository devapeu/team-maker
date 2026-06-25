<template>
  <main class="login">
    <form class="login__form" @submit.prevent="handleSubmit">
      <h1 class="login__title">Acceso de administrador</h1>
      <label class="login__label">
        Contraseña
        <input
          v-model="password"
          type="password"
          class="login__input"
          autofocus />
      </label>
      <button class="map-button login__button" type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </main>
  <div class="toast-container" aria-live="polite">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="`toast--${t.type}`">
      {{ t.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuth } from '../composables/useAdminAuth.js'
import { useToast } from '../composables/useToast.js'

const password = ref('')
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const { login } = useAdminAuth()
const { toasts, showToast } = useToast()

async function handleSubmit() {
  loading.value = true
  try {
    await login(password.value)
    router.push(route.query.redirect || { name: 'Admin' })
  } catch (err) {
    showToast(err.message || 'No se pudo iniciar sesión', 'error', 3000)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="sass" scoped>
.login
  display: flex
  justify-content: center
  padding: 64px 16px
  &__form
    display: flex
    flex-direction: column
    gap: 16px
    width: 100%
    max-width: 320px
    background: #161005
    border: 1px solid #948772
    border-radius: 5px
    padding: 24px
  &__title
    margin: 0 0 8px
    font-size: 20px
    text-align: center
  &__label
    display: flex
    flex-direction: column
    gap: 6px
    font-size: 13px
    color: #bbb
  &__input
    padding: 8px 10px
    background: #1c1b14
    color: white
    border: 1px solid #948772
    border-radius: 2px
  &__button
    margin-top: 8px
    text-align: center
    justify-content: center
</style>
