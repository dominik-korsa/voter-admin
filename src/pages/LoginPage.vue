<template>
  <q-page padding class="login-page">
    <q-card bordered>
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-pb-none">
          <q-input
            v-model="username"
            label="Nazwa użytkownika"
            required
            autofocus
            autocomplete="username"
            filled
          />
          <q-input
            v-model="password"
            class="q-mt-md"
            label="Hasło"
            type="password"
            required
            autocomplete="current-password"
            filled
          />
        </q-card-section>
        <q-card-section class="row justify-end q-py-sm">
          <q-btn
            href="/"
            label="Wróć do głosowania"
            no-caps
            flat
            class="q-my-xs"
          />
          <q-btn
            type="submit"
            label="Zaloguj się"
            color="primary"
            no-caps
            unelevated
            class="q-ml-xs q-my-xs"
            :loading="loading"
          />
        </q-card-section>
      </q-form>
    </q-card>
  </q-page>
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

    const loading = ref(false);

    return {
      username,
      password,
      loading,
      onSubmit: async () => {
        if (loading.value) return;
        loading.value = true;
        try {
          const result = await api.login(username.value.trim(), password.value.trim());
          if (result.type === 'ok') {
            userManager.replaceUser(result.user);
          } else {
            quasar.notify({
              type: 'negative',
              message: {
                user_does_not_exist: 'Użytkownik o podanej nazwie nie istnieje',
                wrong_password: 'Błędne hasło',
              }[result.type],
            });
          }
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas logowania',
          });
        }
        loading.value = false;
      },
    };
  },
});
</script>

<style lang="scss">
.login-page {
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
