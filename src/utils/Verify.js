// for forum verifications 

//rules 
const regs = {
    phone: /^((1[0-9]))\d{9}$/,
    password: /^\w+$/, // password: recognize upper/lower cases, must contain number and letters,must be 8-20 digit
}

//verify
const verify = (rule, value, reg, callback) => {
    if(value) {
        if (reg.test(value)) {
            callback()
        }
        else {
            callback(new Error(rule.message))
        }
    }
    else {
        callback()
    }
}

export default {
    phone: (rule, value, callback) => {
        return verify(rule, value, regs.phone, callback)
    },
    password: (rule, value, callback) => {
        return verify(rule, value, regs.password, callback)
    }
}
