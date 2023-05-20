<template>
  <home-card label="Lista klas">
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
            <span class="text-red-9">
              <b>{{ item.tokenCount.unused }}</b> nieużytych
            </span>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator />
    <q-btn
      stretch
      class="full-width"
      flat
      label="Zobacz listę kodów do głosowania"
      color="primary"
      no-caps
      :to="tokensTo"
    />
  </home-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType,
} from 'vue';
import { ClassResponse } from 'src/api/types';
import HomeCard from 'components/HomeCard.vue';
import { routeNames } from 'src/router/route-constants';

interface ClassItem extends ClassResponse {
  tokenCount: null | { used: number; unused: number; };
}

export default defineComponent({
  components: { HomeCard },
  props: {
    classes: {
      type: Array as PropType<ClassResponse[]>,
      required: true,
    },
  },
  setup: (props) => ({
    classItems: computed<ClassItem[] | null>(() => props.classes.map((item): ClassItem => ({
      ...item,
      tokenCount: null,
    }))),
    tokensTo: {
      name: routeNames.tokens,
    },
  }),
});
</script>
