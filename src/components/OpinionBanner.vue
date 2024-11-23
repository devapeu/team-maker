<template>
  <div class="opinion-banner">
    ¿Buen equipo?
    <button @click="updateOpinion">{{ teamOpinionLabel }}</button>
  </div>
</template>
<script setup>
import { defineEmits, defineProps, computed } from 'vue'

const { teamOpinion } = defineProps({
  teamOpinion: {
    type: [Boolean, undefined],
    default: undefined,
  }
})

const emit = defineEmits(['update']);

const teamOpinionLabel = computed(() => {
  if (teamOpinion === true) return 'Ta weno 😎';
  if (teamOpinion === false) return 'Cringe 🤢';
  return 'Cambiar opinion'
})

function updateOpinion() {
  if (teamOpinion === undefined) emit('update', true);
  else if (teamOpinion === true) emit('update', false);
  else if (teamOpinion === false) emit('update', undefined);
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
</style>