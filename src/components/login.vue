<template>
  <div class="login_container">
    <!-- 登录窗口 -->
    <div class="login_box">
      <!-- 头像 -->
      <div class="login_logo">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录区域 -->
      <el-form
        class="login_from"
        :rules="loginRules"
        :model="loginfrom"
        ref="loginRef"
        label-width="0px"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginfrom.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginfrom.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLogin">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单数据
      loginfrom: {
        username: "admin",
        password: "123456",
      },

      // 表单校验规则
      loginRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 5, max: 10, message: "长度在 5 到 10 个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods:{
    //   重置登录信息
      resetLogin(){
          this.$refs.loginRef.resetFields()
      },
    // 登录校验
    login(){
        this.$refs.loginRef.validate( async bool=>{
            // 如果bool我true则通过验证，obj是未通过验证的校验
            if(!bool) return ;
            let {data:res}=await this.$http.post('login',this.loginfrom)
            if(res.meta.status!==200) return this.$message.error('登录失败')

            // 将登录成功的token存在sessionStorage中
            window.sessionStorage.setItem('token',res.data.token)

            //跳转至home页面
            this.$router.push('/home')

        })
    }
  }
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  border-radius: 5px;
  background-color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .login_logo {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    border: 3px solid #eee;
    padding: 10px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  .login_from {
    position: absolute;
    top: 30%;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;

    .btns {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
