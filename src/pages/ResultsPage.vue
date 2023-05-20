<template>
  <q-page padding class="results">
    <q-card>
      <q-toolbar>
        <q-btn
          :to="homeTo"
          aria-label="Powrót"
          flat
          round
          icon="arrow_back"
        >
          <q-tooltip>Powrót</q-tooltip>
        </q-btn>
        <q-toolbar-title>Wyniki głosowania</q-toolbar-title>
        <q-btn
          label="Odśwież"
          icon="refresh"
          color="primary"
          no-caps
          outline
          :loading="reloadLoading"
          @click="reload()"
          :disable="results.state !== 'ready'"
        />
      </q-toolbar>
      <q-linear-progress
        v-if="results.state === 'loading'"
        indeterminate
      />
    </q-card>
    <q-card
      v-if="results.state === 'error'"
      class="q-mt-lg text-negative"
    >
      <q-card-section class="row items-center">
        <q-icon size="md" name="error" left />
        <div>
          Wystąpił nieoczekiwany błąd
        </div>
      </q-card-section>
    </q-card>
    <q-card v-if="'data' in results" class="q-mt-lg">
      <q-table
        :columns="columns"
        :rows="results.data"
        row-key="number"
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
        class="results__table"
      >
        <template #body-cell-number="{ value }">
          <td>
            <span class="results__logo-number">Logo <b>{{ value }}</b></span>
          </td>
        </template>
        <template #body-cell-place="{ value }">
          <td class="text-right results__logo-place">
            <span class="row items-center justify-end">
              <span class="emoji" v-if="value === 1">🥇</span>
              <span class="emoji" v-if="value === 2">🥈</span>
              <span class="emoji" v-if="value === 3">🥉</span>
              <span class="text"><b>{{ value }}.</b> miejsce</span>
            </span>
          </td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { routeNames } from 'src/router/route-constants';
import { useAPI } from 'src/api';
import { useLoadingState } from 'src/composables/loading';
import { QTableColumn, useQuasar } from 'quasar';
import { ref } from 'vue';
import { mapWithPrev } from 'src/utils';
import { ResultsLogo } from 'src/api/types';

const homeTo = {
  name: routeNames.home,
};

interface Row {
  index: number;
  number: number;
  className: string;
  place: number;
  pointsTotal: number;
  points5: number;
  points3: number;
  points1: number;
  pointsNeg1: number;
}

const columns = ref<QTableColumn<Row>[]>([
  {
    label: 'Numer logo',
    name: 'number',
    field: 'number',
    sortable: true,
  },
  {
    label: 'Klasa',
    name: 'className',
    field: 'className',
    sortable: true,
    sort: (a, b, rowA: Row, rowB: Row) => {
      // TODO: Use proper index fields
      const indexA = a;
      const indexB = b;
      if (indexA === indexB) return rowA.number - rowB.number;
      return indexA < indexB ? -1 : 1;
    },
  },
  {
    label: 'Miejsce',
    name: 'place',
    field: 'place',
  },
  {
    label: 'Łączna liczba punktów',
    name: 'pointsTotal',
    field: 'pointsTotal',
  },
]);

const api = useAPI();
const quasar = useQuasar();

const results = useLoadingState(async () => mapWithPrev<ResultsLogo, Row>(
  await api.getResults(),
  (logo, index, prev) => ({
    index,
    number: logo.number,
    className: logo.className,
    place: (prev !== undefined && prev.pointsTotal === logo.points) ? prev.place : index + 1,
    pointsTotal: logo.points,
    points5: 0,
    points3: 0,
    points1: 0,
    pointsNeg1: 0,
  }),
));

const reloadLoading = ref(false);
const reload = async () => {
  if (reloadLoading.value || results.value.state !== 'ready') return;
  reloadLoading.value = true;
  try {
    await results.value.reload();
  } catch (error) {
    console.error(error);
    quasar.notify({
      type: 'negative',
      message: 'Nie udało się odświeżyć listy wyników',
    });
  }
  reloadLoading.value = false;
};
</script>

<style lang="scss">
.results {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  .results__table {
    font-variant-numeric: tabular-nums;
  }

  .results__logo-number {
    background: white;
    border: 1px solid $separator-color;
    border-radius: $generic-border-radius;
    padding: 2px 4px;
    box-shadow: 1px 1px #0003;
    width: 100%;
    display: inline-block;
    text-align: center;
  }

  .results__logo-place {
    vertical-align: center;
    padding-top: 0;
    padding-bottom: 0;

    & > span {
      .emoji {
        font-size: 1.7em;
        margin-right: 3px;
      }

      span {
        display: block;
      }
    }
  }
}
</style>
