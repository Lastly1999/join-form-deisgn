import { createRouter, createWebHashHistory } from "vue-router"

const appRouter = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "",
      redirect: '/index',
    },
    {
      path: "/index",
      component: () => import("../pages/index/index.vue")
    }
  ]
})

export default appRouter