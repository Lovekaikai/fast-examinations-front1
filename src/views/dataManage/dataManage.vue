<template>
  <div class="data-manage">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="input-wrap">
            <div class="desc">检验商品/类别名:</div>
            <Input v-model="filterParam.categoryName" @input.native="handleInput" @on-clear="initTableData()" clearable placeholder="请输入" />
          </div>
          <!-- <div class="input-wrap">
            <div class="desc">参检人员:</div>
            <Input v-model="filterParam.account" @on-keyup="handleInput" @on-clear="initTableData()" clearable placeholder="请输入" />
          </div> -->
          <div class="input-wrap">
            <div class="desc">管理点:</div>
            <Input v-model="filterParam.laboratory" @input.native="handleInput" @on-clear="initTableData()" clearable placeholder="请输入" />
            <!-- <Select v-model="filterParam.laboratory" clearable @on-change="initTableData()">
              <Option v-for="item in pointList" :value="item.implementPoints" :key="item.id">{{item.implementPoints}}</Option>
            </Select> -->
          </div>
          <div class="input-wrap">
            <div class="desc">检验结果:</div>
            <Select v-model="filterParam.isQualified" clearable @on-change="initTableData()">
              <Option v-for="item in resultList" :value="item.value" :key="item.value">{{item.label}}</Option>
            </Select>
          </div>
           <div class="input-wrap">
            <div class="desc">生成检验结果时间:</div>
            <DatePicker  @on-change="handlePicker" type="datetimerange" format="yyyy-MM-dd HH:mm" placeholder="请选择日期" style="width:100%"></DatePicker>
          </div>
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 数据管理列表  start -->
      <div class="data-list">
        <div class="title">数据管理列表</div>
        <div class="content">
          <Table :columns="columns" :data="tableData">
            <template slot="resultIsQualified" slot-scope="{row}">
              <span :style="{'color': row.resultIsQualified === '合格' ? '#1AE000':'#ED0000'}">
                {{row.resultIsQualified}}
              </span>
            </template>
            <template slot="operation" slot-scope="{row}">
              <span class="operation-item hoverPointer" @click="handleCheckDetail(row)">查看详情</span>
            </template>
          </Table>
        </div>
      </div>
      <!-- 数据管理列表  end -->
    </div>

    <!-- 分页  start -->
    <pagination :total="total" :current="pageNum" :page-size="pageSize" @change-pageNum="handlePageNum" @change-pageSize="handlePageSize"></pagination>
    <!-- 分页 end -->
  </div>
</template>

<script>
import MyButton from "components/myButton/MyButton.vue";
import Pagination from "components/pagination/Pagination.vue";

export default {
  name: "param-unit",
  components: {
    MyButton,
    Pagination
  },
  data() {
    return {
      // 筛选的参数
      filterParam: {
        categoryName: "",  // 	类别名称
        isQualified: "",  // 是否合格
        laboratory: "", // 管理点（实验室）
        startTime: "",  // 开始时间
        endTime: ""  // 结束时间
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      timer: null,
      // 表格的列表标题
      columns: [
        {
          title: "检验商品/类别",
          key: "categoryName"
        },
        {
          title: "检验结果",
          slot: "resultIsQualified"
        },
        {
          title: "管理点",
          key: "laboratory"
        },
         {
          title: "生成检验结果时间",
          key: "laboratory"
        },
        {
          title: "操作",
          slot: "operation",
          width: 180
        }
      ],
      // 检验结果数据
      resultList: [
        {value: "合格",label: "合格"},
        {value: "不合格",label: "不合格"}
      ],
      // 管理点数据
      pointList: [],
      
      // 单位列表数据
      tableData: [],
      isShowDialog: false // 控制是否弹出禁止弹窗
    };
  },
  created() {
    // this.getPointList()
    this.getTableData()
  },
  methods: {
    // 初始化参数
    initParams(obj) {
      let params = {}
      for(let key in  obj) {
        if(obj[key]) {
          params[key] = (obj[key])
        }
      }
      return params
    },

    // 获取管理点下拉列表
    async getPointList() {
      const res = await this.$get('/fast-center/detectionImplementPoints/pull')
      this.pointList = res
    },

    // 获取数据管理
    async getTableData() {
      let params = this.initParams(this.filterParam)
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      const res = await this.$post('/fast-center/drdc/searchMergeResultList',params)
      this.tableData = res.list
      this.total = res.total
    },

    initTableData() {
      this.pageNum = 1
      this.getTableData()
    },

    // 输入类别名 / 参检人员
   handleInput() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.initTableData()
      },300)
    },

    // 选择日期
    handlePicker(date) {
       for (let item of date) {
        if (!item) {
          this.filterParam.startTime = item
          this.filterParam.endTime = item
        }else {
          this.filterParam.startTime = date[0]
          this.filterParam.endTime = date[1]
        }
      }
      this.initTableData()
    },
 
    // 点击查看详情
    handleCheckDetail(row) {
      this.$router.push({name: "inspect-detail",params:{batchNo:row.batchNo}})
    },

    // 改变页码
    handlePageNum(val) {
      this.pageNum = val
      this.getTableData()
    },

    // 改变页容量
    handlePageSize(val) {
      this.pageSize = val
      this.initTableData()
    }
  }
};
</script>

<style lang="less" scoped>
.data-manage {
  .main {
    background: @color-white;
    padding: 28px 25px 40px;
    margin-bottom: 30px;
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
        .input-wrap {
          width: 22%;
          display: inline-block;
          margin-right: 30px;
          margin-bottom: 16px;
          > .desc {
            font-weight: bold;
            margin-bottom: 6px;
          }
        }
      }
    }
    //  数据筛选  end

    // 数据管理列表  start
    .data-list {
      margin-top: 48px;
    }
    // 数据管理列表  end
  }
}
</style>