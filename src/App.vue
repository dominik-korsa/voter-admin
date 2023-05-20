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
import { routeNames, routeQueryFields } from 'src/router/route-constants';
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

    let update: () => Promise<void> = async () => { /* Empty function */ };

    const user = ref<CurrentUser | null>(null);
    const userManager = reactive({
      user: readonly(user),
      replaceUser: (value: CurrentUser | null) => {
        user.value = value;
      },
      update: () => update(),
    });
    provide(userManagerInjectionKey, userManager);

    const api = useAPI(userManager);

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

    update = async () => {
      if (loadingState.value.state !== 'ready') return;
      await loadingState.value.reload();
    };

    const getRedirect = (to: RouteLocation) => {
      if (loadingState.value.state !== 'ready') return null;

      const isLoginPage = to.matched.some((matched) => matched.name === routeNames.login);
      if (isLoginPage && user.value !== null) {
        const redirect = to.query[routeQueryFields.loginRedirect];
        return {
          path: typeof redirect === 'string' ? redirect : '/',
        };
      }
      if (!isLoginPage && user.value === null) {
        return {
          name: routeNames.login,
          query: {
            [routeQueryFields.loginRedirect]: to.path,
          },
        };
      }
      return null;
    };

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
