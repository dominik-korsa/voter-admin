<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="setVisible"
  >
    <q-card>
      <q-form @submit.prevent="submit">
        <q-card-section tag="h6" class="q-ma-none">
          Dodaj nowego administratora
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md q-pb-none">
          <q-input
            v-model="username"
            filled
            label="Nazwa użytkownika"
            :rules="usernameRules"
            hide-bottom-space
            autofocus
          />
          <q-input
            v-model="email"
            filled
            label="Adres e-mail"
            type="email"
            :rules="emailRules"
            hide-bottom-space
          />
          <q-input
            v-model="password"
            filled
            label="Hasło"
            type="password"
            :rules="passwordRules"
            hide-bottom-space
          />
        </q-card-section>
        <q-card-section class="row justify-end">
          <q-btn flat color="primary" @click="setVisible(false)">
            Anuluj
          </q-btn>
          <q-btn
            outline
            class="q-ml-sm"
            color="primary"
            :loading="loading"
            type="submit"
          >
            Dodaj
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

export default defineComponent({
  props: {
    modelValue: Boolean,
    updateAdminList: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup: (props, { emit }) => {
    const api = useAPI();
    const quasar = useQuasar();

    const loading = ref(false);

    const username = ref('');
    const email = ref('');
    const password = ref('');

    const setVisible = (visible: boolean) => emit('update:modelValue', visible);
    return ({
      username,
      email,
      password,
      usernameRules: [
        (value: string) => value.trim() !== '' || 'Nazwa użytkownika jest wymagana',
      ],
      emailRules: [
        (value: string) => value.trim() !== '' || 'Adres e-mail jest wymagany',
      ],
      passwordRules: [
        (value: string) => value.trim() !== '' || 'Hasło jest wymagane',
        (value: string) => value.trim() === value || 'Hasło nie może zaczynać ani kończyć się spacją',
      ],
      setVisible,
      loading,
      submit: async () => {
        if (loading.value) return;
        loading.value = true;
        try {
          const result = await api.createAdmin({
            email: email.value.trim(),
            username: username.value.trim(),
            password: password.value.trim(),
          });
          switch (result) {
            case null: {
              await props.updateAdminList();
              setVisible(false);
              break;
            }
            case 'USERNAME_OR_EMAIL_TAKEN': {
              quasar.notify({
                type: 'negative',
                message: 'Nazwa użytkownika albo adres e-mail jest już w użyciu',
              });
              break;
            }
            case 'INVALID_EMAIL_ADDRESS': {
              quasar.notify({
                type: 'negative',
                message: 'Podany adres e-mail jest niepoprawny',
              });
              break;
            }
          }
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas tworzenia administratora',
          });
        }
        loading.value = false;
      },
    });
  },
});
</script>
