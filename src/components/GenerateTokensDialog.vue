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
              :options="classes"
              :option-label="option => `Klasa ${option.name}`"
              :option-value="option => option.class"
            />
          </q-item-section>
          <q-item-section>
            <q-input
              v-model.number="number"
              label="Liczba kodów"
              filled
              type="number"
              min="0"
              max="50"
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
import { ClassResponse } from 'src/api/types';
import { useAPI } from 'src/api';

export default defineComponent({
  props: {
    modelValue: Boolean,
    classes: {
      type: Array as PropType<ClassResponse[]>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup: (props, { emit }) => {
    const api = useAPI();
    const quasar = useQuasar();

    const loading = ref(false);
    const number = ref(0);
    const classSelection = ref<ClassResponse | null>(null);

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
      submit: async () => {
        if (loading.value) return;
        if (!valid.value || !classSelection.value) return;
        loading.value = true;
        try {
          const result = await api.generateTokens(classSelection.value.class, number.value);
          const win = window.open(result.pdfUrl, '_blank');
          win?.focus();
          if (!win) {
            quasar.notify({
              message: `Wygenerowano kody <a href="${result.pdfUrl}">Pobierz</a>`,
              timeout: undefined,
              closeBtn: true,
            });
          }
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
