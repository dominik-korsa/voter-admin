<template>
  <q-item-section>
    <q-item-label>
      Kody dla klasy <b>{{ batch.className }}</b>
    </q-item-label>
    <q-item-label caption>
      Wygenerowane <b>{{ batch.generationDate }}</b>
    </q-item-label>
    <q-item-label caption>
      <div>
        <span class="text-green-9"><b>{{ batch.usedTokens.length }}</b> użytych</span>,
        <span class="text-red-9">
          <b>{{ batch.unusedTokens.length }}</b> nieużytych
        </span>
      </div>
    </q-item-label>
  </q-item-section>
</template>

<script lang="ts" setup>
import { TokenBatch } from 'src/types';

defineProps<{
  batch: TokenBatch,
}>();
</script>
