<template>
    <div>
      <el-form :model="formData"
               :rules="rules"
               ref="formDataRef"
               label-width="100px">
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="Avatar"
                          prop="avatar">
              <CoverUpload v-model="formData.avatar"
                           @callback="saveAvatar"></CoverUpload>
            </el-form-item>
            <el-form-item label="Name"
                          prop="nickName">
              <el-input v-model="formData.nickName"
                        placeholder="Nick Name">
              </el-input>
            </el-form-item>
            <el-form-item label="Phone#"
                          prop="phone">
              <el-input v-model="formData.phone"
                        placeholder="Phone Number">
              </el-input>
            </el-form-item>
            <el-form-item label="Password">
              <a href="javascript:void(0)"
                 class="a-link"
                 @click="showUpdatePassword">Change Password</a>
            </el-form-item>
            <el-form-item label="Editor"
                          prop="editorType">
              <el-radio-group v-model="formData.editorType">
                <el-radio :label="0">HTML Rich Text</el-radio>
                <el-radio :label="1">MarkDown</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Role"
                          prop="profession">
              <el-input v-model="formData.profession"
                        placeholder="Your Role">
              </el-input>
            </el-form-item>
            <el-form-item label=""
                          prop="editorType">
              <el-button type="danger"
                         @click="saveMy">Save</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="Introduction About you"
                          prop="introduction">
              <EditorHtml v-model="formData.introduction"></EditorHtml>
            </el-form-item>
  
          </el-col>
        </el-row>
      </el-form>
      <Dialog :show="dialogConfig.show"
              :title="dialogConfig.title"
              :buttons="dialogConfig.buttons"
              width="400px"
              @close="dialogConfig.show=false">
        <el-form :model="passwordFormData"
                 :rules="rules"
                 ref="passwordFormRef"
                 label-width="80px">
        
           <el-form-item label="Password"
                        prop="password">
            <el-input placeholder="Enter Password"
                      type="password"
                      v-model="passwordFormData.password">
            </el-input>
          </el-form-item>
        
          <el-form-item label="Repeat"
                        prop="rePassword">
            <el-input placeholder="Repeat Your Password"
                      type="password"
                      v-model="passwordFormData.rePassword">
            </el-input>
          </el-form-item>
       
        </el-form>
      </Dialog>
    </div>
  </template>

<script setup>

import { useStore } from 'vuex';
import { getCurrentInstance, ref, reactive, nextTick } from "vue";
const { proxy } = getCurrentInstance();
const store = useStore();
const api = {
  "getUserInfo": "getUserInfo",
  "saveMyInfo": "saveMyInfo",
  "saveAvatar": "saveAvatar",
  "updateMyPassword": "updateMyPassword"
}
const formData = ref({});

const validateRePass = (rule, value, callback) => {
  if (value !== passwordFormData.value.password) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};

const rules = {
  nickName: [{ required: true, message: "Name is Required" }],
  editorType: [{ required: true, message: "Select a Default Editor" }],
  password: [
    { required: true, message: "Password Please" },
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
    { required: true, message: "Phone Number please" },
 {
    validator:  proxy.Verify.phone,
      trigger: "blur",
      message: "Provide Correct Phone Number",
    },
  ],
};

const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo
  })

  if (!result) {
    return;
  }
  formData.value = result.data;
}
getUserInfo();

const formDataRef = ref(null);
const saveMy = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.saveMyInfo,
      params: {
        avatar: formData.value.avatar,
        nickName: formData.value.nickName,
        phone: formData.value.phone,
        editorType: formData.value.rType,
        profession: formData.value.profession,
        introduction: formData.value.introduction
      }
    })
    if (!result) {
      return;
    }
    proxy.Message.success("Saved");
    store.commit('updateUserInfo', {
      nickName: formData.value.nickName,
      avatar: formData.value.avatar
    })
  });

}

//修改头像
const saveAvatar = async (avatar) => {
  let result = await proxy.Request({
    url: api.saveAvatar,
    params: {
      avatar: avatar
    }
  })
  if (!result) {
    return;
  }
  proxy.Message.success("Avatar Saved");
  await store.commit('updateUserInfo', {
    nickName: formData.value.nickName,
    avatar: avatar
  })
}

//修改密码
const passwordFormData = ref({});
const passwordFormRef = ref(null);
const dialogConfig = reactive({
  show: false,
  title: "Edit Password",
  buttons: [{
    type: "danger",
    text: "Confirm",
    click: (e) => {
      submitPass();
    }
  }]
})

const showUpdatePassword = () => {
  dialogConfig.show = true;
  nextTick(() => {
    passwordFormRef.value.resetFields();
    passwordFormData.value = {};
  })
}

const submitPass = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.updateMyPassword,
      params: {
        password: passwordFormData.value.password
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