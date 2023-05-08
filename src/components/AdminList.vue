<template>
  <q-card bordered flat>
    <q-card-section class="text-overline q-py-xs">
      Lista administratorów
    </q-card-section>
    <q-separator/>
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
      <q-item>
        <q-item-section side>
          <q-icon name="add" />
        </q-item-section>
        <q-item-section>
          <q-skeleton type="text" width="35%" />
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
          </q-item-label>
          <q-item-label caption>
            {{ admin.email }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="text-primary" clickable @click="adminDialogVisible = true">
        <q-item-section side>
          <q-icon name="add" color="primary" />
        </q-item-section>
        <q-item-section>
          Dodaj administratora
        </q-item-section>
      </q-item>
    </q-list>
    <register-admin-dialog
      v-model="adminDialogVisible"
      :update-admin-list="updateList"
    />
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { LoadingError, useLoadingState } from 'src/composables/loading';
import { useAPI } from 'src/api';
import RegisterAdminDialog from 'components/RegisterAdminDialog.vue';

export default defineComponent({
  components: { RegisterAdminDialog },
  setup: () => {
    const api = useAPI();

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
    const adminDialogVisible = ref(false);

    return ({
      adminList,
      adminDialogVisible,
      updateList: async () => {
        if (adminList.value.state !== 'ready') return;
        await adminList.value.reload();
      },
    });
  },
});
</script>
