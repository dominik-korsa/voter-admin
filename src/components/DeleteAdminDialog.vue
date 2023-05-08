<template>
  <q-dialog
    :model-value="deletedAdmin !== null"
    @close="close()"
  >
    <q-card>
      <q-card-section tag="h6" class="q-ma-none">
        Usuwanie administratora
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pb-none">
        Czy na pewno chcesz usunąć tego administratora?
        <q-card bordered flat class="q-mt-md">
          <q-item>
            <q-item-section>
              <q-item-label>{{ deletedAdmin.name }}</q-item-label>
              <q-item-label caption>{{ deletedAdmin.email }}</q-item-label>
            </q-item-section>
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
          Usuń
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useAPI } from 'src/api';
import { defineComponent, PropType, ref } from 'vue';
import { useQuasar } from 'quasar';
import { AdminListItem } from 'src/api/types';

export default defineComponent({
  props: {
    deletedAdmin: {
      type: Object as PropType<AdminListItem | null>,
      required: false,
      default: null,
    },
    updateAdminList: {
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
      submit: async () => {
        if (loading.value) return;
        if (!props.deletedAdmin) return;
        loading.value = true;
        try {
          await api.deleteAdmin(props.deletedAdmin.uuid);
          await props.updateAdminList();
          close();
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas usuwania administratora',
          });
        }
        loading.value = false;
      },
    });
  },
});
</script>
