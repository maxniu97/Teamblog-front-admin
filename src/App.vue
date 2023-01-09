<template>
  <el-config-provider :locale="locale"
                      :message="config">
    <router-view/>
  </el-config-provider>
 
</template>


<script setup>
import { reactive } from "vue"
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import en from "element-plus/lib/locale/lang/en";
const locale = en;

const config = reactive({
  max: 1,
})

</script>


<style scoped>
</style>
