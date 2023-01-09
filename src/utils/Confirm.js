import { ElMessageBox   } from 'element-plus';

const confirm = (message,okfun) => {
    ElMessageBox.confirm(
       message,
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'info',
        }
      )
        .then(() => {
         okfun();
        })
        .catch(() => { })
};

export default confirm;
