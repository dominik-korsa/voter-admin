<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="setVisible"
    :persistent="loading"
  >
    <q-card class="generate-tokens-dialog">
      <q-form @submit.prevent="submit" class="column no-wrap">
        <q-card-section tag="h6" class="q-ma-none">
          Wygeneruj kody do głosowania
        </q-card-section>
        <q-separator />
        <q-item>
          <q-item-section>
            <q-select
              v-model="classSelection"
              label="Klasa"
              autofocus
              filled
              :options="classItems"
              :option-label="option => option.label"
              :option-value="option => option.uuid"
            />
          </q-item-section>
          <q-item-section>
            <q-input
              v-model.number="number"
              label="Liczba kodów"
              filled
              type="number"
              min="0"
              max="100"
            />
          </q-item-section>
        </q-item>
        <q-separator />
        <q-card-section class="row justify-end">
          <q-btn
            flat
            color="primary"
            :disable="loading"
            @click="setVisible(false)"
          >
            Anuluj
          </q-btn>
          <q-btn
            outline
            class="q-ml-sm"
            color="primary"
            :loading="loading"
            type="submit"
            :disable="!valid"
          >
            Dodaj
          </q-btn>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref, watch,
} from 'vue';
import { useQuasar } from 'quasar';
import { ClassResponse, GenerateTokensResponse } from 'src/api/types';
import { API, useAPI } from 'src/api';

interface ClassItem {
  uuid: string;
  label: string;
}

export default defineComponent({
  props: {
    modelValue: Boolean,
    classes: {
      type: Array as PropType<ClassResponse[]>,
      required: true,
    },
    addBatch: {
      type: Function as PropType<(batch: GenerateTokensResponse) => Promise<void> | void>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup: (props, { emit }) => {
    const api = useAPI();
    const quasar = useQuasar();

    const classItems = computed<ClassItem[]>(() => [
      {
        label: 'Bez klasy',
        uuid: API.noClass,
      },
      ...props.classes.map((item) => ({
        label: `Klasa ${item.name}`,
        uuid: item.class,
      })),
    ]);

    const loading = ref(false);
    const number = ref(0);
    const classSelection = ref<ClassItem | null>(null);

    watch(() => props.modelValue, (value) => {
      if (value) return;
      number.value = 0;
    });
    const setVisible = (visible: boolean) => emit('update:modelValue', visible);

    const valid = computed(() => classSelection.value && number.value > 0);

    return ({
      setVisible,
      loading,
      valid,
      number,
      classSelection,
      classItems,
      submit: async () => {
        if (loading.value) return;
        if (!valid.value || !classSelection.value) return;
        loading.value = true;
        try {
          const result = await api.generateTokens(classSelection.value.uuid, number.value);
          await props.addBatch(result);
          setVisible(false);
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas generowania kodów',
          });
        }
        loading.value = false;
      },
    });
  },
});
</script>

<style lang="scss">
.generate-tokens-dialog {
  width: 350px;
}
</style>
