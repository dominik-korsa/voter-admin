<template>
  <div>
    <q-form @submit.prevent="onSubmit">
      <q-input v-model="username" label="Nazwa użytkownika" required autofocus />
      <q-input v-model="password" label="Hasło" type="password" required />
      <q-btn type="submit" label="Zaloguj się" />
    </q-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useUserManager } from 'src/composables/user-manager';
import { useQuasar } from 'quasar';
import { useAPI } from 'src/api';

export default defineComponent({
  setup: () => {
    const userManager = useUserManager();
    const quasar = useQuasar();
    const api = useAPI();

    const username = ref('');
    const password = ref('');
    return ({
      username,
      password,
      onSubmit: async () => {
        try {
          const result = await api.login(username.value.trim(), password.value.trim());
          if (result.type === 'ok') {
            userManager.replaceUser(result.user);
            return;
          }
          quasar.notify({
            type: 'negative',
            message: {
              user_does_not_exist: 'Użytkownik o podanej nazwie nie istnieje',
              wrong_password: 'Błędne hasło',
            }[result.type],
          });
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas logowania',
          });
        }
      },
    });
  },
});
</script>
