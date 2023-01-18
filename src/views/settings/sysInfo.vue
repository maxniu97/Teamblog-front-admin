<template>
    <div>
      <el-form ref="editFormRef"
               :style="{width:'50%'}"
               :model="formData"
               :rules="rules"
               :label-width="'200px'">
        <el-form-item label="Open Comment Section"
                      prop="openCommentType">
          <div>
            <el-radio-group v-model="formData.openCommentType">
              <el-radio :label="1">Yes</el-radio>
              <el-radio :label="0">No</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>
        
  
        <el-form-item label="Support Git Pages"
                      prop="gitPagesType">
          <div>
            <el-radio-group v-model="formData.gitPagesType">
              <el-radio :label="1">Yes</el-radio>
              <el-radio :label="0">No</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>
       
        
  
        <el-form-item label="Download Static Page">
          <div>
            <a href="javascript:void(0)"
               @click="createZip()"
               class="a-link">Click to Download</a>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="danger"
                     @click="submitForm">Save</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
<script setup>

import { getCurrentInstance, reactive, ref } from "vue"
const { proxy } = getCurrentInstance();
const api = {
  getSysSetting: "sysSetting/getSysSetting",
  saveSysSetting: "sysSetting/saveSysSetting",
  createZip: "sysSetting/createZip"
}

const formData = reactive({});
const provinceList = []

const rules = {

}

const getSysSetting = async () => {
  let result = await proxy.Request({
    url: api.getSysSetting
  })
  if (result != null) {
    Object.assign(formData, result.data)
  }
};
getSysSetting();

const editFormRef = ref();
const submitForm = () => {
  editFormRef.value.validate(async (valid) => {
    if (!valid) {
      return false;
    }
    let params = {};
    Object.assign(params, formData);
    let result = await proxy.Request({
      url: api.saveSysSetting,
      params: params,
    });
    if (!result) {
      return;
    }
    proxy.Message.success("Saved");
  });
};
const createZip = async () => {
  let result = await proxy.Request({
    url: api.createZip
  });
  if (!result) {
    return;
  }
  document.location.href = "/api/file/download/" + result.data + "/" + encodeURI("StaticPage.zip");
};

</script>