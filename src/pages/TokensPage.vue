<template>
  <q-page padding class="tokens-page">
    <router-link :to="homeTo">
      Powrót
    </router-link>
    <template v-if="systemInfo.state === 'ready'">
      <q-btn
        label="Wygeneruj kody do głosowania"
        color="primary"
        no-caps
        @click="tokensDialogVisible = true"
      />
      <generate-tokens-dialog
        v-if="'classes' in systemInfo.data"
        v-model="tokensDialogVisible"
        :classes="systemInfo.data.classes"
        :add-batch="addBatch"
      />
    </template>
    <q-card v-if="batches.state === 'ready'">
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
          <q-item-section class="col-grow">
            <q-item-label>
              Kody dla klasy <b>{{ batch.className }}</b>
            </q-item-label>
            <q-item-label caption>
              Wygenerowane <b>{{ batch.generationDate }}</b>
            </q-item-label>
            <q-item-label caption>
              <div>
                <span class="text-green-9"><b>{{ batch.usedTokens.length }}</b> użytych</span>,
                <span class="text-red-9">
                  <b>{{ batch.unusedTokens.length }}</b> nieużytych
                </span>
              </div>
            </q-item-label>
          </q-item-section>
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
              disable
              label="Unieważnij"
            />
          </div>
          <div class="q-pa-md">
            <q-chip
              v-for="token in batch.usedTokens"
              :key="token"
              text-color="green-9"
              :ripple="false"
              class="select-all font-monospace"
            >
              {{ token }}
              <q-tooltip>Kod wykorzystany</q-tooltip>
            </q-chip>
            <q-chip
              v-for="{ token } in batch.unusedTokens"
              :key="token"
              text-color="red-9"
              :ripple="false"
              class="select-all font-monospace"
            >
              {{ token }}
              <q-tooltip>Kod niewykorzystany</q-tooltip>
            </q-chip>
          </div>
        </div>
      </q-expansion-item>
    </q-card>
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
import { routeNames } from 'src/router/route-constants';
import GenerateTokensDialog from 'components/GenerateTokensDialog.vue';
import { reactive, ref } from 'vue';
import { useAPI } from 'src/api';
import { useLoadingState } from 'src/composables/loading';
import { GenerateTokensResponse } from 'src/api/types';

const homeTo = {
  name: routeNames.home,
};

const api = useAPI();

const systemInfo = useLoadingState(() => api.getSystemInfo());
const batches = useLoadingState(
  async () => {
    const result = await api.getTokenBatches();
    return result
      .map((batch) => {
        const usedTokens = batch.tokens.filter((token) => token.used === true);
        const unusedTokens = batch.tokens.filter((token) => token.used === false);
        return ({
          uuid: batch.batchUuid,
          usedTokens,
          className: batch.className,
          unusedTokens,
          timestamp: batch.timestamp,
          generationDate: new Date(batch.timestamp * 1000).toLocaleString(),
          pdfUrl: `/api/admin/tokens/pdf/${batch.batchUuid}.pdf`,
        });
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

const addBatch = async (batch: GenerateTokensResponse) => {
  expandedList.add(batch.batchUuid);
  if (batches.value.state === 'ready') await batches.value.reload();
};
</script>
