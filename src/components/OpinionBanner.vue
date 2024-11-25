<template>
  <div class="opinion-banner">
    <div class="opinion-banner__label">
      ¿Es buen equipo?
    </div>
    <button 
      class="opinion-banner__button"
      :class="{ 'opinion-banner__button--true': teamOpinion === true }"
      @click="updateOpinion(true)">Ta weno 😎</button>
    <button 
      class="opinion-banner__button"
      :class="{ 'opinion-banner__button--false': teamOpinion === false }"
      @click="updateOpinion(false)">Wakala 🤢</button>
  </div>
</template>
<script setup>
const { teamOpinion } = defineProps({
  teamOpinion: {
    type: [Boolean, undefined],
    default: undefined,
  }
})

const emit = defineEmits(['update']);

function updateOpinion(value) {
  if (teamOpinion === value) emit('update', undefined)
  emit('update', value);
}

</script>
<style lang="sass">
.opinion-banner
  display: flex
  gap: 12px 
  justify-content: center
  align-items: center
  padding: 8px 
  background: #eee
  font-size: 14px
  box-sizing: border-box
  max-width: 450px
  width: 100%
  margin: auto
  @media (prefers-color-scheme: dark)
    background: #2d2d2d
  @media (max-width: 480px)
    flex-wrap: wrap
  &__label
    @media (max-width: 480px)
      flex: 1 1 100%
  &__button
    padding: 6px 12px
    &--true
      border: 1px solid #22c55e
      background-color: #bbf7d0
    &--false
      border: 1px solid #ef4444
      background-color: #fee2e2
  </style>