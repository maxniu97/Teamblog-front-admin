<template>
    <div>
      <!--新增修改弹窗 new  editor pop-->
      <Window :show="windowConfig.show"
              :buttons="windowConfig.buttons"
              @close="closeWindow">
        <el-form :model="blogFormData"
                 :rules="rules"
                 ref="blogFormRef">
          <el-form-item prop="title">
            <div class="title-input">
              <el-input placeholder="Please Enter Blog Title"
                        v-model="blogFormData.title">
              </el-input>
            </div>
          </el-form-item>
          <el-form-item prop="content">
            <div :style="{'width':'100%'}">
              <EditorHtml :height="editorHtmlHeight"
                          v-model="blogFormData.content"
                          v-if="blogFormData.editorType==1"></EditorHtml>
              <!-- <EditorMarkdown v-else
                              :height="editorMarkdownHeight"
                              v-model="blogFormData.markdownContent"
                              @htmlContent="setHtmlContent"></EditorMarkdown> -->
            </div>
  
          </el-form-item>
        </el-form>
  
        <Dialog :show="dialogConfig.show"
                :title="dialogConfig.title"
                :buttons="dialogConfig.buttons"
                width="900px"
                @close="dialogConfig.show=false">
          <el-form :model="blogFormData"
                   :rules="rules"
                   ref="settingsFormRef"
                   label-width="80px"
                   class="blog-setting-form">
            <el-form-item label="Category"
                          prop="categoryId">
              <el-select v-model="blogFormData.categoryId"
                         clearable
                         placeholder="Please Select a Category"
                         :style="{width:'100%'}">
                <el-option :value="0"
                           label="All Category"></el-option>
                <el-option :value="item.categoryId"
                           :label="item.categoryName"
                           v-for="item in categoryList"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Cover"
                          prop="cover">
              <CoverUpload v-model="blogFormData.cover"></CoverUpload>
            </el-form-item>
            <el-form-item label="Type"
                          prop="type">
              <el-radio-group v-model="blogFormData.type">
                <el-radio :label="0">Original</el-radio>
                <el-radio :label="1">Reproduced</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Original Post Address"
                          prop="reprintUrl"
                          v-if="blogFormData.type==1">
              <el-input v-model="blogFormData.reprintUrl"
                        placeholder="Please include Original Post Address">
              </el-input>
            </el-form-item>
            <el-form-item label="Comment"
                          prop="allowComment">
              <div class="allow-comment">
                <el-radio-group v-model="blogFormData.allowComment">
                  <el-radio :label="1">Allowed</el-radio>
                  <el-radio :label="0">Not Allowed</el-radio>
                </el-radio-group>
                <span class="info">Please set the corresponding parameters in the comment settings first, and the comments will take effect</span>
              </div>
  
            </el-form-item>
            <el-form-item label="Summary"
                          prop="summary">
              <el-input v-model="blogFormData.summary"
                        type="textarea"
                        placeholder="Please Provide a Short Summary"
                        :autosize="{minRows:4,maxRows:4}">
              </el-input>
            </el-form-item>
            <el-form-item label="Tags"
                          prop="categoryDesc">
              <div class="tag-input-panel">
                <div class="tag-list">
                  <el-tag v-for="(item,index) in blogFormData.tag"
                          @close="closeTag(index)"
                          closable
                          class="tag-item">
                    {{item}}
                  </el-tag>
                </div>
  
                <span class="info"
                      v-if="blogFormData.tag.length==0">add a tag for search engine,press enter to add</span>
                <span class="iconfont icon-add"
                      @click="showTagInputHandler"
                      v-if="!showTagInput"></span>
                <el-input class="tag-input"
                          v-if="showTagInput"
                          v-model="tagInputValue"
                          @blur="tagInputResult"
                          @keyup.enter="tagInputResult"></el-input>
              </div>
            </el-form-item>
          </el-form>
        </Dialog>
  
      </Window>
    </div>
  </template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, ref } from "vue"

const { proxy } = getCurrentInstance();

const editorMarkdownHeight = window.innerHeight - 60 - 20 - 30 - 50 - 10 - 50 - 10;
const editorHtmlHeight = window.innerHeight - 60 - 20 - 30 - 50 - 100 - 50;

const api = {
  loadAllCategory4Blog: "/category/loadAllCategory4Blog",
  saveBlog: "/blog/saveBlog",
  getUserInfo: "getUserInfo",
  getBlogDetail: "/blog/getBlogById",
  autoSave: "/blog/autoSaveBlog"
}

const init = (type, data) => {
  startTimer();
  windowConfig.show = true;
  nextTick(() => {
    blogFormRef.value.resetFields();
    blogFormData.value = { tag: [] };
    if (type === "add") {
      getUserInfo();
    } else {
      getBlogDetail(data.blogId);
    }
  })
}

defineExpose({ init });

const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,
  })
  if (!result) {
    return;
  }
  blogFormData.value.editorType = result.data.editorType;
}

