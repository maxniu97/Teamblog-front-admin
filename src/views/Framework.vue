<template>
    <div class="layout">
      <el-container>
        <el-header class="header">
          <div class="logo">EasyBlog</div>
          <div class="user-info">
            <span>Welcome Back，</span>
            <el-dropdown trigger="click">
              <span class="nick-name">
                {{userInfo.nickName}}
                <span class="iconfont icon-close"></span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goUserInfo">
                    Personal Info
                  </el-dropdown-item>
                  <el-dropdown-item @click="logout">Log out</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <div class="avatar"><img :src="userInfo.avatar"></div>
          </div>
        </el-header>
        <el-container class="container">
          <el-aside width="200px"
                    class="left-aside">
            <div>
              <el-button class="post-btn"
                         @click="createHtml"> Publish !</el-button>
            </div>
            <div class="menu-panel">
              <ul>
                <li v-for="(menu,index) in menuList">
                  <span class="menu-title-p"
                        @click="openClose(index)">
                    <span :class="['iconfont',menu.icon]"></span>
                    <span class="menu-title">{{menu.title}}</span>
                    <span :class="['iconfont','open-close',menu.open?'icon-open':'icon-close']"></span>
                  </span>
                  <ul class="sub-menu"
                      v-show="menu.open">
                    <li v-for="subMenu in menu.children">
                      <router-link :to="subMenu.path"
                                   :class="['sub-menu-item',activePath==subMenu.path?'active':'']"
                                   v-if="subMenu.roleType == null || subMenu.roleType == userInfo.roleType">{{subMenu.title}}</router-link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
  
          </el-aside>
          <el-main class="right-main">
            <router-view />
          </el-main>
        </el-container>
      </el-container>
  
      <Dialog :show="progressDialog.show"
              :title="progressDialog.title"
              :buttons="progressDialog.buttons"
              @close="progressDialog.show = false"
              :show-close="false"
              :showCancel="false"
              width="400px">
        <div class="progress-container">
          <div class="progress-panel">
            <el-progress type="circle"
                         :percentage="progressInfo.progress"
                         :status="progressInfo.status"
                         :color="colors" />
          </div>
          <div class="error"
               v-if="progressInfo.result == 0">
            <div>Error While Generating Static Page ：{{ progressInfo.errorMsg }}</div>
            <div class="info">Check LOG for Error</div>
          </div>
          <div class="success"
               v-if="progressInfo.progress == 100 && progressInfo.result == 1">
            Published!
          </div>
          <div class="btn-panel"
               v-if="progressInfo.progress == 100 || progressInfo.result == 0">
            <el-button class="btn"
                       type="primary"
                       @click="progressDialog.show = false">Close</el-button>
          </div>
        </div>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { useStore } from "vuex";
  import { getCurrentInstance, ref, watch, reactive } from "vue"
  import { useRouter, useRoute } from "vue-router";
  const router = useRouter();
  const route = useRoute();
  const store = useStore();
  const { proxy } = getCurrentInstance();
  const menuList = ref([
      {
          title: "Blog",
          icon: "icon-blog",
          open: true,
          children: [
              {
                  title: "Blog Management",
                  path: "/blog/list",
              },
              {
                  title: "Category Management",
                  path: "/blog/category",
              },
          ],
      },
      {
          title: "Topic",
          icon: "icon-ictopic",
          open: true,
          children: [
              {
                  title: "Topic Management",
                  path: "/special/SpecialList",
              },
          ],
      },
      {
          title: "Settings",
          icon: "icon-settings",
          open: true,
          children: [
              {
                  title: "MY Setting",
                  path: "/settings/my",
              },
              {
                  title: "Blog Users Setting",
                  path: "/settings/user",
              },
              {
                  title: "System Setting",
                  path: "/settings/sysInfo",
                  roleType: 1,
              },
          ],
      },
      {
          title: "Recycle",
          icon: "icon-xunhuanrecycle62",
          open: true,
          children: [
              {
                  title: "Recycled station",
                  path: "/recovery/RecoveryList",
              },
          ],
      },
  
  
  
  ]);
  const api = {
    "getUserInfo": "getUserInfo",
    "logout": "logout",
    "createHtml": "createHtml",
    "checkProgress": "checkProgress",
  }
  const openClose = (index) => {
    const open = menuList.value[index].open;
    menuList.value[index].open = !open;
  }
  
  const userInfo = ref({});
  
  const getUserInfo = async () => {
    let result = await proxy.Request({
      url: api.getUserInfo
    })
  
    if (!result) {
      return;
    }
    userInfo.value = result.data;
    userInfo.value.avatar = proxy.globalInfo.imageUrl + result.data.avatar;
  }
  getUserInfo();
  
  const activePath = ref(null);
  watch(route, (newVal, oldVal) => {
    activePath.value = newVal.path;
  }, { immediate: true, deep: true });
  
  
  const goUserInfo = () => {
    router.push("../settings/my");
  }
  
  const logout = () => {
    proxy.Confirm(`Logout?`, async () => {
      let result = await proxy.Request({
        url: api.logout,
      })
      if (!result) {
        return;
      }
      router.push("/login");
    })
  }
  
  //listen to store
  watch(() => store.state.userInfo, (newVal, oldVal) => {
    const avatar = proxy.globalInfo.imageUrl + newVal.avatar;
    const nickName = newVal.nickName;
    userInfo.value = { avatar, nickName };
  }, { immediate: true, deep: true });
  
  
  
  
  //publish
  const colors = [
    { color: "#f56c6c", percentage: 20 },
    { color: "#e6a23c", percentage: 40 },
    { color: "#6f7ad3", percentage: 60 },
    { color: "#1989fa", percentage: 80 },
    { color: "#5cb87a", percentage: 100 },
  ];
  
  const progressDialog = reactive({
    title: "Publish",
    buttons: [],
    show: false,
  });
  
  const progressInfo = reactive({
    progress: 0,
  });
  
  let checkTimer = null;
  const createHtml = async () => {
    progressDialog.show = true;
    progressInfo.progress = 0;
    progressInfo.status = undefined;
    let result = await proxy.Request({
      url: api.createHtml,
    });
    if (!result) {
      return;
    }
    checkProgress();
    checkTimer = setInterval(() => {
      checkProgress();
    }, 1000);
  };
  const checkProgress = async () => {
    let result = await proxy.Request({
      url: api.checkProgress,
      showLoading: false,
    });
    if (!result) {
      return;
    }
    if (result.data.result == 0) {
      progressInfo.status = "exception";
      progressInfo.errorMsg = result.data.errorMsg;
    } else {
      progressInfo.progress = result.data.progress;
    }
    progressInfo.result = result.data.result;
    if (
      (result.data.progress == 100 || result.data.result == 0) &&
      checkTimer != null
    ) {
      clearInterval(checkTimer);
    }
  };
  
  </script>

