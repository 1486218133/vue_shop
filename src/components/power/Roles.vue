<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片内容 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="RolesList" stripe border="">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['ditBottom', i1 === 0 ? 'editTop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 这里是一级权限 -->
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'editTop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRole(scope.row, item3.id)"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 标签列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="allocationRoles(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配角色权限的弹窗 -->
    <el-dialog
      title="分配角色权限"
      :visible.sync="RolesVisible"
      width="50%"
      @close="rightsClose"
    >
      <!-- 树形组件的数据展示 -->
      <el-tree
        :data="jurisdictionList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defArr"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="RolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表数据
      RolesList: [],
      //分配角色权限的状态
      RolesVisible: false,
      //权限列表
      jurisdictionList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      //默认选中的id数组
      defArr: [],
      //当前角色的权限id
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.console.error("获取数据失败");
      this.RolesList = res.data;
    },
    // 删除权限
    async removeRole(role, rights) {
      const confirmRemove = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmRemove !== "confirm") {
        return this.$message.info("已取消删除");
      }
      //发起请求删除权限
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rights}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      //这里返回的数据就是当前角色最新的权限
      role.children = res.data;
    },
    //分配角色权限
    async allocationRoles(role) {
      //保存当前角色的id
      this.roleId = role.id;
      //发起请求获取权限数据树
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$$message.error("获取数据失败");
      }
      this.jurisdictionList = res.data;
      //调用递归函数获取三级权限的id
      this.getLeafKeys(role, this.defArr);
      this.RolesVisible = true;
    },
    //利用递归函数获取三级权限的所有id值
    getLeafKeys(node, arr) {
      //判断是否有children属性，如果没有则返回id
      if (!node.children) {
        return arr.push(node.id);
      }
      //如果有children属性就循环调用递归函数
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });

      //第二种递归写法
      // node.children.forEach(item=>{
      //   if(item.children){
      //     this.getLeafKeys(item,arr)
      //   }else{
      //     return arr.push(item.id)
      //   }
      // })
    },
    //关闭分配权限的弹窗
    rightsClose() {
      //清空权限id的数组
      this.defArr = [];
    },
    //为当前角色添加权限
    async addRole() {
      //将选中和半选中的权限id保存在数组中
      const rolsArr=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      let idStr=rolsArr.join(',')
      const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status!==200){
        return this.$message.error('修改权限失败')
      }
      this.$message.success('权限分配成功')
      this.getRolesList()
      this.RolesVisible=false
    },
    
  },
};
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px !important;
}
.editTop {
  border-top: 1px solid #ccc;
}
.ditBottom {
  border-bottom: 1px solid #ccc;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>