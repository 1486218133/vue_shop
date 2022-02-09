<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        title="注意：只能三级才能设置"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 级联选择器 -->
      <el-row>
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <!-- tag标签 -->
              <template v-slot='scope'>
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key='i' closable @close='closeAttr(i,scope.row)'>{{item}}</el-tag>
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="动态名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParamsContent(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addVisible = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border>
            <!-- 展开列 -->
             <el-table-column type="expand">
              <!-- tag标签 -->
              <template v-slot='scope'>
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key='i' closable @close='closeAttr(i,scope.row)'>{{item}}</el-tag>
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="静态名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParamsContent(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数弹窗 -->
    <el-dialog
      :title="'添加' + addText"
      :visible.sync="addVisible"
      @close="addFormClosed"
      width="50%"
    >
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="addText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数弹窗 -->
    <el-dialog
      :title="'编辑' + addText"
      :visible.sync="editVisible"
      @close="editFormClosed"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="editFormrules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="addText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 级联选择框的数据
      cateList: [],
      //级联选择的数据
      selectCateKeys: [],
      //tab标签页选择
      activeName: "many",
      //是否显示按钮
      //showBtn:true
      //动态数据
      manyTableData: [],
      //静态数据
      onlyTableData: [],
      //添加参数对话框
      addVisible: false,
      //添加参数的对象
      addForm: {
        attr_name: "",
      },
      //表单验证规则
      addFormrules: {
        attr_name: [{ required: true, message: "请输入内容", trigger: "blur" }],
      },
      //编辑弹窗状态
      editVisible: false,
      //编辑对象
      editForm: {
        attr_name: "",
      },
      //编辑弹窗校验规则
      editFormrules: {
        attr_name: [{ required: true, message: "请输入内容", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      this.cateList = res.data;
    },
    //级联数据改变触发
    handleChange() {
      this.getParamsData();
    },
    // tab标签点击方法
    handleClick() {
      this.getParamsData();
      console.log(this.activeName);
    },
    //获取参数列表
    async getParamsData() {
      //数据改变时获取参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      res.data.forEach(item=>{
        item.attr_vals=item.attr_vals?item.attr_vals.split(" "):[]
        item.inputVisible=false
        item.inputValue=""
      })
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
      console.log(res.data)
    },
    //关闭添加弹窗
    addFormClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (bool) => {
        if (!bool) {
          return this.$message.error("添加数据失败");
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败");
        }
        this.$message.success("添加成功");
        this.addVisible = false;
        this.getParamsData();
      });
    },
    //编辑显示弹窗
    async editParamsContent(id) {
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`)
      if(res.meta.status!==200){
          return this.$message.error('获取失败')
      }
      this.editForm=res.data
      this.editVisible = true;
    },
    //编辑弹窗关闭
    editFormClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //编辑参数确定
    editParams() {
        this.$refs.editFormRef.validate(async bool=>{
            if(!bool){
                return this.$message.error('填写完整信息')
            }
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                attr_name:this.editForm.attr_name,
                attr_sel:this.activeName
            })
            if(res.meta.status!==200){
                return this.$message.error('编辑失败')
            }
            this.$message.success('编辑成功')
            this.getParamsData()
            this.editVisible=false
        })
    },
    //删除参数
    async removeParams(attr_id){
      const confirmResult =  await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err=>err)
      if(confirmResult!=='confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if(res.meta.status!==200){
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getParamsData()
    },
    //回车或者失去焦点触发
    handleInputConfirm(row){
      if(row.inputValue.trim().length===0){
        row.inputValue=""
        row.inputVisible=false
        return
      }
      //有效值发起请求
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible=false
      this.saveAttrVals(row)
    },
    //编辑删除tag
    async saveAttrVals(row){
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
      })
      if(res.meta.status!==200){
        return this.$message.error('编辑失败')
      }
      this.$message.success('编辑成功')
      row.inputValue=""
    },
    //显示输入框
    showInput(row){
      row.inputVisible=true
      this.$nextTick(()=>{
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //删除tag
    closeAttr(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    //获取级联选择的id
    cateId() {
      if (this.selectCateKeys.length == 3) {
        return this.selectCateKeys[2];
      }
      return null;
    },
    //添加参数对话框
    addText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态参数";
      }
    },
  },
  //第二种方式实现按钮禁用
  // watch:{
  //     selectCateKeys(newold){
  //         if(newold.length===3){
  //             this.showBtn=false
  //         }else{
  //             this.showBtn=true
  //         }
  //     }
  // }
};
</script>
<style lang="less" scoped>
.el-row {
  margin: 15px 0;
}
.el-tag{
  margin: 5px;
}
.input-new-tag{
  width: 120px;
}
</style>