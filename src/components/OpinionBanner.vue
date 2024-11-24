<template>
  <div class="opinion-banner">
    ¿Buen equipo?
    <button 
      :class="{ 'opinion-banner__button--true': teamOpinion === true }"
      @click="updateOpinion(true)">Ta weno 😎</button>
    <button 
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
  padding: 12px 
  background: #eee
  &__button
    &--true
      border: 1px solid #22c55e
      background-color: #bbf7d0
    &--false
      border: 1px solid #ef4444
      background-color: #fee2e2
  </style>