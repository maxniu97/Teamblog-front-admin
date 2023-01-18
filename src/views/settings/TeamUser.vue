<template>
    <div>
      <el-form :model="searchFormData">
        <el-row>
          <el-col :span="4">
            <el-form-item label="Name"
                          prop="nickName"
                          label-width="50px">
              <el-input placeholder="Name"
                        v-model="searchFormData.nickNameFuzzy"
                        clearable
                        @keyup.enter.native="loadDataList">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="Phone"
                          prop="phone"
                          label-width="80px">
              <el-input placeholder="Phone#"
                        v-model="searchFormData.phoneFuzzy"
                        clearable
                        @keyup.enter.native="loadDataList">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5"
                  :style="{'padding-left':'10px'}">
            <el-button type="danger"
                       @click="loadDataList">Search</el-button>
            <el-button type="danger"
                       @click="showEdit('add')"
                       v-if="userInfo.roleType==1">New Member</el-button>
          </el-col>
        </el-row>
      </el-form>
  
      <Table :columns="columns"
             :showPagination="true"
             :dataSource="tableData"
             :fetch="loadDataList"
             :options="tableOptions">
        <template #avatar="{ index, row }">
          <Cover :cover="row.avatar"></Cover>
        </template>
  
        <template #userInfo="{ index, row }">
          <div>Name&nbsp;&nbsp;&nbsp;&nbsp;：{{ row.nickName }}</div>
          <div>Phone#：{{ row.phone }}</div>
          <div>Role&nbsp;&nbsp;&nbsp;&nbsp;：{{ row.profession }}</div>
        </template>
  
        <template #roleInfo="{ index, row }">
          <div>{{ row.roleTypeName }}</div>
        </template>
  
        <template #statusInfo="{ index, row }">
          <div>
            <span :style="{ color: row.status == 1 ? 'green' : 'red' }">{{
              row.statusName
            }}</span>
          </div>
        </template>
  
        <template #timeInfo="{ index, row }">
          <div>Member Created：{{ row.createTime }}</div>
          <div>Last Login logged:{{ row.lastLoginTime }}</div>
        </template>
  
        <template #operation="{ index, row }">
          <span v-if="userInfo.roleType == 1">
            <a href="javascript:void(0)"
               @click="showEdit('edit', row)"
               class="a-link">Edit</a>
            <el-divider direction="vertical" />
            <a href="javascript:void(0)"
               class="a-link"
               @click="changeAccountStatus(row)">
              {{ row.status == 0 ? "Activate" : "Ban" }}
            </a>
            <el-divider direction="vertical" />
            <a href="javascript:void(0)"
               class="a-link"
               @click="showUpdatePassword(row.userId)">Change Password</a>
            <el-divider direction="vertical" />
            <a href="javascript:void(0)"
               class="a-link"
               @click="delUser(row)">Delete</a>
          </span>
          <span v-else>--</span>
        </template>
      </Table>
  
      <!--New member dialog-->
      <Dialog :show="editDialogInfo.show"
              :title="editDialogInfo.title"
              :buttons="editDialogInfo.buttons"
              :width="'50%'"
              @close="editDialogInfo.show = false">
        <el-form ref="editFormRef"
                 :model="formData"
                 :rules="rules"
                 label-width="110px">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="Name"
                            prop="nickName">
                <el-input :maxLength="30"
                          v-model="formData.nickName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Phone"
                            prop="phone">
                <el-input :maxLength="11"
                          v-model="formData.phone" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10"
                  v-if="formData.userId == null">
            <el-col :span="12">
              <el-form-item label="Password"
                            prop="password">
                <el-input v-model="formData.password"
                          :maxLength="20"
                          type="password" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Repeat Password"
                            prop="rePassword">
                <el-input v-model="formData.rePassword"
                          :maxLength="20"
                          type="password" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="Editor"
                            prop="editorType">
                <el-radio-group v-model="formData.editorType">
                  <el-radio :label="1">Markdown</el-radio>
                  <el-radio :label="0">HTML Rich Text</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Profession"
                            prop="profession">
                <el-input v-model="formData.profession" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <el-form-item label="Avatar"
                            prop="avatar">
                <cover-upload v-model="formData.avatar"></cover-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <el-form-item label="Introduction"
                            prop="introduction">
                <editor-html id="introduction"
                             ref="introduction"
                             :height="300"
                             v-model="formData.introduction">
                </editor-html>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </Dialog>
  
      <!--change password-->
      <Dialog :show="dialogConfig.show"
              :title="dialogConfig.title"
              :buttons="dialogConfig.buttons"
              width="400px"
              @close="dialogConfig.show=false">
        <el-form :model="formData"
                 :rules="rules"
                 ref="passwordFormRef"
                 label-width="80px">
          <el-form-item label="Password"
                        prop="password">
            <el-input placeholder="Enter Password"
                      type="password"
                      v-model="formData.password">
            </el-input>
          </el-form-item>
          <el-form-item label="Repeat"
                        prop="rePassword">
            <el-input placeholder="Repeat Password"
                      type="password"
                      v-model="formData.rePassword">
            </el-input>
          </el-form-item>
        </el-form>
      </Dialog>
    </div>
  </template>

