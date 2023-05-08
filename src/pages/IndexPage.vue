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

    <q-card
      v-if="systemInfo.state === 'ready' && systemInfo.data.provisioned"
      bordered
      flat
      class="q-mt-md"
    >
      <q-card-section class="text-overline q-py-xs">
        Lista klas
      </q-card-section>
      <q-separator/>
      <q-list separator>
        <q-item
          v-for="item in classItems"
          :key="item.class"
          class="items-start"
          :data-uuid="item.class"
        >
          <q-item-section class="col-side q-mr-sm">
            <div class="text-overline">Nazwa</div>
            {{ item.name }}
          </q-item-section>
          <q-item-section class="q-mr-sm">
            <div class="text-overline">Numery logo</div>
            <div class="index-page__logos-list">
              <q-chip
                v-for="logo in item.logos"
                :key="logo"
                :label="logo"
                dense
              />
            </div>
          </q-item-section>
          <q-item-section class="col-side" v-if="item.tokenCount !== null">
            <div class="text-overline">Kody do głosowania</div>
            <div>
              <span class="text-green-9">
                <b>{{ item.tokenCount.used }}</b> użytych
              </span>
              /
              <span class="text-red-9">
                <b>{{ item.tokenCount.unused }}</b> nieużytych
              </span>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <print-card
      v-if="systemInfo.state === 'ready' && systemInfo.data.provisioned"
      class="q-mt-md"
    />

    <admin-list class="q-mt-md" />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import AdminList from 'components/AdminList.vue';
import { ClassResponse, SystemInfo } from 'src/api/types';
import { useLoadingState } from 'src/composables/loading';
import { useAPI } from 'src/api';
import SystemInfoCard from 'components/SystemInfoCard.vue';
import PrintCard from 'components/PrintCard.vue';

export interface ClassItem extends ClassResponse {
  tokenCount: null | { used: number; unused: number; };
}

export default defineComponent({
  name: 'IndexPage',
  components: {
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
      classItems: computed<ClassItem[] | null>(() => {
        if (systemInfo.value.state !== 'ready') return null;
        if (!systemInfo.value.data.provisioned) return null;
        return systemInfo.value.data.classes.map((item): ClassItem => ({
          ...item,
          tokenCount: null,
        }));
      }),
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
