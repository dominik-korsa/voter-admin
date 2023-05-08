<template>
  <q-card bordered flat>
    <q-card-section class="text-overline q-py-xs">
      Lista administratorów
    </q-card-section>
    <q-separator/>
    <q-item v-if="adminList.state === 'loading'">
      <q-item-section>
        <q-item-label>
          <q-skeleton type="text" width="25%" />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton type="text" width="40%" />
        </q-item-label>
      </q-item-section>
    </q-item>
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
    </q-list>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { LoadingError, useLoadingState } from 'src/composables/loading';
import { useAPI } from 'src/api';

export default defineComponent({
  setup: () => {
    const api = useAPI();
    const adminList = useLoadingState(async () => {
      try {
        return api.getAdminList();
      } catch (error) {
        throw new LoadingError(
          'Nie udało się wczytać listy administratorów',
          error,
        );
      }
    });
    return ({
      adminList,
    });
  },
});
</script>
