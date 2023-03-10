<template>
    <div>
      <el-button type="danger"
                 @click="showEdit('add')">New Topic</el-button>
      <el-row :gutter="10"
              :style="{'margin-top':'10px'}">
        <el-col :span="14">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>Special Topics</span>
              </div>
            </template>
            <Table :columns="columns"
                   :showPagination="true"
                   :dataSource="tableData"
                   :fetch="loadDataList"
                   :options="tableOptions"
                   @rowClick="rowClick"
                   ref="dataTableRef">
              <template #cover="{index,row}">
                <Cover :cover="row.cover"></Cover>
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
                     @click="del(row)"
                     v-if="userInfo.userId==row.userId">Delete</a>
                  <span v-else>--</span>
                </div>
              </template>
            </Table>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>Special Articles</span>
              </div>
            </template>
            <div :style="{ 'margin-bottom': '5px' }">
              <el-alert title="Red means draft, Green means published, drag article to reorder"
                        type="info"
                        show-icon
                        :closable="false" />
            </div>
            <el-tree class="tree-panel"
                     ref="refTree"
                     :data="blogList"
                     defaultExpandAll
                     node-key="blogId"
                     :expand-on-click-node="false"
                     :props="treeProps"
                     :highlight-current="true"
                     draggable
                     @node-drop="blogDrag">
              <template #default="{ node, data }">
                <span class="custom-node-style">
                  <span class="node-title">
                    <span v-if="data.status==0"
                          :style="{'color':'red','font-size':'16px'}"> {{ data.title }}</span>
                    <span v-else
                          :style="{'color':'green','font-size':'16px'}"> {{ data.title }}</span>
                  </span>
                  <span class="node-op">
                    <template v-if="data.blogId === '0'">
                      <a class="a-link"
                         href="javascript:void(0)"
                         @click="editBlog('add', data)">New Topic</a>
                    </template>
                    <template v-else>
                      <a class="a-link"
                         href="javascript:void(0)"
                         @click="showDetail(data)">Preview</a>
                      <el-divider direction="vertical" />
                      <a class="a-link"
                         href="javascript:void(0)"
                         @click="editBlog('edit', data)"
                         v-if="userInfo.userId==data.userId">Edit</a>
                      <span v-else>--</span>
                      <el-divider direction="vertical" />
                      <a class="a-link"
                         href="javascript:void(0)"
                         @click="delBlog(data)"
                         v-if="userInfo.userId==data.userId">Delete</a>
                      <span v-else>--</span>
                      <el-divider direction="vertical" />
                      <a class="a-link"
                         href="javascript:void(0)"
                         @click="editBlog('add', data)">New Sub-Article</a>
                    </template>
                  </span>
                </span>
              </template>
            </el-tree>
          </el-card>
        </el-col>
      </el-row>
      <Dialog :show="dialogConfig.show"
              :title="dialogConfig.title"
              :buttons="dialogConfig.buttons"
              width="500px"
              @close="dialogConfig.show=false">
        <el-form :model="formData"
                 :rules="rules"
                 ref="formDataRef"
                 label-width="80px">
          <el-form-item label="Name"
                        prop="categoryName">
            <el-input placeholder="Enter Name"
                      v-model="formData.categoryName">
            </el-input>
          </el-form-item>
          <el-form-item label="Cover"
                        prop="cover">
            <CoverUpload v-model="formData.cover"></CoverUpload>
          </el-form-item>
          <el-form-item label="Description"
                        prop="categoryDesc">
            <el-input v-model="formData.categoryDesc"
                      type="textarea"
                      placeholder="Enter Description"
                      :autosize="{minRows:4,maxRows:4}">
            </el-input>
          </el-form-item>
        </el-form>
      </Dialog>
      <BlogEdit ref="blogEditRef"
                @callback="saveBlogCallback"></BlogEdit>
  
      <BlogDetail ref="blogDetailRef"></BlogDetail>
    </div>
  </template>

<script setup>
import BlogDetail from "./BlogDetail.vue"
import BlogEdit from "./BlogEdit.vue"
import VueCookies from 'vue-cookies'

import { getCurrentInstance, ref, reactive, nextTick } from "vue"

const { proxy } = getCurrentInstance();

const api = {
  "loadDataList": "/category/loadCategory4Special",
  "saveCategory": "/category/saveCategory4Special",
  "delCategory": "category/delCategory4Special",
  "getSpecialInfo": "blog/getSpecialInfo",
  "delBlog": "/blog/recoveryBlog",
  "updateSpecialBlogSort": "blog/updateSpecialBlogSort",
}

