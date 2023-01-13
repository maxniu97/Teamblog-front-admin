<template>
    <div class="editor-html">
      <Toolbar style="border-bottom: 1px solid #ccc"
               :editor="editorRef"
               :defaultConfig="toolbarConfig"
               :mode="mode" />
      <Editor :style="{height: height+'px','overflow-y': 'hidden'}"
              :modelValue="modelValue"
              @update:modelValue="modelValue = $event"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
              @onChange="onChange" />
    </div>
  </template>
  
  <script setup>

  import '@wangeditor/editor/dist/css/style.css' // 引入 css
  import { onBeforeUnmount, ref, shallowRef } from 'vue'
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
  import { i18nChangeLanguage } from '@wangeditor/editor'

// Language support - 'en' or 'zh-CN'
  i18nChangeLanguage('en')

  const props = defineProps({
    modelValue: {
      type: String,
      default: "",
    },
    height: {
      type: Number,
      default: 500,
    }
  })
  
  const mode = ref('default');
  
  const editorRef = shallowRef()
  
  // Content HTML
  const toolbarConfig = {}
  const editorConfig = {
    placeholder: 'Enter Your Content...', MENU_CONF: {
      uploadImage: {
        maxFileSize: 3 * 1024 * 1024,
        server: "/api/file/uploadImage4WangEditor",
        customInsert (res, insertFn) {
          insertFn(res.data.url, "", "");
        }
      }
    }
  }
  
  const emit = defineEmits();
  
  const onChange = (editor) => {
    emit("update:modelValue", editor.getHtml());
  }
  
  // when destroy component, also destroy editor 
  onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
  })
  
  const handleCreated = (editor) => {
    editorRef.value = editor // record editor instance，Important！
  }
  </script>
  
  <style lang="scss">
  .editor-html {
    border: 1px solid #ddd;
  }
  </style>