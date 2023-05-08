<template>
  <q-dialog
    :model-value="admin !== null"
    @update:model-value="onVisibilityChange"
  >
    <q-card>
      <q-form @submit.prevent="submit">
        <q-card-section tag="h6" class="q-ma-none">
          Zmień hasło administratora
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pb-none">
          <q-card bordered flat class="q-mb-md">
            <q-item>
              <q-item-section>
                <q-item-label>{{ admin.name }}</q-item-label>
                <q-item-label caption>{{ admin.email }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-card>
          <q-input
            v-model="password"
            filled
            label="Nowe hasło"
            type="password"
            :rules="passwordRules"
            autofocus
            autocomplete="new-password"
          />
        </q-card-section>
        <q-card-section class="row justify-end">
          <q-btn flat color="primary" @click="close()">
            Anuluj
          </q-btn>
          <q-btn
            outline
            class="q-ml-sm"
            color="primary"
            :loading="loading"
            type="submit"
          >
            Zmień hasło
          </q-btn>
        </q-card-section>
      </q-form>
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
    admin: {
      type: Object as PropType<AdminListItem | null>,
      required: false,
      default: null,
    },
  },
  emits: ['close'],
  setup: (props, { emit }) => {
    const api = useAPI();
    const quasar = useQuasar();

    const password = ref('');
    const loading = ref(false);

    const close = () => {
      emit('close');
      password.value = '';
    };
    return ({
      password,
      passwordRules: [
        (value: string) => value.trim() !== '' || 'Hasło jest wymagane',
        (value: string) => value.trim() === value || 'Hasło nie może zaczynać ani kończyć się spacją',
      ],
      close,
      loading,
      onVisibilityChange: (value: boolean) => {
        if (!value) close();
      },
      submit: async () => {
        if (loading.value) return;
        if (!props.admin) return;
        loading.value = true;
        try {
          await api.changePassword(props.admin.uuid, password.value.trim());
          close();
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas zmiany hasła',
          });
        }
        loading.value = false;
      },
    });
  },
});
</script>