const userInfo = ref(VueCookies.get("userInfo") || {});


const columns = [{
  label: "Cover",
  prop: "cover",
  width: 100,
  scopedSlots: "cover",
}, {
  label: "Name",
  prop: "categoryName",
  width: 200,
}, {
  label: "Description",
  prop: "categoryDesc",
}, {
  label: "Article Count",
  prop: "blogCount",
  width: 150,
}, {
  label: "Operation",
  prop: "op",
  width: 120,
  scopedSlots: "op",
}]

const tableData = reactive({})
const tableOptions = {
  extHeight: 135,
}

const dataTableRef = ref(null);
const currentCategoryId = ref(null);
const loadDataList = async () => {
  let result = await proxy.Request({
    url: api.loadDataList
  })
  if (!result) {
    return
  }
  Object.assign(tableData, result.data)
  if (currentCategoryId.value == null && result.data.list.length > 0) {
    currentCategoryId.value = result.data.list[0].categoryId;
    loadBlogList();
  }
  nextTick(() => {
    dataTableRef.value.setCurrentRow("categoryId", currentCategoryId.value);
  })
}

//??????????????? ??????
const dialogConfig = reactive({
  show: false,
  title: "Tile",
  buttons: [{
    type: "danger",
    text: "Confirm",
    click: (e) => {
      submitForm();
    }
  }]
})
const formData = ref({})
const rules = {
  categoryName: [{ required: true, message: "Enter Category" }]
};
const formDataRef = ref();
const showEdit = (type, data) => {
  dialogConfig.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    if (type == "add") {
      dialogConfig.title = "New Category";
      formData.value = {};
    } else if (type == "update") {
      dialogConfig.title = "Edit Category";
      formData.value = JSON.parse(JSON.stringify(data));
    }
  })
}
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    let result = await proxy.Request({
      url: api.saveCategory,
      params,
    })
    if (!result) {
      return;
    }
    dialogConfig.show = false;
    proxy.Message.success("Saved");
    loadDataList();
  })
}

//??????
const del = (data) => {
  proxy.Confirm(`To Delete ${data.categoryName}`, async () => {
    let result = await proxy.Request({
      url: api.delCategory,
      params: {
        categoryId: data.categoryId,
      }
    })
    if (!result) {
      return;
    }
    loadDataList();
    currentCategoryId.value = null;
  })
}

//?????????
//??????????????????
const rowClick = (row) => {
  currentCategoryId.value = row.categoryId;
  loadBlogList();
}

const blogList = ref([]);
const loadBlogList = async () => {
  let result = await proxy.Request({
    url: api.getSpecialInfo,
    params: {
      categoryId: currentCategoryId.value,
      showType: "1"
    }
  })
  blogList.value = result.data;
}

//??????????????????
const treeProps = {
  children: "children",
  label: "title",
  value: "blogId",
};

//??????????????? ????????????
const blogEditRef = ref(null);
const editBlog = (type, data) => {
  blogEditRef.value.init(type, data);
}

//????????????????????????
const saveBlogCallback = () => {
  loadBlogList();
}

//????????????
//????????????
const delBlog = (data) => {
  proxy.Confirm(`To Delete???${data.title}???`, async () => {
    let result = await proxy.Request({
      url: api.delBlog,
      params: {
        blogId: data.blogId,
      }
    })
    if (!result) {
      return;
    }
    loadBlogList();
  })
}


//?????????????????????????????????
const blogDrag = async (draggingNode, dropNode, dropType, ev) => {
  console.log(draggingNode, dropNode, dropType);
  //??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  let parentNode = null;
  if (dropType == "inner") {
    //??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    parentNode = dropNode;
  } else {
    //?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    parentNode = dropNode.parent;
  }
  //???????????????ID
  const blogId = draggingNode.data.blogId;
  const pBlogId = parentNode.data.blogId;
  //???????????????????????????ID
  const blogIds = [];
  parentNode.childNodes.forEach((element) => {
    blogIds.push(element.data.blogId);
  });
  let params = {
    blogId,
    pBlogId,
    blogIds: blogIds.join(","),
  };
  let result = await proxy.Request({
    url: api.updateSpecialBlogSort,
    params,
  });
  if (!result) {
    return;
  }
  //?????????????????????
  loadBlogList();
};

//??????
const blogDetailRef = ref(null);
const showDetail = (data) => {
  blogDetailRef.value.showDetail(data);
}
</script>

<style lang="scss">


.tree-panel {
  height: calc(100vh - 290px);
  overflow: auto;
 
  .el-tree-node__label {
    flex: 1;
    display: flex;
  }
  .custom-node-style {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }
}

</style>