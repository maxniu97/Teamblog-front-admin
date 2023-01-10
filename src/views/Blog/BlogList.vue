<template>
    <div>
      <div class="top-panel">
        <el-form :model="searchFormData"
                 label-width="50px">
          <el-row>
            <el-col :span="4">
              <el-form-item label="Title"
                            prop="titleFuzzy">
                <el-input placeholder="Please provide a Name"
                          v-model="searchFormData.titleFuzzy"
                          clearable
                          @keyup.enter.native="loadDataList">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="Status"
                            prop="status">
                <el-select v-model="searchFormData.status"
                           clearable
                           placeholder="Select Status"
                           :style="{width:'100%'}">
                  <el-option :value="0"
                             label="Draft"></el-option>
                  <el-option :value="1"
                             label="Published"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label=""
                            prop="categoryId">
                <el-select v-model="searchFormData.categoryId"
                           clearable
                           placeholder="Select Category"
                           :style="{width:'100%'}">
                  <el-option :value="item.categoryId"
                             :label="item.categoryName"
                             v-for="item in categoryList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5"
                    :style="{'padding-left':'10px'}">
              <el-button type="danger"
                         @click="loadDataList">Search</el-button>
              <el-button type="danger"
                         @click="showEdit('add')">New Blog</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <Table :columns="columns"
             :showPagination="true"
             :dataSource="tableData"
             :fetch="loadDataList"
             :options="tableOptions">
        <!--封面-->
        <template #cover="{index,row}">
          <Cover :cover="row.cover"></Cover>
        </template>
        <!--文章信息-->
        <template #blogInfo="{index,row}">
          <div>Title：{{row.title}}</div>
          <div>Category：{{row.categoryName}}</div>
          <div>Author：{{row.nickName}}</div>
        </template>
        <!--类型-->
        <template #typeName="{index,row}">
          <div>Type：<span v-if="row.type==0">Original</span><span v-if="row.type==1">Reproduced</span></div>
          <div v-if="row.type==1">Reference：{{row.reprintUrl}}</div>
        </template>
  
        <!--类型-->
        <template #statusName="{index,row}">
          <span v-if="row.status==1"
                :style="{color:'green'}">{{row.statusName}}</span>
          <span v-else
                :style="{color:'red'}">{{row.statusName}}</span>
        </template>
        <!--类型-->
        <template #time="{index,row}">
          <div>Created：{{row.createTime}}</div>
          <div>Updated：{{row.lastUpdateTime}}</div>
        </template>
        <template #op="{index,row}">
          <div class="op">
            <a href="javascript:void(0)"
               class="a-link"
               @click="showEdit('update',row)"
               v-if="userInfo.userId==row.userId">Edit</a>
            <span v-else>--</span>
            <el-divider direction="vertical" />
            <a href="javascript:void(0)"
               class="a-link"
               @click="delBlog(row)"
               v-if="userInfo.userId==row.userId">Delete</a>
            <span v-else>--</span>
            <el-divider direction="vertical" />
            <a href="javascript:void(0)"
               class="a-link"
               @click="showDetail(row.blogId)">Preview</a>
          </div>
        </template>
      </Table>
      <BlogEdit ref="blogEditRef"
                @callback="loadDataList"></BlogEdit>
  
      <BlogDetail ref="blogDetailRef"></BlogDetail>
      
      
    </div>
  </template>

<script setup>
    import { getCurrentInstance, reactive, ref,} from 'vue';
    import BlogEdit from "./BlogEdit.vue"
    import BlogDetail from "./BlogDetail.vue"
    import VueCookies from 'vue-cookies'

    const { proxy } = getCurrentInstance();

    //const userInfo = ref(VueCookies.get("userInfo"));
    const userInfo = ref(proxy.VueCookies.get("userInfo"));
   

    const api = {
    loadCategory: "/category/loadAllCategory4Blog",
    loadDataList: "/blog/loadBlog",
    delBlog: "/blog/recoveryBlog"
    }

    //搜索
    const searchFormData = reactive({})
    const categoryList = ref([]);
    const loadCategoryList = async () => {
    let result = await proxy.Request({
        url: api.loadCategory
    })
    categoryList.value = result.data;
    }
    loadCategoryList();

    //列表
    const columns = [{
    label: "Cover",
    prop: "cover",
    width: 80,
    scopedSlots: "cover",
    }, {
    label: "Topic Info",
    prop: "blogInfo",
    scopedSlots: "blogInfo",
    }, {
    label: "Editor",
    prop: "editorTypeName",
    width: 100,
    }, {
    label: "Type",
    prop: "typeName",
    width: 200,
    scopedSlots: "typeName",
    }, {
    label: "Comment",
    prop: "allowCommentTypeName",
    width: 100,
    }, {
    label: "Status",
    prop: "status",
    width: 100,
    scopedSlots: "statusName",
    }, {
    label: "Time",
    prop: "time",
    width: 300,
    scopedSlots: "time",
    }, {
    label: "Operation",
    prop: "op",
    width: 200,
    scopedSlots: "op",
    }]

    const tableData = ref({})
    const tableOptions = {
    extHeight: 50,
    }

    const loadDataList = async () => {
    let params = {
        pageNo: tableData.value.pageNo,
        pageSize: tableData.value.pageSize,
    }

    Object.assign(params, searchFormData);
    let result = await proxy.Request({
        url: api.loadDataList,
        params
    })
    if (!result) {
        return
    }
    tableData.value = result.data;
    }

    const blogEditRef = ref(null);
   
    const showEdit = (type, data) => {
  blogEditRef.value.init(type, data);
}



    //删除博客
    const delBlog = (data) => {
    proxy.Confirm(`Delete 【${data.title}】?`, async () => {
        let result = await proxy.Request({
        url: api.delBlog,
        params: {
            blogId: data.blogId,
        }
        })
        if (!result) {
        return;
        }
        loadDataList();
    })
    }

    //详情
    const blogDetailRef = ref(null);
    const showDetail = (blogId) => {
    blogDetailRef.value.showDetail(blogId);
    }

    
</script>

<style lang="scss">
</style>