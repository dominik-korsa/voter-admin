<template>
  <q-card bordered flat class="print-card">
    <q-card-section class="text-overline q-py-xs">
      Wydrukuj kody do głosowania
    </q-card-section>
    <q-separator/>
    <q-card-section class="print-card__options">
      <radio-card v-model="printSelection" label="Tylko tylna strona" name="back" />
      <radio-card v-model="printSelection" label="Przednia strona" name="front" />
      <radio-card v-model="printSelection" label="Obustronnie" name="both" />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import RadioCard from 'components/RadioCard.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: { RadioCard },
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
