<script setup>
import {NDrawer, NDrawerContent} from "naive-ui";
import {computed} from "vue";
import {getMapName} from "@/data/maps.js";

const props = defineProps({
  active: Boolean,
  history: Array,
});

const emit = defineEmits(['update:active'])

const drawerActive = computed({
  get: () => props.active,
  set: (val) => emit('update:active', val)
})

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const formatter = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return formatter.format(date);
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
      <ul>
        <li
            v-for="match in history"
            class="history__item">
          <div>
              <img
                  :src="`/img/maps/${match.mapname}.webp`"
                  style="width: 80px; display: block;"/>
            <p>
              {{ getMapName(match.mapname) }}

            </p>
            {{ formatDate(match.startgametime) }}
          </div>
          <div>
            <ul>
              <li
                  v-for="player in match.winners"
                  class="player-list__item">
                <img
                    width="32"
                    :src="`/img/gods/${player.god}_icon.avif`" />
                {{ player?.name }} ✅
              </li>
            </ul>
          </div>
          <div>
            <ul>
              <li
                  v-for="player in match.losers"
                  class="player-list__item">
                <img
                    width="32"
                    :src="`/img/gods/${player.god}_icon.avif`" />
                {{ player?.name }} ❌
              </li>
            </ul>
          </div>
        </li>
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
.history
  &__item
    display: grid
    grid-template-columns: 1fr 1fr 1fr
    gap: 20px
    padding-bottom: 20px
    margin-bottom: 20px
    border-bottom: 1px solid grey
    &:last-child
      border: none
.player-list
  &__item
    list-style: none
    display: flex
    align-items: center
    gap: 8px
    margin-bottom: 2px
</style>