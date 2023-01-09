<template>
    <div class="window" 
        :style="{width:windowWidth+'px'}"
        v-if="show">
        <div class="title">
            <span class="iconfont icon-back"
                    @click="close"></span>
        </div>
        <div class="body">
            <slot></slot>
        </div>
            <template v-if="buttons&&buttons.length>0||showCancel">
            <div class="footer">
            <el-button link
                        @click="close">
                Cancel
            </el-button>
            <el-button v-for="btn in buttons"
                        :type="btn.type"
                        @click="btn.click">
                {{btn.text}}
            </el-button>
            </div>
        </template>
    </div>
</template>

<script setup>

import {ref} from 'vue';

const windowWidth = window.innerWidth - 280;
const props = defineProps({
    show: {
        type:Boolean,
        default: false,
    },
    buttons: {
        type: Array,
    },
    showCancel: {
        type: Boolean,
        default: true,
    }
})

const emit = defineEmits(["close"]);
const close = () => {
    emit("close")
}
</script>

<style lang="scss">
   
    
    .window{
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: calc(100vh - 80px);
        background: #fff;
        z-index: 50;
        
        .title {
            height: 30px;
            display: flex;
            align-items: center;
            padding-left: 10px;
            .icon-back {
                font-size: 35px;
                cursor: pointer;
            }
        }
        .body {
            height: calc(100vh - 149px);
           
            padding:10px;
        }
        .footer {
            border-top: 1px solid #ddd ;
            text-align: center;
            line-height: 50px;     
        }
    }
</style>