import { createRouter,createWebHistory } from "vue-router";
import VueCookies from 'vue-cookies'

const routes = [
    {
        name: "loginPage",
        path: "/login",
        component: () => import('../views/Login.vue'),
    },
    {
        name: "frameworkPage",
        path: "/",
        component: () => import('../views/Framework.vue'),
        redirect: "/blog/list",
        children: [{

            path: "/blog/Test",
            name: "Blog Test",
            component:()=>import('../views/blog/Test.vue'),
            },
            {

            path: "/blog/list",
            name: "Blog Management",
            component:()=>import('../views/blog/BlogList.vue'),
            },
            {

            path: "/blog/category",
            name: "Blog Category",
            component:()=>import('../views/blog/BlogCategory.vue'),
            },
            {

            path: "/special/SpecialList",
            name: "Special Topic Management",
            component:()=>import('../views/special/SpecialList.vue'),
            },
            {

            path: "/settings/My",
            name: "Personal Info",
            component:()=>import('../views/settings/MyInfo.vue'),
            },
            {

            path: "/settings/user",
            name: "Team Info",
            component:()=>import('../views/settings/TeamUser.vue'),
            },
            {

            path: "/settings/sysInfo",
            name: "System Info",
            component:()=>import('../views/settings/sysInfo.vue'),
            },
            {

                path: "/recovery/RecoveryList",
                name: "recovery station",
                component:()=>import('../views/recovery/RecoveryList.vue'),
                },
        ]
    }
];

//

const router = createRouter({
    routes,
    history: createWebHistory(),
})

router.beforeEach((to,from,next) => {
    const userInfo = VueCookies.get("userInfo");

    if(!userInfo && to.path != "/login") {
        router.push("/login");
    }
    next();
})

export default router