<template>
  <div>
    <el-button type="danger"
               @click="showEdit('add')">New Category</el-button>
    <Table :columns="columns"
           :showPagination="false"
           :dataSource="tableData"
           :fetch="loadDataList"
           :options="tableOptions">
      <template #cover="{index,row}">
        <Cover :cover="row.cover"></Cover>
      </template>
      <template #op="{index,row}">
        <div class="op">
          <a href="javascript:void(0)"
             class="a-link"
             @click="showEdit('update',row)">Edit</a>
          <el-divider direction="vertical" />
          <a href="javascript:void(0)"
             class="a-link"
             @click="del(row)">Delete</a>
          <el-divider direction="vertical" />
          <a href="javascript:void(0)"
             :class="[index==0?'not-allow':'a-link']"
             @click="changeSort(index,'up')">Move Up</a>
          <el-divider direction="vertical" />
          <a href="javascript:void(0)"
             :class="[index==tableData.list.length-1?'not-allow':'a-link']"
             @click="changeSort(index,'down')">Move Down</a>
        </div>

      </template>
    </Table>
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
          <el-input placeholder="Category Name"
                    v-model="formData.categoryName">
          </el-input>
        </el-form-item>
        <el-form-item label="Cover Image"
                      prop="cover">
          <CoverUpload v-model="formData.cover"></CoverUpload>
        </el-form-item>
        <el-form-item label="Description"
                      prop="categoryDesc">
          <el-input v-model="formData.categoryDesc"
                    type="textarea"
                    placeholder="Short Description"
                    :autosize="{minRows:4,maxRows:4}">
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>
  
  
<script setup>
import { getCurrentInstance, ref, reactive, nextTick, } from "vue"

const { proxy } = getCurrentInstance();

const api = {
  "loadDataList": "/category/loadAllCategory4Blog",
  "saveCategory": "/category/saveCategory4Blog",
  "delCategory": "category/delCategory4Blog",
  "changeSort": "category/changeCategorySort4Blog"
}
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
  label: "Blog Count",
  prop: "blogCount",
  width: 100,
}, {
  label: "Operation",
  prop: "op",
  width: 350,
  scopedSlots: "op",
}]

const tableData = reactive({})
const tableOptions = {
  extHeight: 10,
}

const loadDataList = async () => {
  let result = await proxy.Request({
    url: api.loadDataList
  })
  if (!result) {
    return
  }
  tableData.list = result.data;
}

//新增，修改
const dialogConfig = reactive({
  show: false,
  title: "Title",
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
  categoryName: [{ required: true, message: "Category Name is Required" }]
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
      formData.value = JSON.parse(JSON.stringify(data))
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
    proxy.Message.success("Category Saved");
    loadDataList();
  })
}

//delete
const del = (data) => {
      proxy.Confirm('please confirm you want to delete the Category: "'+data.categoryName+'"', async() => {
        let result = await proxy.Request({
          url:api.delCategory,
          params: {
            categoryId: data.categoryId,
          }
        })
          if(!result) {
            return;
          }
          loadDataList();
      })
}

const changeSort = async (index, type) => {
  let categoryList = tableData.list;
  if (type === "down" && index === categoryList.length - 1 || type === "up" && index === 0) {
    return;
  }
  let temp = categoryList[index];
  let number = type == "down" ? 1 : -1;
  categoryList.splice(index, 1);
  categoryList.splice(index + number, 0, temp);
  let result = await proxy.Request({
    url: api.changeSort,
    dataType: "json",
    params: categoryList,
  })

  if (!result) {
    return;
  }
  proxy.Message.success("Categories Reordered");
  loadDataList();
}

</script>
    
    
<style lang="scss">

</style>
  