<template>
  <home-card label="Lista administratorów">
    <q-list separator v-if="adminList.state === 'loading'">
      <q-item>
        <q-item-section>
          <q-item-label>
            <q-skeleton type="text" width="25%" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton type="text" width="40%" />
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-card-section v-else-if="adminList.state === 'error'" class="text-negative">
      {{ adminList.error.friendlyMessage }}
    </q-card-section>
    <q-list v-else separator>
      <q-item
        v-for="admin in adminList.data"
        :key="admin.uuid"
        :data-uuid="admin.uuid"
      >
        <q-item-section>
          <q-item-label>
            {{ admin.name }}
            <b v-if="isSelf(admin.uuid)">(ty)</b>
          </q-item-label>
          <q-item-label caption>
            {{ admin.email }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn icon="more_vert" flat round>
            <q-menu
              anchor="top right"
              self="top right"
              auto-close
            >
              <q-list>
                <q-item
                  clickable
                  @click="deleteAdmin(admin)"
                >
                  <q-item-section side>
                    <q-icon name="remove" />
                  </q-item-section>
                  <q-item-section>Usuń użytkownika</q-item-section>
                </q-item>
                <q-item clickable @click="changePassword(admin)">
                  <q-item-section side>
                    <q-icon name="key" />
                  </q-item-section>
                  <q-item-section>Zmień hasło</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator />
    <div class="row no-wrap">
      <q-btn
        label="Dodaj administratora"
        color="primary"
        stretch
        class="col-filler"
        flat
        no-caps
        :disable="adminList.state !== 'ready'"
        @click="registerDialogVisible = true"
      />
      <q-separator vertical />
      <q-btn
        label="Wyloguj wszystkich"
        color="negative"
        stretch
        class="col-filler"
        flat
        no-caps
        :loading="logoutAllLoading"
        @click="logoutAll()"
      />
    </div>
    <register-admin-dialog
      v-model="registerDialogVisible"
      :update-admin-list="updateList"
    />
    <delete-admin-dialog
      :admin="deletedAdmin"
      :update-admin-list="updateList"
      @close="deletedAdmin = null"
    />
    <change-password-dialog
      :admin="passwordChangedAdmin"
      @close="passwordChangedAdmin = null"
    />
  </home-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { LoadingError, useLoadingState } from 'src/composables/loading';
import { useAPI } from 'src/api';
import RegisterAdminDialog from 'components/RegisterAdminDialog.vue';
import { useUserManager } from 'src/composables/user-manager';
import { AdminListItem } from 'src/api/types';
import DeleteAdminDialog from 'components/DeleteAdminDialog.vue';
import ChangePasswordDialog from 'components/ChangePasswordDialog.vue';
import HomeCard from 'components/HomeCard.vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  components: {
    HomeCard, ChangePasswordDialog, DeleteAdminDialog, RegisterAdminDialog,
  },
  setup: () => {
    const quasar = useQuasar();
    const api = useAPI();
    const userManager = useUserManager();

    const adminList = useLoadingState(async () => {
      try {
        return await api.getAdminList();
      } catch (error) {
        throw new LoadingError(
          'Nie udało się wczytać listy administratorów',
          error,
        );
      }
    });
    const registerDialogVisible = ref(false);
    const deletedAdmin = ref<AdminListItem | null>(null);
    const passwordChangedAdmin = ref<AdminListItem | null>(null);
    const logoutAllLoading = ref(false);

    return ({
      adminList,
      registerDialogVisible,
      deletedAdmin,
      passwordChangedAdmin,
      isSelf: (userUuid: string) => userManager.user?.uuid === userUuid,
      deleteAdmin: async (admin: AdminListItem) => {
        deletedAdmin.value = admin;
      },
      changePassword: async (admin: AdminListItem) => {
        passwordChangedAdmin.value = admin;
      },
      logoutAllLoading,
      logoutAll: async () => {
        logoutAllLoading.value = true;
        try {
          await api.logoutAllSquared();
          await userManager.update();
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Podczas wylogowywania wszystkich użytkowników wystąpił nieoczekiwany błąd',
          });
          await userManager.update().catch();
        }
        logoutAllLoading.value = false;
      },
      updateList: async () => {
        if (adminList.value.state !== 'ready') return;
        await adminList.value.reload();
      },
    });
  },
});
</script>
