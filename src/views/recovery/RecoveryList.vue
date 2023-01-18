<template>
    <div class="body">
      <div class="top-panel">
        <el-form @submit.native.prevent
                 :model="searchForm"
                 class="search-form"
                 labelAlign="left">
          <el-row :gutter="5">
            <el-col :span="5">
              <el-form-item label="Search Title">
                <el-input v-model="searchForm.titleFuzzy"
                          placeholder="Support Fuzzy Search"
                          @keyup.enter.native="loadDataList"
                          allowClear />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item>
                <el-button type="danger"
                           @click="loadDataList()">Search</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <Table :columns="columns"
             :fetch="loadDataList"
             :dataSource="tableData"
             :options="tableOptions">
        <template #cover="{ index, row }">
          <cover :cover="row.cover"></cover>
        </template>
  
        <template #blogInfo="{ index, row }">
          <div>Title：{{ row.title }}</div>
          <div>Article Type：{{ row.blogType==0?'Blog':'Special Topic' }}
            <el-divider direction="vertical" /> <span>{{row.blogType==0?'Category':'Special Topic'}}</span>：{{ row.categoryName||'--' }}
          </div>
          <div>Author：{{ row.nickName }}</div>
        </template>
        <!-- operations -->
        <template #status="{ index, row }">
          <span v-if="row.status == 1"
                :style="{ color: 'green' }">{{
            row.statusName
          }}</span>
          <span v-else
                :style="{ color: 'red' }">{{ row.statusName }}</span>
        </template>
  
        <template #timeInfo="{ index, row }">
          <div>Created：{{ row.createTime }}</div>
          <div>Updated：{{ row.lastUpdateTime }}</div>
        </template>
  
        <template #operation="{ index, row }">
          <template v-if="row.userId == userInfo.userId || userInfo.roleType == 1">
            <a class="a-link"
               href="javascript:void(0)"
               @click="reductionBlog(row)"
               v-if="userInfo.userId==row.userId">Restore</a>
            <span v-else>--</span>
            <el-divider direction="vertical" />
            <a class="a-link"
               href="javascript:void(0)"
               @click="delBlog(row)"
               v-if="userInfo.userId==row.userId">Delete</a>
            <span v-else>--</span>
          </template>
          <span v-else>--</span>
        </template>
      </Table>
    </div>
  </template>
  
<script setup>

import { ref, reactive, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import  VueCookies  from "vue-cookies";

const router = useRouter();
const { proxy } = getCurrentInstance();

const api = {
  loadDataList: "/blog/loadRecoveryList",
  delBlog: "/blog/delBlog",
  reductionBlog: "/blog/reductionBlog",
};

const userInfo = ref(VueCookies.get("userInfo") || {});

const tableData = reactive({});
const tableOptions = reactive({
  extHeight: 40,
});

const columns = [
  {
    label: "Cover",
    prop: "cover",
    width: 80,
    scopedSlots: "cover",
  },
  {
    label: "Blog Info",
    prop: "title",
    scopedSlots: "blogInfo",
  },
  {
    label: "Editor",
    prop: "editorTypeName",
    width: 100,
  },
  {
    label: "Comment",
    prop: "allowCommentTypeName",
    width: 100,
  },
  {
    label: "Time",
    prop: "createTime",
    scopedSlots: "timeInfo",
    width: 260,
  },
  {
    label: "Operation",
    prop: "operation",
    width: 150,
    scopedSlots: "operation",
  },
];
const searchForm = reactive({});
//load the list of blogs
const loadDataList = async () => {
  let params = {
    pageNo: tableData.pageNo,
    pageSize: tableData.pageSize,
  };
  Object.assign(params, searchForm);

  let result = await proxy.Request({
    url: api.loadDataList,
    params: params,
  });
  if (!result) {
    return;
  }
  Object.assign(tableData, result.data);
};
//delete
const delBlog = (data) => {
  proxy.Confirm(`To Permanent Delete【${data.title}】？`, async () => {
    let result = await proxy.Request({
      url: api.delBlog,
      params: {
        blogId: data.blogId,
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("Deleted");
    loadDataList();
  });
};

//restore blog
const reductionBlog = (data) => {
  proxy.Confirm(
    `To Restore【${data.title}】Back to Draft State?`,
    async () => {
      let result = await proxy.Request({
        url: api.reductionBlog,
        params: {
          blogId: data.blogId,
        },
      });
      if (!result) {
        return;
      }
      proxy.Message.success("Restored");
      loadDataList();
    }
  );
};
</script>
