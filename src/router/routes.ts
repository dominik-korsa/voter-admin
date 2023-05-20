import { RouteRecordRaw } from 'vue-router';
import { routeNames } from 'src/router/route-constants';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: routeNames.home,
        path: '/',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        name: routeNames.tokens,
        path: 'kody-do-glosowania/',
        component: () => import('pages/TokensPage.vue'),
      },
      {
        name: routeNames.results,
        path: 'wyniki/',
        component: () => import('pages/ResultsPage.vue'),
      },
      {
        name: routeNames.login,
        path: 'zaloguj-sie/',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
