<template>
  <q-card-section
    v-if="!systemInfo.provisioned"
    horizontal
    class="items-center"
  >
    <q-card-section>
      <q-icon name="close" size="md" />
    </q-card-section>
    <q-card-section class="q-pl-none col-filler">
      <div class="text-h5">System zresetowany</div>
      <div>Przed rozpoczęciem głosowania musisz wprowadzić numery logo klas</div>
    </q-card-section>
    <q-card-section>
      <q-btn
        @click="provisionFormVisible = true"
        label="Skonfiguruj system"
        color="primary"
        outline
      />
      <q-dialog v-model="provisionFormVisible" class="provision-dialog">
        <provision-form :update-system-info="updateSystemInfo" />
      </q-dialog>
    </q-card-section>
  </q-card-section>
  <q-card-section
    v-else
    horizontal
    class="items-center"
    :class="{
            'text-green-8': systemInfo.voting,
            'text-red-9': !systemInfo.voting,
          }"
  >
    <q-card-section>
      <q-icon name="check" size="md" v-if="systemInfo.voting" />
      <q-icon name="lock" size="md" v-else />
    </q-card-section>
    <q-card-section class="q-pl-none col-filler" v-if="systemInfo.voting">
      <div class="text-h5">Głosowanie w trakcie</div>
      <div>
        System został skonfigurowany,
        a uczniowie mogą oddać głos po otrzymaniu kodów
      </div>
    </q-card-section>
    <q-card-section class="q-pl-none col-filler" v-else>
      <div class="text-h5">Głosowanie zablokowane</div>
      <div>System został skonfigurowany, ale uczniowie nie mogą oddawać głosów</div>
    </q-card-section>
    <q-card-section class="column">
      <q-btn
        color="primary"
        outline
        :loading="loading"
        @click="toggleVoting"
      >
        {{ systemInfo.voting ? 'Zablokuj głosowanie' : 'Odblokuj głosowanie' }}
      </q-btn>
    </q-card-section>
  </q-card-section>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { SystemInfo } from 'src/api/types';
import ProvisionForm from 'components/ProvisionForm.vue';
import { useAPI } from 'src/api';
import { useQuasar } from 'quasar';

export default defineComponent({
  components: { ProvisionForm },
  props: {
    updateSystemInfo: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
    systemInfo: {
      type: Object as PropType<SystemInfo>,
      required: true,
    },
  },
  setup: (props) => {
    const api = useAPI();
    const quasar = useQuasar();

    const loading = ref(false);

    return {
      loading,
      provisionFormVisible: ref(false),
      toggleVoting: async () => {
        if (loading.value) return;
        loading.value = true;
        try {
          await api.setVotingEnabled(!props.systemInfo.voting);
          await props.updateSystemInfo();
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd',
          });
        }
        loading.value = false;
      },
    };
  },
});
</script>
