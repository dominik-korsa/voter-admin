<template>
  <home-card class="print-card" label="Wydrukuj kody do głosowania">
    <q-card-section class="print-card__options">
      <radio-card v-model="printSelection" label="Tylko tylna strona" name="back" />
      <radio-card v-model="printSelection" label="Przednia strona" name="front" />
      <radio-card v-model="printSelection" label="Obustronnie" name="both" />
    </q-card-section>
  </home-card>
</template>

<script lang="ts">
import RadioCard from 'components/RadioCard.vue';
import { defineComponent, ref } from 'vue';
import HomeCard from 'components/HomeCard.vue';

export default defineComponent({
  components: { HomeCard, RadioCard },
  setup: () => ({
    printSelection: ref('back'),
  }),
});
</script>

<style lang="scss">
.print-card {
  .print-card__options {
    display: flex;
    gap: 12px;

    & > div {
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 0;
    }
  }
}
</style>
