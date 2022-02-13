<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
        <el-row>
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear='removeSearch'>
                    <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
                </el-input>
            </el-col>
        </el-row>

        <!-- 表格列表 -->
        <el-table :data="OrdersList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="订单编号" prop="order_number"></el-table-column>
            <el-table-column label="订单价格" prop="order_price"></el-table-column>
            <el-table-column label="是否付款" prop="pay_status">
                <template v-slot='scope'>
                    <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
                    <el-tag type="success" v-else>已付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="是否发货" prop="is_send"></el-table-column>
            <el-table-column label="下单时间" prop="filterDate">
            </el-table-column>
            <el-table-column label="操作">
                <template v-slot='scope'>
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="changeAddress"></el-button>
                    <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页区域 -->
         <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </el-card>

    <!-- 编辑详细地址 -->
    <el-dialog
    title="修改地址"
    :visible.sync="addressVisible"
    width="50%"
    @close='addressClosed'
    >
    <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="省市区/县" prop="address1">
            <el-cascader style="width:100%" :options="cityData" v-model="addressForm.address1" :props="{ expandTrigger: 'hover',label:'label',value:'value',children:'children' }" @change='addressSelect'></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeAddressAdd">确 定</el-button>
    </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog
    title="物流进度"
    :visible.sync="progressVisible"
    width="50%">
    <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in progerssList"
      :key="index"
      type="primary"
      color="hsl"
      size="large"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import filterDate from '../../utils/time'
import cityData from './citydata'
export default {
  data() {
    return {
        queryInfo:{
            query:'',
            pagenum:1,
            pagesize:10
        },
        total:0,
        OrdersList:[],
        addressForm:{
            address1:[],
            address2:''
        },
        //编辑弹窗状态
        addressVisible:false,
        cityData,
        addressFormRules:{
            address1:[
                { required: true, message: '请选择地址', trigger: 'blur' },
            ],
            address2:[
                { required: true, message: '请输入详细地址', trigger: 'blur' },
            ]
        },
        //物流进度状态弹窗
        progressVisible:false,
        //物流进度
        progerssList:[]
    };
  },
  created() {
      this.getOrdersList()
  },
  methods: {
      //获取数据列表
      async getOrdersList(){
          const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
          if(res.meta.status!==200){
              this.$message.error('获取数据失败')
          }
          console.log(res)
          this.OrdersList=res.data.goods
          this.OrdersList.forEach(item=>{
              item.filterDate=filterDate(item.create_time)
          })
          this.total=res.data.total
          console.log(this.OrdersList)
      },
      //搜索
      search(){
          this.getOrdersList()
      },
      //清空搜索
      removeSearch(){
          this.queryInfo.query=''
          this.getOrdersList()
      },
      handleSizeChange(newSize){
          this.queryInfo.pagesize=newSize
          this.getOrdersList()
      },
      handleCurrentChange(newPage){
          this.queryInfo.pagenum=newPage
          this.getOrdersList()
      },
      changeAddress(){
          this.addressVisible=true
      },
      addressClosed(){
          this.$refs.addressFormRef.resetFields()
      },
      addressSelect(){
          console.log(this.addressForm.address1)
      },
      changeAddressAdd(){
          this.$refs.addressFormRef.validate((bool)=>{
              if(!bool){
                  return this.$message.error('请填写完表单')
              }
              //发起请求

          })
      },
      //查看物流进度
      showProgressBox(){
          this.progerssList=[
    {
      "time": "2018-05-10 09:39:00",
      "ftime": "2018-05-10 09:39:00",
      "context": "已签收,感谢使用顺丰,期待再次为您服务",
      "location": ""
    },
    {
      "time": "2018-05-10 08:23:00",
      "ftime": "2018-05-10 08:23:00",
      "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
      "location": ""
    },
    {
      "time": "2018-05-10 07:32:00",
      "ftime": "2018-05-10 07:32:00",
      "context": "快件到达 [北京海淀育新小区营业点]",
      "location": ""
    },
    {
      "time": "2018-05-10 02:03:00",
      "ftime": "2018-05-10 02:03:00",
      "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
      "location": ""
    },
    {
      "time": "2018-05-09 23:05:00",
      "ftime": "2018-05-09 23:05:00",
      "context": "快件到达 [北京顺义集散中心]",
      "location": ""
    },
    {
      "time": "2018-05-09 21:21:00",
      "ftime": "2018-05-09 21:21:00",
      "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
      "location": ""
    },
    {
      "time": "2018-05-09 13:07:00",
      "ftime": "2018-05-09 13:07:00",
      "context": "顺丰速运 已收取快件",
      "location": ""
    },
    {
      "time": "2018-05-09 12:25:03",
      "ftime": "2018-05-09 12:25:03",
      "context": "卖家发货",
      "location": ""
    },
    {
      "time": "2018-05-09 12:22:24",
      "ftime": "2018-05-09 12:22:24",
      "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
      "location": ""
    },
                            ]
          this.progressVisible=true
      }
  },
};
</script>
<style lang="less" scoped>
</style>