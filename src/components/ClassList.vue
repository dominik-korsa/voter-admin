<template>
  <q-card bordered flat>
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
            <span class="text-red-9">
              <b>{{ item.tokenCount.unused }}</b> nieużytych
            </span>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { ClassResponse } from 'src/api/types';

interface ClassItem extends ClassResponse {
  tokenCount: null | { used: number; unused: number; };
}

export default defineComponent({
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
  }),
});
</script>
