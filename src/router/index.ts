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
    },
    {
      path: "/test",
      component: () => import("../pages/test/test.vue")
    }
  ]
})

export default appRouter