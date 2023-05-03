<template>
  <q-page class="row items-center justify-evenly">
    <admin-list />
    {{ systemInfo }}
    <template v-if="systemInfo.state === 'ready' && !systemInfo.data.provisioned">
      <q-btn @click="provisionFormVisible = true" label="Skonfiguruj system" />
      <q-dialog v-model="provisionFormVisible" class="provision-dialog">
        <provision-form :update-system-info="updateSystemInfo" />
      </q-dialog>
    </template>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AdminList from 'components/AdminList.vue';
import { SystemInfo } from 'src/api/types';
import { useLoadingState } from 'src/composables/loading';
import ProvisionForm from 'components/ProvisionForm.vue';
import { useAPI } from 'src/api';

export default defineComponent({
  name: 'IndexPage',
  components: { ProvisionForm, AdminList },
  setup() {
    const api = useAPI();

    const systemInfo = useLoadingState<SystemInfo>(async () => api.getSystemInfo());

    return {
      systemInfo,
      provisionFormVisible: ref(false),
      updateSystemInfo: async () => {
        if (systemInfo.value.state !== 'ready') return;
        await systemInfo.value.reload();
      },
    };
  },
});
</script>
