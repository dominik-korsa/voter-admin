<template>
  <q-card
    v-ripple
    bordered
    flat
    tabindex="0"
    class="q-hoverable q-focusable cursor-pointer non-selectable relative-position"
    :class="{
      'border-primary text-primary': selected,
    }"
    :aria-selected="selected"
    @keyup.space.prevent="select"
    @keyup.enter.prevent="select"
    @click="select"
  >
    <span class="q-focus-helper" />
    <q-card-section tag="h6" class="q-my-none">
      <q-icon
        :name="selected ? 'radio_button_checked' : 'radio_button_unchecked'"
        left
        size="sm"
      />
      {{ label }}
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup: (props, { emit }) => ({
    selected: computed(() => props.modelValue === props.name),
    select: () => { emit('update:modelValue', props.name); },
  }),
});
</script>
