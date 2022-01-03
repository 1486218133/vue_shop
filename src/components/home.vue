<template>
  <!-- 整个容器 -->
  <el-container>
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <!-- 主要内容区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isToggle?'64px':'200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 导航栏 -->
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#4F91D6"
          unique-opened
          :collapse="isToggle"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
            <!-- 一级菜单区域 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单区域 -->
            <el-menu-item @click="savePath('/'+subitem.path)" :index=" '/'+subitem.path" v-for="subitem in item.children" :key="subitem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容区域 -->
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
      return{
        //左侧菜单信息
        menuList:[],
        // 动态二级图标
        iconsObj:{
            "125":"iconfont icon-users",
            "103":"iconfont icon-tijikongjian",
            "101":"iconfont icon-shangpin",
            "102":"iconfont icon-danju",
            "145":"iconfont icon-baobiao"
        },
        // 折叠菜单栏状态
        isToggle:false,
        // 存储保存的二级导航
        activePath:''
      }
        
  },
  created(){
      this.getMenuList(),
      // 一进入组件就获取当前保存的二级导航路径
      this.activePath=window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录
    logout() {
      // 清空token
      window.sessionStorage.clear();
      // 跳转至登录页
      this.$router.push("/Login");
    },
    // 获取菜单信息
    async getMenuList(){
        const {data:res} = await this.$http.get('menus')
        if(res.meta.status!==200) return this.$message.error(res.meta.msg)
        this.menuList=res.data
    },
    // 是否折叠菜单栏
    toggleCollapse(){
        this.isToggle=!this.isToggle
    },
    // 保存当前导航点击的地址
    savePath(activePath){
      // 将获取的值存在缓存中
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath=activePath
    }
  },
  
};
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #363c3f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;

  > div {
    display: flex;
    align-items: center;

    span {
      margin-left: 15px;
      font-size: 20px;
    }
  }
}
.el-aside {
  background-color: #313743;

  .toggle-button{
      width: 100%;
      font-size: 10px;
      line-height: 24px;
      text-align: center;
      background-color: #475163;
      letter-spacing: 0.2em;
      color: #fff;
      cursor: pointer;
  }
  .el-menu {
      border-right: none;
  }
}
.el-main {
  background-color: #e8ecf0;
}
.iconfont{
    margin-right: 10px;
}
</style>