<script setup>

import VueCookies from 'vue-cookies'
import { getCurrentInstance, reactive, ref, nextTick, } from "vue";
const { proxy } = getCurrentInstance();
const api = {
  "loadDataList": "setting/loadUser",
  "saveTeamUser": "setting/saveTeamUser",
  "updateStatus": "setting/updateStatus",
  "delUser": "setting/delUser",
  "updatePassword": "setting/updatePassword"
}

const userInfo = ref(VueCookies.get("userInfo") || {});
//const userInfo = ref(proxy.VueCookies.get("userInfo") || {});

const searchFormData = reactive({});
//menu list
const columns = [{
  label: "Avatar",
  prop: "avatar",
  width: 80,
  scopedSlots: "avatar",
},
{
  label: "User Info",
  prop: "nickName",
  scopedSlots: "userInfo",
  width: 200.
},
{
  label: "Editor",
  prop: "editorTypeName",
  width: 150,
},
{
  label: "Role",
  prop: "roleTypeName",
  scopedSlots: "roleInfo",
  width: 150,
},
{
  label: "Status",
  prop: "statusInfo",
  scopedSlots: "statusInfo",
  width: 150,
},
{
  label: "Time",
  prop: "createTime",
  scopedSlots: "timeInfo",
  width: 300,
},
{
  label: "Operation",
  prop: "operation",
  width: 325,
  scopedSlots: "operation",
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

//new user


const validateRePass = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};
const rules = {
  nickName: [{ required: true, message: "Name Can't be Empty" }],
  editorType: [{ required: true, message: "Select Default Editor" }],
  password: [
    { required: true, message: "Enter Password" },
    {
      validator: proxy.Verify.password,
      message: "At Least 8 Digit，number letter & characters",
    },
  ],
  rePassword: [
    { required: true, message: "Repeat Password" },
    {
      validator: validateRePass,
      message: "Password Must Match",
    },
  ],
  phone: [
    { required: true, message: "Enter Phone Number" },
    {
      validator: proxy.Verify.phone,
      trigger: "blur",
      message: "Enter Correct Phone number",
    },
  ],
};

const editDialogInfo = reactive({
  show: false,
  title: "New User",
  buttons: [
    {
      type: "danger",
      text: "Confirm",
      click: (e) => {
        submitForm();
      },
    },
  ],
});

const formData = ref({});
const editFormRef = ref();
const showEdit = (type, data) => {
  editDialogInfo.show = true;
  nextTick(async () => {
    editFormRef.value.resetFields();
    if (type === "add") {
      editDialogInfo.edit = false;
      editDialogInfo.title = "New Account";
      formData.value = {
        introduction: "",
      }
    } else {
      editDialogInfo.edit = true;
      editDialogInfo.title = "Edit Account";
      Object.assign(formData.value, data)
    }
  });
};

const submitForm = () => {
  editFormRef.value.validate(async (valid) => {
    if (!valid) {
      return false;
    }
    let params = {};
    Object.assign(params, formData.value);
    delete params.createTime;
    delete params.lastLoginTime;
    let result = await proxy.Request({
      url: api.saveTeamUser,
      params: params,
    });
    if (!result) {
      return;
    }
    editDialogInfo.show = false;
    proxy.Message.success("Saved");
    loadDataList();
  });
};

//change status
const changeAccountStatus = (data) => {
  let status = data.status == 0 ? 1 : 0;
  let statusName = data.status == 0 ? "Activate" : "Ban"
  proxy.Confirm(`Are You Sure【${statusName}】${data.nickName}`, async () => {
    let result = await proxy.Request({
      url: api.updateStatus,
      params: {
        userId: data.userId,
        status: status
      }
    })
    if (!result) {
      return;
    }
    loadDataList();
  })
}

//delete user
const delUser = (data) => {
  proxy.Confirm(`To Delete【${data.nickName}】`, async () => {
    let result = await proxy.Request({
      url: api.delUser,
      params: {
        userId: data.userId,
      }
    })
    if (!result) {
      return;
    }
    loadDataList();
  })
}



//edit password
const passwordFormRef = ref(null);
const dialogConfig = reactive({
  show: false,
  title: "Change Password",
  buttons: [{
    type: "danger",
    text: "Confirm",
    click: (e) => {
      submitPass();
    }
  }]
})

const showUpdatePassword = (userId) => {
  dialogConfig.show = true;
  nextTick(() => {
    passwordFormRef.value.resetFields();
    formData.value = { userId: userId };
  })
}

const submitPass = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.updatePassword,
      params: {
        userId: formData.value.userId,
        password: formData.value.password
      }
    })
    if (!result) {
      return;
    }
    dialogConfig.show = false;
    proxy.Message.success("Password Saved");
  });
}
</script>


<style lang="scss">

</style>