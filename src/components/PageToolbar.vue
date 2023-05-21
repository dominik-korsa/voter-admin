<template>
  <q-card class="page-toolbar">
    <q-toolbar>
      <div class="row items-center col-filler">
        <q-btn
          :to="homeTo"
          aria-label="Powrót"
          flat
          round
          icon="arrow_back"
        >
          <q-tooltip>Powrót</q-tooltip>
        </q-btn>
        <q-toolbar-title>{{ title }}</q-toolbar-title>
      </div>
      <div class="col-side row justify-center page-toolbar__buttons no-wrap">
        <slot />
      </div>
    </q-toolbar>
    <q-linear-progress
      v-if="loading"
      indeterminate
    />
  </q-card>
</template>

<script setup lang="ts">
import { routeNames } from 'src/router/route-constants';

defineProps<{
  title: string;
  loading: boolean;
}>();

const homeTo = {
  name: routeNames.home,
};
</script>

<style lang="scss">
.page-toolbar {
  .page-toolbar__buttons {
    gap: 4px;
  }
}
</style>
