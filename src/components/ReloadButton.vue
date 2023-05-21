<template>
  <q-btn
    icon="refresh"
    aria-label="Odśwież"
    flat
    round
    color="primary"
    :loading="loading"
    :disable="disable"
    @click="onClick"
  >
    <q-tooltip>Odśwież</q-tooltip>
  </q-btn>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
  reload:() => Promise<void>;
  disable: boolean;
}>();

const loading = ref(false);

const onClick = async () => {
  if (loading.value) return;
  loading.value = true;
  await props.reload().catch(console.error);
  loading.value = false;
};
</script>
