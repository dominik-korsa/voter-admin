<template>
  <div class="results-image">
    <q-list bordered separator class="rounded-borders overflow-hidden">
      <q-item v-for="(item, i) in items" :key="i">
        <q-item-section side>
          {{ item.emoji }}
        </q-item-section>
        <q-item-section>
          <q-skeleton height="40%" animation="none" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
const items = [
  { emoji: '🥇' },
  { emoji: '🥈' },
  { emoji: '🥉' },
];
</script>

<style lang="scss">
.results-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  .q-list {
    max-height: 100%;
    display: flex;
    flex-direction: column;

    .q-item {
      padding-top: 0;
      padding-bottom: 0;
      background: white;
      font-size: min(3vw, 24px);
      min-height: 0;
      height: 48px;
      flex-shrink: 1;
    }
  }
}
</style>
