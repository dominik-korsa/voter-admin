<template>
  <q-card bordered>
    <q-card-section class="text-overline q-py-xs">
      {{ label }}
    </q-card-section>
    <q-separator/>
    <slot />
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
  },
});
</script>
