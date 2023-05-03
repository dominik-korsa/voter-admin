<template>
  <q-layout v-if="loadingState.state !== 'ready'">
    <q-page-container>
      <q-page
        padding
        class="column content-center justify-center"
      >
        <div
          v-if="loadingState.state === 'error'"
          class="text-center text-negative"
        >
          {{ loadingState.error.friendlyMessage }}
        </div>
        <q-spinner v-else size="128" color="primary" :thickness="2" />
      </q-page>
    </q-page-container>
  </q-layout>
  <router-view v-else />
</template>

<script lang="ts">
import {
  defineComponent, onBeforeUnmount, provide, reactive, readonly, ref, watch,
} from 'vue';
import {
  RouteLocation, useRoute, useRouter,
} from 'vue-router';
import { routeNames } from 'src/router/route-constants';
import { until } from '@vueuse/core';
import { LoadingError, useLoadingState } from 'src/composables/loading';
import { useAPI } from 'src/api';
import { CurrentUser } from './api/types';
import { userManagerInjectionKey } from './composables/user-manager';

export default defineComponent({
  name: 'App',
  setup: () => {
    const router = useRouter();
    const route = useRoute();

    const user = ref<CurrentUser | null>(null);
    const userManager = reactive({
      user: readonly(user),
      replaceUser: (value: CurrentUser | null) => {
        user.value = value;
      },
    });
    provide(userManagerInjectionKey, userManager);

    const api = useAPI(userManager);

    const getRedirect = (to: RouteLocation) => {
      const isLoginPage = to.matched.some((matched) => matched.name === routeNames.login);
      if (isLoginPage && user.value !== null) {
        return {
          path: typeof to.query.backTo === 'string' ? to.query.backTo : '/',
        };
      }
      if (!isLoginPage && user.value === null) {
        return {
          name: routeNames.login,
          query: {
            backTo: to.path,
          },
        };
      }
      return null;
    };

    const loadingState = useLoadingState(async () => {
      try {
        user.value = await api.getCurrentUser();
      } catch (error) {
        throw new LoadingError(
          'Nie udało się wczytać informacji o zalogowanym użytkowniku',
          error,
        );
      }
    });

    const cancelBeforeResolve = router.beforeResolve(async (to) => {
      await until(() => loadingState.value.state !== 'loading').toBe(true);
      return getRedirect(to) ?? true;
    });

    onBeforeUnmount(() => {
      cancelBeforeResolve();
    });

    watch(() => user.value, () => {
      if (loadingState.value.state !== 'ready') return;
      const redirect = getRedirect(route);
      if (redirect !== null) router.replace(redirect);
    }, { immediate: true });

    return {
      loadingState,
    };
  },
});
</script>
