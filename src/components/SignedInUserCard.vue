<template>
  <q-card bordered>
    <template v-if="userManager.user !== null">
      <q-card-section class="row">
        <div class="q-mr-sm">
          Witaj, <b>{{ userManager.user.username }}</b>!
        </div>
        <div>
          Jesteś zalogowany jako <b>{{ userManager.user.email }}</b>
        </div>
      </q-card-section>
      <q-separator />
    </template>
    <div class="row no-wrap">
      <q-btn
        flat
        color="primary"
        stretch
        no-caps
        label="Idź do strony głosowania"
        class="col-filler"
      />
      <q-separator vertical />
      <q-btn
        flat
        color="negative"
        stretch
        no-caps
        label="Wyloguj się"
        @click="signOut"
      />
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserManager } from 'src/composables/user-manager';
import { useAPI } from 'src/api';
import { useQuasar } from 'quasar';

export default defineComponent({
  setup: () => {
    const userManager = useUserManager();
    const api = useAPI();
    const quasar = useQuasar();

    return ({
      userManager,
      signOut: async () => {
        try {
          await api.signOut();
          userManager.replaceUser(null);
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Nie udało się wylogować',
          });
        }
      },
    });
  },
});
</script>
