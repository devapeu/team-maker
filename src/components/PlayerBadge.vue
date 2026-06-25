<script setup>
import { NDropdown } from "naive-ui"
import { h } from "vue"
const emit = defineEmits(['click-profile', 'click-score', 'change-god']);

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
});

function clickProfile() {
  emit('click-profile', props.player.id);
}

function clickScore(e) {
  e.preventDefault();
  emit('click-score', props.player.id);
}

function renderGodDropdownLabel(option) {
  const children = [
    h('img', {
      src: `/img/gods/${option.god}_icon.avif`,
      alt: option.god,
      class: 'god-dropdown-option__icon',
      style: { width: '28px', height: '28px', verticalAlign: 'middle' },
    }),
    h('span', { class: 'god-dropdown-option__name', innerHTML: option.god }),
  ]
  if (option.elo != null) {
    children.push(h('span', { class: 'god-dropdown-option__elo', innerHTML: Math.round(option.elo) }))
  }
  return h('span', { class: 'god-dropdown-option' }, children)
}
function handleGodSelection(key) {
  emit('change-god', {
    id: props.player.id,
    god: key,
  });
}

</script>
<template>
  <div class="player">
    <div
      class="player__icon"
      tabindex="0"
      role="button"
      :style="{ borderLeftColor: player.color }"
      @click="clickProfile">
      <img
        class="player__avatar"
        :src="`/img/gods/${player.god}_icon.avif`"/>
    </div>
    <div class="player__name">{{ player.name }} </div>
    <n-dropdown
        class="player__god-dropdown"
        :options="player?.eloData?.gods"
        trigger="click"
        :render-label="renderGodDropdownLabel"
        @select="handleGodSelection">
      <span
          class="player__score"
          tabindex="0"
          role="button"
          @contextmenu="clickScore">
        {{ player.elo }}
      </span>
    </n-dropdown>
  </div>

</template>