<template>
  <q-page padding class="index-page q-pb-xl">
    <signed-in-user-card />
    <home-card label="Stan systemu">
      <q-skeleton height="85px" square v-if="systemInfo.state === 'loading'"/>
      <q-card-section v-else-if="systemInfo.state === 'error'" class="text-negative">
        {{ systemInfo.error.friendlyMessage }}
      </q-card-section>
      <system-info-card
        v-else
        :system-info="systemInfo.data"
        :update-system-info="updateSystemInfo"
      />
    </home-card>

    <template v-if="systemInfo.state === 'ready' && systemInfo.data.provisioned">
      <class-list :classes="systemInfo.data.classes" />
      <print-card />
    </template>

    <admin-list />
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
import SignedInUserCard from 'components/SignedInUserCard.vue';
import HomeCard from 'components/HomeCard.vue';

export default defineComponent({
  name: 'IndexPage',
  components: {
    HomeCard,
    SignedInUserCard,
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
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;

  > *:not(:first-child) {
    margin-top: 24px;
  }

  .index-page__logos-list {
    margin: 0 -4px;
  }
}
</style>