const getBlogDetail = async (blogId) => {
  let result = await proxy.Request({
    url: api.getBlogDetail,
    params: {
      blogId: blogId
    }
  })
  if (!result) {
    return
  }
  blogFormData.value = result.data;
  if (result.data.tag) {
    blogFormData.value.tag = result.data.tag.split("|");
  } else {
    blogFormData.value.tag = [];
  }
}

let timmer = ref(null);
const startTimer = () => {
  timmer.value = setInterval(() => {
    autoSave();
  }, 10000);
}


const cleanTimer = () => {
  if (timmer.value !== null) {
    clearInterval(timmer.value);
    timmer.value = null;
  }
}

//auto save
const autoSave = async () => {
  if (blogFormData.value.title == undefined || blogFormData.value.content == undefined || timmer.value == null || dialogConfig.show) {
    return;
  }
  const params = {};
  Object.assign(params, blogFormData.value)
  let result = await proxy.Request({
    url: api.autoSave,
    showLoading: false,
    params: params
  })
  if (!result) {
    return;
  }
  blogFormData.value.blogId = result.data;
}


//add , edit
const windowConfig = reactive({
  show: false,
  buttons: [{
    type: "danger",
    text: "Confirm",
    click: (e) => {
      showSettings();
    }
  }]
})

const emit = defineEmits();
const closeWindow = () => {
  windowConfig.show = false;
  emit("callback")
  if (timmer.value !== null) {
    cleanTimer();
  }
}



//blog content
const blogFormRef = ref(null);
const blogFormData = ref({ tag: [] });

//markdown editor setting html content
const setHtmlContent = (htmlContent) => {
  blogFormData.value.content = htmlContent
}
//fist submit show setting dialog
const showSettings = () => {
  blogFormRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    blogFormData.tag = blogFormData.tag == null ? [] : blogFormData.tag;
    dialogConfig.show = true;
  });
}

const rules = {
  title: [{ required: true, message: "Title is Required" }],
  content: [{ required: true, message: "Content is Required" }],
  categoryId: [{ required: true, message: "Blog Category is Required" }],
  type: [{ required: true, message: "Blog Type is Required" }],
  allowComment: [{ required: true, message: "Please Select if Comment is Allowed" }],
  reprintUrl: [{ required: true, message: "Please Provide Original Post Address" }],
}

//blog setting
const dialogConfig = reactive({
  show: false,
  title: "Blog Settings",
  buttons: [{
    type: "danger",
    text: "Confirm",
    click: (e) => {
      submitBlog();
    }
  }]
})
//category
const categoryList = ref([]);
const loadCategory = async () => {
  let result = await proxy.Request({
    url: api.loadAllCategory4Blog,
  })
  if (!result) {
    result
  };
  categoryList.value = result.data;
}
onMounted(() => {
  loadCategory();
})

onUnmounted(() => {
  cleanTimer();
})

//delete label
const closeTag = (index) => {
  blogFormData.value.tag.splice(index, 1);
}

//show tag input prop
const showTagInput = ref(false)

const showTagInputHandler = () => {
  showTagInput.value = true;
}
//tag inputs
const tagInputValue = ref(null);

const tagInputResult = (e) => {
  if (tagInputValue.value == undefined) {
    return;
  }
  showTagInput.value = false;
  if (blogFormData.value.tag.indexOf(tagInputValue.value) == -1) {
    blogFormData.value.tag.push(tagInputValue.value);
  }
  tagInputValue.value = undefined;
}

const settingsFormRef = ref();
const submitBlog = () => {
  settingsFormRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    const params = {
    }
    Object.assign(params, blogFormData.value);
    params.tag = params.tag.join("|");
    let result = await proxy.Request({
      url: api.saveBlog,
      params
    });
    if (!result) {
      return;
    }
    proxy.Message.success("Blog Saved");
    dialogConfig.show = false;
    closeWindow();
  });
}

</script>

<style lang="scss">
.is-error .title-input .el-input__wrapper {
  box-shadow: none;
}

.title-input {
  width: 100%;
  border-bottom: 1px solid #ddd;
  .el-input__wrapper {
    box-shadow: none;
  }

  .el-form-item.is-error .el-input__wrapper {
    box-shadow: none;
  }

  input {
    font-size: 18px;
  }
}
.blog-setting-form {
  .allow-comment {
    display: flex;
    .info {
      margin-left: 10px;
      color: rgb(175, 175, 175);
      font-size: 13px;
    }
  }

  .tag-input-panel {
    display: flex;
    align-items: center;
    .tag-list {
      display: flex;
      .tag-item {
        margin-right: 10px;
      }
    }
    .info {
      color: rgb(175, 175, 175);
      font-size: 13px;
      margin-right: 10px;
    }
    .icon-add {
      color: red;
      margin-right: 10px;
      cursor: pointer;
    }
    .tag-input {
      width: 100px;
    }
  }
}
</style>