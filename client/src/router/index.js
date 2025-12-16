import { createRouter, createWebHistory } from 'vue-router'

const DatasetPage = () => import("@/features/dataset/list/DatasetPage.vue");
const AddOrEditDatasetPage = () => import("@/features/dataset/edit/AddOrEditDatasetPage.vue");
const DatasetDetailsPage = () => import('@/features/dataset/details/DatasetDetailsPage.vue');
const testPage = () => import("@/components/common/BaseTable.vue");

const routes = [
  {
    path: "/admin/datasets",
    name: "Dataset",
    component: DatasetPage,
  },
  {
    path: "/admin/datasets/:id/edit",
    name: "EditDataset",
    component: AddOrEditDatasetPage,
    props: true
  },
  {
    path: "/admin/datasets/add",
    name: "AddDataset",
    component: AddOrEditDatasetPage
  },
  {
    path: "/admin/datasets/details/:id",
    name: "DatasetDetails",
    component: DatasetDetailsPage
  },
  {
    path: "/test",
    name: "Test",
    component: testPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
