<template>
  <q-card class="row">
    <navigation-card :to="tokensTo" label="Kody do głosowania">
      <tokens-image />
    </navigation-card>
    <q-separator vertical />
    <navigation-card :to="resultsTo" label="Wyniki głosowania">
      <results-image />
    </navigation-card>
  </q-card>
</template>

<script setup lang="ts">
import { routeNames } from 'src/router/route-constants';
import TokensImage from 'components/TokensImage.vue';
import NavigationCard from 'components/NavigationCard.vue';
import ResultsImage from 'components/ResultsImage.vue';

const tokensTo = {
  name: routeNames.tokens,
};
const resultsTo = {
  name: routeNames.results,
};
</script>
