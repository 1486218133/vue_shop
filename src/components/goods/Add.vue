<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示 -->
      <el-alert title="添加商品" type="info" show-icon center closable>
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        align-center
        finish-status="success"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tabs标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beofreTabLeave"
          @tab-click='tabClicked'
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                  expandTrigger: 'hover',
                  label: 'cat_name',
                  value: 'cat_id',
                  children: 'children',
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in tabManyList" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals" @change='checkBoxchange' >
                <el-checkbox :label="it" v-for="(it,index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in tabOnlyList" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
            action="http://127.0.0.1:8888/api/private/v1/upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :headers="headerObj"
            :on-success='imgSuccess'
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"
                ref="myQuillEditor">
            </quill-editor>
            <!-- 添加按钮 -->
            <el-button type="primary" @click="add" class="addBtn">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览弹窗 -->
    <el-dialog
    title="图片预览"
    :visible.sync="preViewVisible">
    <img :src="preViewUrl" alt="" class="priViewImg">
  </el-dialog>
  </div>
</template>
<script>
//下划线为固定引入格式
import _ from 'lodash'
export default {
  data() {
    return {
      //步骤条当前索引
      activeIndex: "0",
      //数据表单
      addForm: {
        //名称
        goods_name: "",
        //价格
        goods_price: 0,
        //重量
        goods_weight: 0,
        //数量
        goods_number: 0,
        //商品分类数组
        goods_cat: [],
        //临时图片路径数组
        pics:[],
        //富文本内容
        goods_introduce:'',
        //静动态数据
        attrs:[]
      },
      //表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
      },
      //分内列表
      cateList: [],
      //动态参数列表
      tabManyList:[],
      //静态参数列表
      tabOnlyList:[],
      //图上上传请求头
      headerObj:{
        Authorization:window.sessionStorage.getItem('token')
      },
      //图片视图路径
      preViewUrl:'',
      //图片预览状态
      preViewVisible:false
    };
  },
  created() {
    //获取分类列表
    this.getCateList();
  },
  methods: {
    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类列表失败");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    //分类触发
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return;
      }
    },
    //离开当前tab之前的函数
    beofreTabLeave(activeName, oldActiveName) {
      if(oldActiveName==='0' && this.addForm.goods_cat.length!==3){
        this.$message.error('请先选择商品分类')
        return false
      }
      //promise使用
      // return new Promise((resolve, reject) => {
      //   if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
      //     this.$message.error("请先选择商品分类");
      //     reject('失败')
      //   }else{
      //     resolve('ok')
      //   }
      // });
    },
    //tab点击切换
    async tabClicked(){
      //判断进入的是否是动态参数面板
      if(this.activeIndex==='1'){
        //发起请求
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
          params:{
            sel:'many'
          }
        })
        if(res.meta.status!==200){
          return this.$message.error('获取动态参数失败')
        }
        res.data.forEach(item=>{
          item.attr_vals=
          item.attr_vals.length!==0?
          item.attr_vals.split(' '):[]
        })
        this.tabManyList=res.data
        console.log(this.tabManyList)
      }else if(this.activeIndex==='2'){
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
          params:{
            sel:'only'
          }
        })
        if(res.meta.status!==200){
          return this.$message.error('获取静态数据失败')
        }
        this.tabOnlyList=res.data
        console.log(this.tabOnlyList)
      }
    },
    //多选
    checkBoxchange(value){
      console.log(value)
    },
    //图片预览函数
    handlePreview(file){
      let url=file.response.data.url
      this.preViewUrl=url
      this.preViewVisible=true
    },
    //移除图片函数
    handleRemove(file){
      let path=file.response.data.tmp_path
      let i=this.addForm.pics.findIndex(item=>item.pic===path)
      this.addForm.pics.splice(i,1)
      console.log(this.addForm)
    },
    //图片长传成功钩子函数
    imgSuccess(response){
      const obj={
        pic:response.data.tmp_path
      }
      this.addForm.pics.push(obj)
      console.log(this.addForm)
    },
    //添加商品
    add(){
      this.$refs.addFormRef.validate(async bool=>{
        if(!bool){
          return this.$message.error('清填写完必填项')
        }
        //发起请求
        //处理动态参数
        this.tabManyList.forEach(item => {
          const newInfo={
            attr_id:item.attr_id,
            attr_value:item.attr_vals.join(' ')
          }
          console.log(111)
          this.addForm.attrs.push(newInfo)
        });
        //处理静态参数
        this.tabOnlyList.forEach(item => {
          const newInfo={
            attr_id:item.attr_id,
            attr_value:item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        });
        //cloneDeep传一个对象并且深拷贝并返回
        const form = _.cloneDeep(this.addForm)
        form.goods_cat=form.goods_cat.join(',')
        console.log(form)

        const {data:res}= await this.$http.post('goods',form)
        if(res.meta.status!==201){
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    }
  },
  computed:{
    //计算id
    cateId(){
      if(this.addForm.goods_cat.length===3){
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
};
</script>
<style lang="less" scoped>
.el-checkbox{
  margin: 0 10px 0 0 !important;
}
.priViewImg{
  width: 100%;
}
/deep/.ql-editor{
  min-height: 300px !important;
}
.addBtn{
  margin-top: 15px;
}
</style>