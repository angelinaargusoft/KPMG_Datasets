
import { createRouter, createWebHistory } from 'vue-router'

const DatasetPage = () => import("@/features/dataset/pages/DatasetPage.vue");
const AddDatasetPage = () => import("@/features/dataset/pages/AddDatasetPage.vue")

const routes = [
  {
    path: "/admin/datasets",
    name: "Dataset",
    component: DatasetPage,
  },
  {
    path: "/admin/datasets/:id/edit",
    name: "EditDataset",
    component: AddDatasetPage,
    props: true
  },
  {
    path: "/admin/datasets/add",
    name: "AddDataset",
    component: AddDatasetPage
  },
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
