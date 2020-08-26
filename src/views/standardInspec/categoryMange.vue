<template>
  <div class="category-mange">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="left-wrap">
            <div class="input-wrap">
              <div class="desc">商品名称：</div>
              <Input v-model="filterParam.goodsName" @input.native="handleInput" @on-clear="initListClassify()" clearable placeholder="请输入" />
            </div>
            <div class="input-wrap">
              <div class="desc">类别名：</div>
              <Input v-model="filterParam.category" @input.native="handleInput" @on-clear="initListClassify()" clearable placeholder="请输入" />
            </div>
            <div class="input-wrap">
              <div class="desc">创建日期：</div>
              <DatePicker @on-change="handlePicker" type="datetimerange" format="yyyy-MM-dd HH:mm" placeholder="请选择日期" v-model="dateTime"></DatePicker>
            </div>
          </div>

          <div class="right-wrap">
            <my-button @click.native="jumpToAddCategory(false)"></my-button>
          </div>
          <!-- 筛选按钮 -->
          <!-- <my-button btn-text="筛 选" bg-color="#F3F3F3" bd-color="#ccc"
            text-color="#888" class="filterBtn" @click.native="handleFilter"></my-button> -->
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 检验标准列表  start -->
      <div class="methods-list">
        <!-- <div class="title">检验标准列表</div> -->
        <div class="current-description">检验标准：{{routeParams.description}}</div>
        <div class="content">
          <Table :columns="columns" :data="listClassify">
            <template slot="operation" slot-scope="{row}">
              <span class="operation-item" @click="jumpToAddCategory(row)">编辑</span>
              <span class="operation-item" @click="handleDetail(row)">查看详情</span>
            </template>
          </Table>
        </div>
      </div>
      <!-- 检验标准列表  end -->
    </div>


    <!-- 分页  start -->
    <pagination :total="total" :current="pageNum" :page-size="pageSize" @change-pageNum="handlePageNum" @change-pageSize="handlePageSize"></pagination>
    <!-- 分页 end -->
  </div>
</template>

<script>
import MyButton from "components/myButton/MyButton.vue";
import MySwitch from "components/mySwitch/MySwitch.vue";
import Pagination from "components/pagination/Pagination.vue";

export default {
  name: "category-mange",
  components: {
    MyButton,
    MySwitch,
    Pagination
  },
  data() {
    return {
      // 筛选的参数
      filterParam: {
        goodsName: "", // 商品名称
        category: "", // 所属分类
        standardId: null,  // 检测标准id
        startTime: "", // 开始时间
        endTime: "", // 结束时间
      },
      dateTime: "",
      pageNum: 1,  // 当前页
      pageSize: 10,  // 页容量
      total: 0, // 数据总条数
      // 表格的列表标题
      columns: [
        {
          title: "商品名称",
          key: "goodsName"
        },
        {
          title: "所属类别",
          key: "category"
        },
        {
          title: "创建时间",
          key: "createTime"
        },
        {
          title: "操作",
          slot: "operation",
          width: 200
        }
      ],
      // 检验列表数据
      listClassify: [],
      description: '',
      timer: null,
      routeParams: {}  // 存储路由信息
    };
  },
  watch: {
    // 监听路由
      '$route'() {
        const { id, description} = this.$route.params
        this.description = description  // 保存路由参数
        this.filterParam.standardId = id
        // this.getListClassify()
      },
      // 监听参数变化
    //   filterParam: {
    //   handler: function() {
    //     this.pageNum = 1
    //     this.getListClassify()
    //   },
    //   deep: true
    // }
  },
  activated() {
    for (let key in this.filterParam) {
      this.filterParam[key] = ''
    }
    console.log(this.$route,"$route")
    this.dateTime = ""
    let { paramObj } = this.$route.params
    if(paramObj) {
      this.routeParams = JSON.parse(paramObj)
      this.filterParam.standardId = this.routeParams.id
      this.getListClassify()
    }else {
      this.$router.push({name: 'standard-Inspec'})
    }
  },
  methods: {
    // 初始参数
    initParams(obj) {
			let params = {};
			for (let key in obj) {
				if (obj[key]) {
					params[key] = obj[key];
				}
			}
			return params;
    },

    initListClassify() {
      this.pageNum = 1
      this.getListClassify()
    },
    
    // 获取品类管理
    async getListClassify() {
      let params = this.initParams(this.filterParam)
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      let res = await this.$get('/fast-center/detectionStandard/listClassify',params)
      this.listClassify = res.records
      this.total = res.total
    },

    // 输入商品名称
    handleInput() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() =>{
        this.initListClassify()
      },300)
    },

    // 选择日期
    handlePicker(date) {
      for(let item of date) {
        if(!item) {
          this.filterParam.startTime = ""
          this.filterParam.endTime = ""
        }else {
          this.filterParam.startTime = date[0]
          this.filterParam.endTime = date[1]
        }
      }
      this.initListClassify()
    },

    // 点击新建 / 编辑跳转到 新建品类
    jumpToAddCategory(row) {
      let paramObj
      if(!row) { // 则是新建
        paramObj = {type:'add',standardId:this.routeParams.id}
      }else {
        paramObj = {type:'edit',classifyId:row.classifyId,standardId:this.routeParams.id}
      }
      paramObj = JSON.stringify(paramObj)
      this.$router.push({name: 'add-category',params:{paramObj}})
    },

    handleDetail(row){
      let paramObj = {classifyId: row.classifyId,standardId:this.routeParams.id}
      paramObj = JSON.stringify(paramObj)
      this.$router.push({name: 'category-detail',params:{paramObj}})
    },

    // 改变页码
    handlePageNum(val) {
      this.pageNum = val
      this.getListClassify()
    },

    // 改变页容量
    handlePageSize(val) {
      this.pageSize = val
      this.initListClassify()
    }
  }
};
</script>

<style lang="less" scoped>
.category-mange {
  .main {
    background: @color-white;
    padding: 28px 25px 40px;
    margin-bottom: 30px;
    height: 100%;
    .title {
      font-size: @fontsize-large;
      font-weight: bold;
      margin-bottom: 25px;
      letter-spacing: 1px;
    }

    //  数据筛选  start
    .data-filter {
      .content {
        width: 100%;
        .left-wrap {
          display: inline-block;
          width: 90%;
          .input-wrap {
            display: inline-block;
            width: 28%;
            margin-right: 40px;
            > .desc {
              font-weight: bold;
              margin-bottom: 6px;
            }
          }
        }
        .right-wrap {
          display: inline-block;
          width: 10%;
        }
      }
    }
    //  数据筛选  end

    // 检验方法列表  start
    .methods-list {
      margin-top: 48px;
      .current-description {
        font-size: @fontsize-middle;
        color: @theme-color;
        font-weight: bold;
        margin-bottom: 22px;
        padding-left: 18px;
      }
      .content {
        .operation-item {
          color: @color-blue-ss;
          text-decoration: underline;
          margin: 0 20px;
          &:hover {
            cursor: pointer;
          }
        }
      }
    }
    // 检验方法列表  end
  }
}
</style>

<style lang="less" scoped>
.input-wrap {
  /deep/.ivu-input,
  /deep/.ivu-input-wrapper,
  /deep/.ivu-select-single /deep/.ivu-select-selection,
  /deep/.ivu-date-picker {
    width: 100% !important;
  }
  .textarea {
    height: 114px;
    /deep/.ivu-input {
      height: 114px;
      resize: none;
    }
  }
}
/deep/.ivu-modal-wrap {
    min-height: 400px;
}
</style>