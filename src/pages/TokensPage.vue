<template>
  <q-page padding class="tokens-page">
    <page-toolbar
      title="Lista kodów do głosowania"
      :loading="systemInfo.state === 'loading' || batches.state === 'loading'"
    >
      <template v-if="systemInfo.state === 'ready' && 'classes' in systemInfo.data">
        <q-btn
          label="Wygeneruj kody"
          color="primary"
          icon="add"
          no-caps
          flat
          rounded
          @click="tokensDialogVisible = true"
        />
        <generate-tokens-dialog
          v-model="tokensDialogVisible"
          :classes="systemInfo.data.classes"
          :add-batch="addBatch"
        />
      </template>
    </page-toolbar>
    <q-card
      v-if="systemInfo.state === 'error' || batches.state === 'error'"
      class="q-mt-lg text-negative"
    >
      <q-card-section class="row items-center">
        <q-icon size="md" name="error" left />
        <div>
          Wystąpił nieoczekiwany błąd
        </div>
      </q-card-section>
    </q-card>
    <q-card v-if="batches.state === 'ready'" class="q-mt-lg">
      <q-card-section v-if="batches.data.length === 0">
        <template v-if="systemInfo.state === 'ready' && !systemInfo.data.provisioned">
          System jest zresetowany,
          <router-link :to="homeTo">wróć</router-link>
          aby go skonfigurować
        </template>
        <template v-else>
          Nie wygenerowano żadnych kodów do głosowania
        </template>
      </q-card-section>
      <q-expansion-item
        v-for="batch in batches.data"
        :key="batch.uuid"
        :data-uuid="batch.uuid"
        class="border-bottom-optional"
        :model-value="isExpanded(batch.uuid)"
        @update:model-value="(value) => setExpanded(batch.uuid, value)"
        v-memo="[isExpanded(batch.uuid), batch]"
      >
        <template #header>
          <token-batch-header class="col-grow" :batch="batch" />
        </template>
        <div class="border-top">
          <div class="q-px-md q-pt-md row justify-center items-center q-gutter-sm">
            <q-btn
              outline
              color="primary"
              no-caps
              icon="print"
              label="Zobacz PDF"
              :href="batch.pdfUrl"
              target="_blank"
            />
            <q-btn
              outline
              color="negative"
              no-caps
              label="Unieważnij"
              @click="revokedBatch = batch"
            />
          </div>
          <div class="q-pa-md">
            <q-chip
              v-for="{ token } in batch.usedTokens"
              :key="token"
              text-color="green-9"
              :ripple="false"
              class="select-all font-monospace"
            >
              {{ token }}
            </q-chip>
            <q-chip
              v-for="{ token } in batch.unusedTokens"
              :key="token"
              text-color="red-9"
              :ripple="false"
              class="select-all font-monospace"
            >
              {{ token }}
            </q-chip>
          </div>
        </div>
      </q-expansion-item>
    </q-card>
    <revoke-tokens-dialog
      :batch="revokedBatch"
      :update-batch-list="updateBatches"
      @close="revokedBatch = null"
    />
  </q-page>
</template>

<style lang="scss">
.tokens-page {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
</style>

<script setup lang="ts">
import GenerateTokensDialog from 'components/GenerateTokensDialog.vue';
import { reactive, ref } from 'vue';
import { useAPI } from 'src/api';
import { useLoadingState } from 'src/composables/loading';
import { GenerateTokensResponse } from 'src/api/types';
import TokenBatchHeader from 'components/TokenBatchHeader.vue';
import { TokenBatch } from 'src/types';
import RevokeTokensDialog from 'components/RevokeTokensDialog.vue';
import PageToolbar from 'components/PageToolbar.vue';
import { routeNames } from 'src/router/route-constants';

const homeTo = {
  name: routeNames.home,
};

const api = useAPI();

const systemInfo = useLoadingState(() => api.getSystemInfo());
const batches = useLoadingState(
  async () => {
    const result = await api.getTokenBatches();
    return result
      .map((batch): TokenBatch => {
        const usedTokens = batch.tokens.filter((token) => token.used === true);
        const unusedTokens = batch.tokens.filter((token) => token.used === false);
        return {
          uuid: batch.batchUuid,
          usedTokens,
          className: batch.className,
          unusedTokens,
          timestamp: batch.timestamp,
          generationDate: new Date(batch.timestamp * 1000).toLocaleString(),
          pdfUrl: `/api/admin/tokens/pdf/${batch.batchUuid}.pdf`,
        };
      })
      .sort((lhs, rhs) => rhs.timestamp - lhs.timestamp);
  },
);
const tokensDialogVisible = ref(false);
const expandedList = reactive(new Set<string>());
const isExpanded = (batchUuid: string) => expandedList.has(batchUuid);
const setExpanded = (batchUuid: string, expanded: boolean) => {
  if (expanded) expandedList.add(batchUuid);
  else expandedList.delete(batchUuid);
};

const updateBatches = async () => {
  if (batches.value.state !== 'ready') return;
  await batches.value.reload();
};

const addBatch = async (batch: GenerateTokensResponse) => {
  expandedList.add(batch.batchUuid);
  await updateBatches();
};

const revokedBatch = ref<TokenBatch | null>(null);
</script>
