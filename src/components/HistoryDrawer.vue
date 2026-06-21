<script setup>
import {NDrawer, NDrawerContent} from "naive-ui";
import {computed} from "vue";
import MatchCard from "./MatchCard.vue";

const props = defineProps({
  active: Boolean,
  history: Array,
});

const emit = defineEmits(['update:active'])

const drawerActive = computed({
  get: () => props.active,
  set: (val) => emit('update:active', val)
})

function closeDrawer() {
  drawerActive.value = false;
}

</script>

<template>
  <n-drawer
      v-model:show="drawerActive"
      width="100%"
      placement="right"
      :auto-focus="false">
    <n-drawer-content>
      <h2 class="drawer-title">Partidas Anteriores</h2>
      <button
          key="close-btn"
          class="close-drawer"
          @click="closeDrawer">
        &times;
      </button>
      <ul class="match-list">
        <MatchCard
            v-for="match in history"
            :key="match.match_id"
            :match="match"
            :winners="match.winners"
            :losers="match.losers"/>
      </ul>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="sass">
.drawer-title
  display: flex
  gap: 12px
  align-items: center
  padding-bottom: 12px
  margin-bottom: 16px
  border-bottom: 1px solid #948772

.match-list
  list-style: none
  display: flex
  flex-direction: column
  gap: 16px
</style>
