import { ElMessage } from 'element-plus';

const message = {
    error: (msg) =>{
        ElMessage({
            message: msg,
            type: 'error',
            duration: 2000,
        })
    },
    success: (msg) =>{
        ElMessage({
            message:msg,
            type: 'success',
            duration: 2000,
        })
    },
    warning: (msg) =>{
        ElMessage({
            message:msg,
            type: 'warning',
            duration: 2000,
        })
    }
}

export default message;