<style lang="scss">

    .layout{
        
            .header {
                border-bottom: 1px solid #ddd;
                align-items: center;
                display: flex;
                // font-size: 30px;
                // font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                justify-content: space-between;
                
                .logo {
                    font-size: 30px;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    .nick-name {
                        cursor: pointer;
                        color: rgb(46, 142, 252);
                        
                        .el-dropdown-link {
                        cursor: pointer;
                        color: #409EFF;
                        }
                        .el-icon-arrow-down {
                            font-size: 14px;
                            color: red;
                        }

                    }
                    .avatar{
                        width: 50px;
                        margin-left: 10px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        background-color: #ddd;
                        border-radius: 50px;
                        img {
                            border-radius: 50px;
                            width: 100%;
                            
                        }
                    }
                    
                }
            }
            .container {
                background: #f5f6f7;
                padding-top: 10px;
                height: calc(100vh - 60px);
                .left-aside {
                    padding: 0px 15px;
                    width: 280px;
                    .post-btn {
                        background: rgb(32, 238, 152);
                        color: #fff;
                        height: 40px;
                        width: 100%;
                    }
                    .menu-panel{
                        margin-top: 5px;
                        ul,
                        
                        li{
                            padding: 0px;
                            margin: 0px;
                            list-style: none;
                        }
                        .menu-title-p{
                            padding: 5px;
                            line-height: 45px;
                            cursor: pointer;
                            display: flex;
                            iconfont {
                                font-size: 20;
                                color: #91949a;
                            }
                        
                            .menu-title {
                                flex :1;
                                color:#3f4042;
                                margin-left: 10px;
                            }
                            .open-close {
                                width: 20px;
                                font-size: 16px;
                            }
                        }
                        .menu-title-p:hover {
                            background: #ddd;
                        }
                        .sub-menu {
                            margin-left: 23px;
                            font-size: 14px;
                            .sub-menu-item {
                                padding: 0px 10px 0 33px;
                                display: block;
                                cursor: pointer;
                                line-height: 40px;
                                text-decoration: none;
                                color: #3f4042;
                                }
                            .active{
                                background: #ddd;
                                color: rgb(228, 109, 79);
                            }
                            .sub-menu-item:hover {
                                background: #ddd;
                                color: rgb(228, 109, 79);
                            }
                        }
                    }
                }
                .right-main {
                    background: #fff;
                    position: relative;
                    padding: 20px 10px 10px 10px;
                    
                }
            }
        
    }
.progress-container {
    .progress-panel {
        display: flex;
        justify-content: center;
    }
    .error {
        color: red;
        margin-top: 20px;
    
    .info {
        font-size: 13px;
    }
}
.success {
    margin-top: 20px;
    text-align: center;
    font-size: 16px;
    color: green;
}
.btn-panel {
    text-align: center;
    margin-top: 20px;

    .btn {
    margin:0px auto;
}
}
}

</style>
