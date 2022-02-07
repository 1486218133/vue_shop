<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 内容区域 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        show-index
        index-text="#"
        :selection-type="false"
        border
      >
        <!-- 分类列 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序列 -->
        <template v-slot:sort="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template v-slot:edt>
          <el-button type="primary" icon="el-icon-edit" size="mini"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类弹窗 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateVisible"
      width="50%"
      @close="addCateColsed"
    >
    <!--表单验证 -->
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
             <el-cascader
                v-model="selectKeys"
                :options="parentCateList"
                :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children'}"
                @change="handleChange"
                change-on-select
                clearable
                ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="addfenlei"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 请求数据体
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //所有数据
      cateList: [],
      // 数据总条数
      total: 0,
      //表格列的配置
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          prop: "cat_deleted",
          //当前列为自定义模板列
          type: "template",
          //当前列的作用域插槽名
          template: "isok",
        },
        {
          label: "排序",
          prop: "cat_level",
          //当前列为自定义模板列
          type: "template",
          //当前列的作用域插槽名
          template: "sort",
        },
        {
          label: "排序",
          prop: "cat_level",
          //当前列为自定义模板列
          type: "template",
          //当前列的作用域插槽名
          template: "edt",
        },
      ],
      //添加分类弹窗
      addCateVisible: false,
      // 添加分类表单数据
      addCateForm:{
          //要添加的分类名称
          cat_name:'',
          //父类的id
          cat_pid:0,
          //自己等级
          cat_level:0
      },
      //添加分类验证规则
      addCateRules:{
          cat_name:[
              { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
      },
      //父级分类列表
      parentCateList:[],
      //级联选择器的数组
      selectKeys:[]
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      let { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
      console.log(this.cateList);
    },
    // 监听每页显示多少条数据的变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听每页的变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //添加分类
    addCate() {
      //获取父级分类列表
      this.getParentCateList()
      this.addCateVisible = true;
    },
    //获取父级分类的列表
    async getParentCateList(){
        const {data:res} = await this.$http.get('categories',{params:{type:2}})
        if(res.meta.status!==200){
            return this.$message.error('获取数据失败')
        }

        console.log(res.data)
        this.parentCateList=res.data
    },
    //级联选择改变时的方法
    handleChange(){
        if(this.selectKeys.length>0){
            this.addCateForm.cat_pid=this.selectKeys[this.selectKeys.length-1]
            this.addCateForm.cat_level=this.selectKeys.length
        }else{
            this.addCateForm.cat_pid=0;
            this.addCateForm.cat_level=0;
        }
    },
    //确定添加
    addfenlei(){
        this.$refs.addCateRef.validate(async boolean=>{
            if(!boolean){
                return this.$message.error('请填写完表单')
            }
                //发起请求添加数据
                const {data:res} = await this.$http.post('categories',this.addCateForm)
                if(res.meta.status!==201){
                    return this.$message.error('添加失败')
                }
                this.$message.success('添加成功')
                this.getCateList()
                this.addCateVisible=false
        })
    },
    //对话框关闭监听事件
    addCateColsed(){
        //重置表单
        this.$refs.addCateRef.resetFields()
        //重置级联选择器
        this.selectKeys=[]
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
    }
  },
};
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>