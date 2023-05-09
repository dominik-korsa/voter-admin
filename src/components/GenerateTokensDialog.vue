<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="setVisible"
  >
    <q-card class="generate-tokens-dialog">
      <q-form @submit.prevent="submit" class="column no-wrap">
        <q-card-section tag="h6" class="q-ma-none">
          Wygeneruj kody do głosowania
        </q-card-section>
        <q-separator />
        <q-list padding class="overflow-auto" dense>
          <q-item v-for="(item, i) in classes" :key="item.class">
            <q-item-section class="generate-tokens-dialog__class-name">
              Klasa <b>{{ item.name }}</b>:
            </q-item-section>
            <q-item-section>
              <q-input
                :model-value="getCountInput(item.class)"
                @update:model-value="setCount(item.class, $event)"
                :autofocus="i === 0"
                filled
                type="number"
                min="0"
                max="50"
                dense
                :label="`Liczba kodów dla klasy ${item.name}`"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <q-card-section class="row justify-end">
          <q-btn flat color="primary" @click="setVisible(false)">
            Anuluj
          </q-btn>
          <q-btn
            outline
            class="q-ml-sm"
            color="primary"
            :loading="loading"
            type="submit"
            :disable="!valid"
          >
            Dodaj
          </q-btn>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useAPI } from 'src/api';
import {
  computed,
  defineComponent, PropType, reactive, ref, watch,
} from 'vue';
import { useQuasar } from 'quasar';
import { ClassResponse, GenerateTokensBodyItem } from 'src/api/types';

export default defineComponent({
  props: {
    modelValue: Boolean,
    classes: {
      type: Array as PropType<ClassResponse[]>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup: (props, { emit }) => {
    const api = useAPI();
    const quasar = useQuasar();

    const loading = ref(false);
    const inputMap = reactive(new Map<string, number>());

    watch(() => props.modelValue, (value) => {
      if (!value) inputMap.clear();
    });

    const getCount = (key: string) => inputMap.get(key) ?? 0;
    const setVisible = (visible: boolean) => emit('update:modelValue', visible);

    const requestBody = computed<GenerateTokensBodyItem[]>(
      () => props.classes
        .map((item) => ({
          class: item.class,
          number: getCount(item.class),
        }))
        .filter((item) => item.number > 0),
    );
    const valid = computed(() => requestBody.value.length > 0);

    return ({
      inputMap,
      setVisible,
      loading,
      valid,
      getCountInput: (key: string) => getCount(key).toString(10),
      setCount: (key: string, value: string) => {
        inputMap.set(key, parseInt(value, 10));
      },
      submit: async () => {
        if (loading.value) return;
        if (!valid.value) return;
        loading.value = true;
        try {
          const result = await api.generateTokens(requestBody.value);
          console.log(result);
          // TODO: Redirect to token list
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: 'Wystąpił nieoczekiwany błąd podczas generowania kodów',
          });
        }
        loading.value = false;
      },
    });
  },
});
</script>

<style lang="scss">
.generate-tokens-dialog {
  width: 350px;

  .generate-tokens-dialog__class-name {
    display: block;
    min-width: 64px;
    flex-grow: 0;
    flex-basis: fit-content;
    align-self: center;
  }
}
</style>
