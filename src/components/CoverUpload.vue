<template>
    <el-upload name="file" 
        :show-file-list="false"
        accept=".jpg,.PNG,.png.JPG,.JPEG,.jpeg,.gif,.GIF,.bmp,.BMP"
        :multiple="false"
        :http-request="uploadImage">
       <div class="cover-upload-btn">
        
        <template v-if="modelValue">
            <img :src="proxy.globalInfo.imageUrl+modelValue">
        </template>
        <span class="iconfont icon-add" v-else></span>
         </div>
    </el-upload>

</template>

<script setup>

import { getCurrentInstance } from "vue"

    const {proxy} = getCurrentInstance();
    const props = defineProps ({
        modelValue:{

            type: String,
            default: null,
        },
    });
    const api = {
        uploadUrl: "file/uploadImage"
    };
    const emit = defineEmits();
    const uploadImage = async (file) =>{
        console.log(file);
        let result = await proxy.Request({
            url: api.uploadUrl,
            dataType: "file",

            params: {
                file: file.file,
                type: 0,
            }
        })
        const fileName = result.data.fileName
        emit("update:modelValue",fileName);
        emit("callback",fileName);

    };
</script>

<style lang="scss">
.cover-upload-btn {
    object-fit: cover;
  background: url(../assets/cover-bg.png);
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  
  .iconfont {
    font-size: 50px;
    color: rgb(255, 254, 254);
   
  }
  img {
    width: 100%;
    align-items: center;
    object-fit: cover;
    
  }
}
</style>