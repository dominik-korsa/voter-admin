<template>
  <q-card class="provision-form column no-wrap">
    <q-card-section tag="h6" class="q-ma-none">
      Skonfiguruj system głosowania
    </q-card-section>
    <q-separator />
    <div class="overflow-auto">
      <q-list padding class="q-pb-none">
        <q-item v-for="(item, i) in classes" :key="item.key" class="provision-form__item">
          <q-input
            class="provision-form__class-input"
            v-model="item.name"
            maxlength="4"
            filled
            required
            label="Klasa"
            hide-hint
            stack-label
          />
          <q-select
            class="provision-form__logo-input"
            :model-value="getChips(i)"
            @update:model-value="setChips(i, $event)"
            multiple
            use-chips
            use-input
            stack-label
            hide-dropdown-icon
            filled
            new-value-mode="add"
            :label="`Numery logo klasy ${item.name ?? ''}`"
            @new-value="createValue"
            hide-hint
          >
          </q-select>
          <q-btn flat round icon="more_vert" class="provision-form__more-button">
            <q-menu
              anchor="top middle"
              self="top middle"
              auto-close
            >
              <q-list>
                <q-item @click="removeClass(i)" clickable>
                  <q-item-section side>
                    <q-icon name="remove" />
                  </q-item-section>
                  <q-item-section>Usuń klasę</q-item-section>
                </q-item>
                <q-item clickable @click="moveUp(i)" :disable="!canMoveUp(i)">
                  <q-item-section side>
                    <q-icon name="arrow_upward" />
                  </q-item-section>
                  <q-item-section>Przenieś wyżej</q-item-section>
                </q-item>
                <q-item clickable @click="moveDown(i)" :disable="!canMoveDown(i)">
                  <q-item-section side>
                    <q-icon name="arrow_downward" />
                  </q-item-section>
                  <q-item-section>Przenieś niżej</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-tooltip>Więcej opcji</q-tooltip>
          </q-btn>
        </q-item>
      </q-list>
      <q-card-section class="q-pt-sm">
        <q-btn
          icon="add"
          outline
          color="primary"
          label="Dodaj klasę"
          no-caps
          class="full-width"
          :loading="loading"
          @click="addClass"
        />
      </q-card-section>
    </div>
    <q-separator />
    <q-card-section class="row items-baseline">
      <div class="text-negative text-left col-grow" v-if="error !== null">
        <q-icon name="error" size="xs" left />
        {{ error }}
      </div>
      <div class="col-grow" v-else />
      <q-btn
        color="primary"
        label="Zapisz"
        :disable="error !== null"
        @click="submit"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import { uid, useQuasar } from 'quasar';
import _ from 'lodash';
import { notNullish } from '@vueuse/core';
import { firstDefined, firstError } from 'src/utils';
import { useAPI } from 'src/api';

interface ClassItem {
  key: string;
  name: string;
  logos: number[];
}

const rangeRegex = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/;

export default defineComponent({
  props: {
    updateSystemInfo: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
  },
  setup: (props) => {
    const classes = ref<ClassItem[]>([]);
    const quasar = useQuasar();
    const api = useAPI();

    const addClass = () => {
      classes.value.push({
        key: uid(),
        name: '',
        logos: [],
      });
    };

    addClass();

    const canMoveUp = (index: number) => index !== 0;
    const canMoveDown = (index: number) => index !== classes.value.length - 1;

    const formError = computed(() => firstError(
      () => {
        if (classes.value.some((el) => el.name.trim() === '')) return 'Uzupełnij nazwy klas';
      },
      () => {
        const usedClassNames = new Set<string>();
        return firstDefined(classes.value, (el) => {
          const name = el.name.trim();
          if (usedClassNames.has(name)) return `Nazwa klasy "${name}" się powtarza`;
          usedClassNames.add(name);
        });
      },
      () => firstDefined(classes.value, (el) => {
        if (el.logos.length === 0) return `Dodaj numery logo w klasie ${el.name.trim()}`;
      }),
      () => {
        if (classes.value.length < 2) return 'Dodaj przynajmniej dwie klasy';
      },
      () => {
        const numbersMap = new Map<number, ClassItem>();
        return firstDefined(classes.value, (el) => firstDefined(el.logos, (chip) => {
          const prev = numbersMap.get(chip);
          if (prev !== undefined) return `Logo ${chip} powtarza się w klasach ${prev.name.trim()} i ${el.name.trim()}`;
          numbersMap.set(chip, el);
        }));
      },
    ));

    const loading = ref(false);

    return {
      classes,
      addClass,
      getChips: (index: number) => classes.value[index].logos,
      setChips: (index: number, value: (number | number[])[]) => {
        classes.value[index].logos = _.sortBy(_.uniq(value.flat()));
      },
      createValue: (input: string, doneFn: (value: number[]) => void) => {
        doneFn(
          input.split(/[,;|\s]/)
            .flatMap((value): number[] | null => {
              const match = rangeRegex.exec(value);
              if (match === null) return null;
              let from = parseInt(match[1], 10);
              let to = parseInt(match[2] ?? match[1], 10) + 1;
              if (Number.isNaN(from) || Number.isNaN(to)) return null;
              if (to <= from || from < 0) return null;
              to = Math.min(to, from + 20, 1000);
              from = Math.max(from, 0);
              return _.range(from, to);
            })
            .filter(notNullish),
        );
      },
      removeClass: (index: number) => {
        classes.value.splice(index, 1);
      },
      canMoveUp,
      canMoveDown,
      moveUp: (index: number) => {
        if (!canMoveUp(index)) return;
        classes.value.splice(index - 1, 0, ...classes.value.splice(index, 1));
      },
      moveDown: (index: number) => {
        if (!canMoveDown(index)) return;
        classes.value.splice(index + 1, 0, ...classes.value.splice(index, 1));
      },
      error: formError,
      loading,
      submit: async () => {
        if (formError.value !== null) return;
        if (loading.value) return;
        loading.value = true;
        try {
          const result = await api.provision(classes.value.map((item) => ({
            class: item.name.trim(),
            logos: item.logos,
          })));
          switch (result) {
            case null: {
              await props.updateSystemInfo();
              break;
            }
            case 'ALREADY_PROVISIONED': {
              quasar.notify({
                type: 'negative',
                message: 'System został już skonfigurowany. Odśwież stronę',
              });
              break;
            }
          }
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas konfigurowania systemu',
          });
        }
        loading.value = false;
      },
    };
  },
});
</script>

<style lang="scss">
.provision-form {
  width: 600px;

  .provision-form__item {
    display: flex;
    gap: 8px;

    .provision-form__class-input {
      width: 64px;
      flex-shrink: 0;
    }

    .provision-form__logo-input {
      flex-grow: 1;
      flex-shrink: 1;
      min-width: 0;
    }

    .provision-form__more-button {
      align-self: flex-start;
      margin-top: 8px;
    }
  }
}
</style>
