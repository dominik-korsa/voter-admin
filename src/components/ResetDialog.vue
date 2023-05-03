<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="setVisible"
  >
    <q-card>
      <q-card-section tag="h6" class="q-ma-none text-negative">
        Zresetuj system
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-mb-xs q-ml-sm">Rozumiem, że:</div>
        <div
          v-for="(item, i) in checkboxes"
          :key="i"
          class="q-pr-sm"
        >
          <q-checkbox
            v-model="item.value"
          >
            <div v-html="item.text"></div>
          </q-checkbox>
        </div>
      </q-card-section>
      <q-card-section class="row justify-end">
        <q-btn flat color="primary" @click="setVisible(false)">
          Anuluj
        </q-btn>
        <q-btn
          outline
          class="q-ml-sm"
          color="negative"
          :loading="loading"
          :disable="!allConfirmed"
          @click="submit"
        >
          Zresetuj
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useAPI } from 'src/api';
import {
  computed, defineComponent, PropType, ref, watch,
} from 'vue';
import { useQuasar } from 'quasar';

interface Checkbox {
  text: string;
  value: boolean;
}

export default defineComponent({
  props: {
    modelValue: Boolean,
    updateSystemInfo: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup: (props, { emit }) => {
    const api = useAPI();
    const quasar = useQuasar();

    const checkboxes = ref<Checkbox[]>(
      [
        'wszystkie logo zostaną usunięte',
        'wszystkie głosy zostaną usunięte',
        'wszystkie kody do głosowania przestaną działać',
        'wyniki tego głosowania przepadną na zawsze',
        'konta administratorów <b>pozostaną ważne</b>',
      ].map((text) => ({
        text,
        value: false,
      })),
    );

    watch(() => props.modelValue, (value) => {
      if (value) return;
      checkboxes.value.forEach((el) => { el.value = false; });
    }, { immediate: true });

    const allConfirmed = computed(() => checkboxes.value.every((e) => e.value));
    const loading = ref(false);

    const setVisible = (visible: boolean) => emit('update:modelValue', visible);
    return ({
      setVisible,
      checkboxes,
      allConfirmed,
      loading,
      submit: async () => {
        if (loading.value || !allConfirmed.value) return;
        loading.value = true;
        try {
          await api.resetAll();
          setVisible(false);
          await props.updateSystemInfo();
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąił nieoczekiwany błąd podczas resetowania',
          });
        }
        loading.value = false;
      },
    });
  },
});
</script>
