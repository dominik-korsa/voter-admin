<template>
  <q-page padding class="index-page">
    <q-card bordered flat>
      <q-card-section class="text-overline q-py-xs">
        Stan systemu
      </q-card-section>
      <q-separator/>
      <q-skeleton height="85px" square v-if="systemInfo.state === 'loading'"/>
      <q-card-section v-else-if="systemInfo.state === 'error'" class="text-negative">
        {{ systemInfo.error.friendlyMessage }}
      </q-card-section>
      <system-info-card
        v-else
        :system-info="systemInfo.data"
        :update-system-info="updateSystemInfo"
      />
    </q-card>

    <template v-if="systemInfo.state === 'ready' && systemInfo.data.provisioned">
      <class-list class="q-mt-md" :classes="systemInfo.data.classes" />
      <print-card class="q-mt-md"/>
    </template>

    <admin-list class="q-mt-md" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AdminList from 'components/AdminList.vue';
import { SystemInfo } from 'src/api/types';
import { useLoadingState } from 'src/composables/loading';
import { useAPI } from 'src/api';
import SystemInfoCard from 'components/SystemInfoCard.vue';
import PrintCard from 'components/PrintCard.vue';
import ClassList from 'components/ClassList.vue';

export default defineComponent({
  name: 'IndexPage',
  components: {
    ClassList,
    PrintCard,
    SystemInfoCard,
    AdminList,
  },
  setup() {
    const api = useAPI();

    const systemInfo = useLoadingState<SystemInfo>(() => api.getSystemInfo());

    const updateSystemInfo = async () => {
      if (systemInfo.value.state !== 'ready') return;
      await systemInfo.value.reload();
    };
    return {
      systemInfo,
      updateSystemInfo,
    };
  },
});
</script>

<style lang="scss">
.index-page {
  .index-page__logos-list {
    margin: 0 -4px;
  }
}
</style>
