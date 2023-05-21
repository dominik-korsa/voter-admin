<template>
  <q-dialog
    :model-value="batch !== null"
    @update:model-value="onVisibilityChange"
  >
    <q-card>
      <q-card-section tag="h6" class="q-ma-none text-negative">
        Unieważnij kody do głosowania
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pb-none">
        Czy na pewno chcesz unieważnić tę serię kodów do głosowania?<br>
        Wszystkie oddane głosy nie będą już uwzględniane w wynikach
        <q-card bordered flat class="q-mt-md">
          <q-item>
            <token-batch-header v-if="batch" :batch="batch" />
          </q-item>
        </q-card>
      </q-card-section>
      <q-card-section class="row justify-end">
        <q-btn flat color="primary" @click="close()">
          Anuluj
        </q-btn>
        <q-btn
          outline
          class="q-ml-sm"
          color="negative"
          :loading="loading"
          @click="submit"
        >
          Unieważnij
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useAPI } from 'src/api';
import { defineComponent, PropType, ref } from 'vue';
import { useQuasar } from 'quasar';
import TokenBatchHeader from 'components/TokenBatchHeader.vue';
import { TokenBatch } from 'src/types';

export default defineComponent({
  components: { TokenBatchHeader },
  props: {
    batch: {
      type: Object as PropType<TokenBatch | null>,
      required: false,
      default: null,
    },
    updateBatchList: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
  },
  emits: ['close'],
  setup: (props, { emit }) => {
    const api = useAPI();
    const quasar = useQuasar();

    const loading = ref(false);

    const close = () => emit('close');
    return ({
      close,
      loading,
      onVisibilityChange: (value: boolean) => {
        if (!value) close();
      },
      submit: async () => {
        if (loading.value) return;
        if (!props.batch) return;
        loading.value = true;
        try {
          await api.revokeTokenBatch(props.batch.uuid);
          await props.updateBatchList();
          close();
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas unieważniania kodów',
          });
        }
        loading.value = false;
      },
    });
  },
});
</script>
