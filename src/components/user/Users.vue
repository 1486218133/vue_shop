<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片内容区域 -->
    <el-card>
      <!-- 搜索内容 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            clearable
            placeholder="请输入内容"
            v-model="getUserList.query"
            @clear="getUsers"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchUser"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格内容区域 -->
      <el-table :data="userList" style="width: 100%" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="180"
        ></el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="amend(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页处理 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getUserList.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="getUserList.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="50%"
      @close="shut"
    >
      <!-- 内容区域 -->
      <el-form
        :model="addForm"
        :rules="addrules"
        ref="ruleFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="changeUser"
      width="50%"
      @close="closeChangeUser"
    >
      <!-- 修改用户表单 -->
      <el-form
        :model="changeUserFrom"
        :rules="changeUserFromRules"
        ref="changeUserFromRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="changeUserFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="changeUserFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="changeUserFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeUser = false">取 消</el-button>
        <el-button type="primary" @click="addChangeUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //   自定义验证规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }

    // 手机号验证规则
    var checkMobile = (rule, value, cb) => {
      const regMobile =
        /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法手机号'))
    }

    return {
      // 获取数据的参数对象
      getUserList: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2,
      },
      // 用户数据
      userList: [],
      // 数据条数
      total: 0,
      //对话框状态
      dialogVisible: false,
      //添加用户对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //添加用户表单验证规则
      addrules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 5,
            max: 10,
            message: '长度在 5 到 10 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      //修改用户信息对话框
      changeUser: false,
      //修改用户信息的数据
      changeUserFrom: {},
      //修改用户表单的验证规则
      changeUserFromRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getUsers()
  },
  methods: {
    //   获取用户数据
    async getUsers() {
      const { data: res } = await this.$http.get('users', {
        params: this.getUserList,
      })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听每页数据
    handleSizeChange(newSize) {
      this.getUserList.pagesize = newSize
      this.getUsers()
    },
    // 监听页码的变化
    handleCurrentChange(newPage) {
      this.getUserList.pagenum = newPage
      this.getUsers()
    },
    // 修改用户状态
    async userStateChange(newState) {
      const { data: res } = await this.$http.put(
        `users/${newState.id}/state/${newState.mg_state}`
      )
      if (res.meta.status !== 200) {
        newState.mg_state = !newState.mg_state
        return this.$message.error('更新数据失败')
      }
      this.$message.success('更新数据成功')
    },
    // 搜索用户
    searchUser() {
      this.getUsers()
    },
    // 关闭对话框重置表单
    shut() {
      this.$refs.ruleFormRef.resetFields()
    },
    // 添加用户验证
    addUser() {
      this.$refs.ruleFormRef.validate(async (bool) => {
        if (!bool) return
        // 发起请求添加用户
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.dialogVisible = false
        this.getUsers()
      })
    },
    // 修改用户信息
    async amend(id) {
      // 发起请求查询数据
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.changeUserFrom = res.data
      this.changeUser = true
    },
    // 关闭修改框清空验证
    closeChangeUser() {
      this.$refs.changeUserFromRef.resetFields()
    },
    //提交修改信息
    addChangeUser() {
      this.$refs.changeUserFromRef.validate(async (bool) => {
        if (!bool) return
        //发起请求
        const { data: res } = await this.$http.put(
          'users/' + this.changeUserFrom.id,
          {
            email: this.changeUserFrom.email,
            mobile: this.changeUserFrom.mobile,
          }
        )
        if (res.meta.status !== 200) return this.$message.error('更新数据失败')
        //关闭对话框
        this.changeUser = false
        //刷新数据
        this.getUsers()
        //提示修改成功
        this.$message.success('修改成功')
      })
    },
    //删除用户操作
    async removeUser(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      //如果结果为confirm则表示确定
      //如果结果为cancel则表示取消
      if (confirmResult !== 'confirm') return this.$message.info('取消删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getUsers()
    },
  },
}
</script>
<style lang="less" scoped>
</style>