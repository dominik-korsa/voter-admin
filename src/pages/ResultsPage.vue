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
        <template #body-cell-ranking="{ value }">
          <td class="text-right results__logo-ranking">
            <span class="row items-center justify-end no-wrap">
              <span class="emoji" v-if="value === 1">🥇</span>
              <span class="emoji" v-if="value === 2">🥈</span>
              <span class="emoji" v-if="value === 3">🥉</span>
              <span class="text">
                <b>{{ value }}.</b>
                <span class="label">miejsce</span>
              </span>
            </span>
          </td>
        </template>
        <template #body-cell-points5="{ value }">
          <td class="text-right results__points-cell cell-grow">
            <span>
              <b>{{ value }}</b>
              <span class="label">x 5 pkt.</span>
            </span>
            <div class="results__cell-sign">+</div>
          </td>
        </template>
        <template #body-cell-points3="{ value }">
          <td class="results__points-cell cell-grow">
            <span>
              <b>{{ value }}</b>
              <span class="label">x 3 pkt.</span>
            </span>
            <div class="results__cell-sign">+</div>
          </td>
        </template>
        <template #body-cell-points1="{ value }">
          <td class="results__points-cell cell-grow">
            <span>
              <b>{{ value }}</b>
              <span class="label">x 1 pkt.</span>
            </span>
            <div class="results__cell-sign">+</div>
          </td>
        </template>
        <template #body-cell-pointsNeg1="{ value }">
          <td class="results__points-cell cell-grow">
            <span>
              <b>{{ value }}</b>
              <span class="label">x -1 pkt.</span>
            </span>
            <div class="results__cell-sign">=</div>
          </td>
        </template>
        <template #body-cell-pointsTotal="{ value }">
          <td class="text-right cell-grow">
            <b>{{ value }}</b>
            <span class="label">pkt.</span>
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
import { ResultsLogoClass } from 'src/api/types';

const homeTo = {
  name: routeNames.home,
};

interface Row {
  index: number;
  number: number;
  class: ResultsLogoClass;
  ranking: number;
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
    field: 'class',
    sortable: true,
    format: ({ name }: ResultsLogoClass) => name,
    sort: (a: ResultsLogoClass, b: ResultsLogoClass, rowA: Row, rowB: Row) => {
      if (a.number === b.number) return rowA.number - rowB.number;
      return a.number < b.number ? -1 : 1;
    },
  },
  {
    label: 'Miejsce',
    name: 'ranking',
    field: 'ranking',
  },
  {
    label: '5 pkt.',
    name: 'points5',
    field: 'points5',
    sortable: true,
    sortOrder: 'da',
    headerClasses: 'cell-grow',
  },
  {
    label: '3 pkt.',
    name: 'points3',
    field: 'points3',
    sortable: true,
    sortOrder: 'da',
    headerClasses: 'cell-grow',
  },
  {
    label: '1 pkt.',
    name: 'points1',
    field: 'points1',
    sortable: true,
    sortOrder: 'da',
    headerClasses: 'cell-grow',
  },
  {
    label: '-1 pkt.',
    name: 'pointsNeg1',
    field: 'pointsNeg1',
    sortable: true,
    sortOrder: 'da',
    headerClasses: 'cell-grow',
  },
  {
    label: 'Razem',
    name: 'pointsTotal',
    field: 'pointsTotal',
    headerClasses: 'cell-grow',
  },
]);

const api = useAPI();
const quasar = useQuasar();

const results = useLoadingState(async () => {
  const result = await api.getResults();
  return result.map((logo, index): Row => {
    const getCount = (points: number) => logo.detailedPoints.find(
      (e) => e.points === points,
    )?.count ?? 0;
    return ({
      index,
      number: logo.number,
      class: logo.class,
      ranking: logo.ranking,
      pointsTotal: logo.totalPoints,
      points5: getCount(5),
      points3: getCount(3),
      points1: getCount(1),
      pointsNeg1: getCount(-1),
    });
  });
});

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

    td, th {
      padding-left: 8px;
      padding-right: 8px;

      &:not(.cell-grow) {
        width: 0;
      }

      &:last-child {
        padding-right: 16px;
      }
    }

    .label {
      font-size: 0.8em;
      margin-left: 3px;
      font-weight: 300;
    }
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

  .results__logo-ranking {
    vertical-align: center;
    padding-top: 0;
    padding-bottom: 0;

    & > span {
      .emoji {
        font-size: 1.7em;
        margin-right: 3px;
      }
    }
  }

  .results__points-cell {
    & > span {
      display: block;
      text-align: center;
    }

    .results__cell-sign {
      position: absolute;
      right: -8px;
      top: calc(50% - 8px);
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      user-select: none;
      pointer-events: none;
      font-size: 1.3em;
      font-weight: 300;
      opacity: 25%;
    }
  }
}
</style>
