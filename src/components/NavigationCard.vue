<template>
  <q-btn
    stretch
    class="navigation-card col-filler q-py-none q-px-md"
    flat
    color="primary"
    no-caps
    :to="to"
  >
    <div class="full-height column">
      <div class="navigation-card__graphic q-mt-md">
        <slot />
      </div>
      <q-space />
      <div class="q-my-md">
        {{ label }}
      </div>
    </div>
  </q-btn>
</template>

<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router';

defineProps<{
  label: string;
  to: RouteLocationRaw;
}>();
</script>

<style lang="scss">
.navigation-card > .q-btn__content > div {
  width: 100%;
}

.navigation-card__graphic {
  aspect-ratio: 2/1;
  width: 100%;
}
</style>
