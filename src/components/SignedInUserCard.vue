<template>
  <home-card label="Ty">
    <q-card-section>
      Obecnie zalogowany użytkownik
    </q-card-section>
  </home-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HomeCard from 'components/HomeCard.vue';

export default defineComponent({
  components: { HomeCard },
  setup: () => ({
  }),
});
</script>
