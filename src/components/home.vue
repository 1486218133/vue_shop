<template>
  <div>
      <el-button type='info' @click="logout">退出登录</el-button>
  </div>
</template>

<script>
export default {
    methods:{
        // 退出登录
        logout(){
            // 清空token
            window.sessionStorage.clear()
            // 跳转至登录页
            this.$router.push('/Login')
        }
    }
}
</script>

<style lang="less" scoped>

</style>