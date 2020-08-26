<template>
  <div class="inspect-item">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="input-wrap">
            <div class="desc">检验项目名:</div>
            <Input v-model="filterParam.item" @input.native="handleInput" @on-clear="selectInspectItemList()" clearable placeholder="请输入检验项目名" />
          </div>

          <div class="input-wrap">
            <div class="desc">状态:</div>
            <Select v-model="filterParam.itemStatus" clearable @on-change="selectInspectItemList()">
              <Option v-for="item in statusList" :value="item.value" :key="item.value">{{item.label}}</Option>
            </Select>
          </div>

          <div class="input-wrap">
            <div class="desc">日期:</div>
            <DatePicker type="datetimerange" confirm placeholder="请选择日期" format='yyyy-MM-dd HH:mm:ss' @on-change='handleChange'></DatePicker>
          </div>
          <!-- 新建按钮 -->
          <my-button @click.native="insertButton"></my-button>
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 检验列表  start -->
      <div class="inspect-list">
        <div class="title">检验列表</div>
        <div class="content">
          <Table :columns="columns" :data="inspectList">
            <template slot="itemStatus" slot-scope="{row}">
              <span v-if="row.itemStatus === 0">未启用</span>
              <span v-if="row.itemStatus === 1">启用</span>
              <span v-if="row.itemStatus === 2">作废</span>
            </template>
            <template slot="operation"  slot-scope="{row}">
              <span class="operation-item hoverPointer" @click="handleEdit(row.id)">编辑</span>
            </template>
          </Table>
        </div>
      </div>
      <!-- 检验列表  end -->
    </div>

    <!-- 新建的对话框 -->
    <Modal
      :title="updateType ? '编辑检验项目':'新建检验项目'"
      v-model="isShowDialog"
      width="432"
      class-name="vertical-center-modal"
      class="modal"
    >
      <Form :model="addParams" label-position="top">
        <FormItem label="检验项目名称:" class="input-wrap">
          <Input v-model="addParams.item" clearable placeholder="请输入" />
        </FormItem>
        <FormItem label="检验项目符号:" class="input-wrap">
          <Input v-model="addParams.itemCode" clearable placeholder="请输入" />
          <!-- <Select v-model="addParams.symbol">
            <Option
              v-for="item in symbolList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select> -->
        </FormItem>
        <FormItem label="检测项状态:" class="input-wrap">
          <!-- <Input v-model="addParams.itemCode" clearable placeholder="请输入" /> -->
          <Select v-model="addParams.itemStatus">
            <Option
              v-for="item in statusList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button btnText="保 存" class="saveBtn" @click.native="changIns"></my-button>
        <my-button
          btnText="取 消"
          bg-color="#D9534F"
          bd-color="#D43F3A"
          @click.native="isShowDialog=false"
        ></my-button>
      </div>
    </Modal>

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
  name: "inspect-item",
  components: {
    MyButton,
    MySwitch,
    Pagination
  },
  data() {
    return {
      // 筛选的参数
      filterParam: {
        item: "",
        time: [],
        itemStatus: ''
      },
      statusList: [
        {
          value: 0,
          label: '未启用'
        },
        {
          value: 1,
          label: '启用'
        },
        {
          value: 2,
          label: '作废'
        }
      ],
      pageNum: 1,
      pageSize: 10,
      // 表格的列表标题
      columns: [
        {
          title: "检验项目名称",
          key: "item"
        },
        {
          title: "项目符号",
          key: "itemCode"
        },
        {
          title: "最后修改时间",
          key: "createTime"
        },
        {
          title: "状态",
          slot: "itemStatus",
          width: 120
        },
        {
          title: "操作",
          slot: "operation",
          width: 160
        }
      ],
      // 检验列表数据
      inspectList: [],
      isShowDialog: false, // 控制是否弹出禁止弹窗
      // 新建的参数
      addParams: {
        item: "", // 检验项目名称
        itemCode: "", // 检验项目符号
        itemStatus: ''
      },
      // 项目符号列表
      symbolList: [
        {
          value: "Pb",
          label: "Pb"
        },
        {
          value: "pH",
          label: "pH"
        }
      ],
      total: 0, // 数据总条数
      updateType: false,
      timer: null
    };
  },
  // watch: {
  //   filterParam: {
  //     handler: function() {
  //       this.selectInspectItemList()
  //     },
  //     deep: true
  //   }
  // },
  created() {
    this.getInspectItemList()
  },
  methods: {
    // 初始化参数
    initParams(obj) {
      let params = {};
			for (let key in obj) {
        if (typeof(obj[key]) == 'number') {
          // if (obj[key]) {
            params[key] = obj[key];
          // }
        } else if (Array.isArray(obj[key])) {
          if (obj[key][0]) {
            
            params.startTime = new Date(obj[key][0]).getTime() / 1000
            
          }
          if (obj[key][1]) {
            params.endTime = new Date(obj[key][1]).getTime() / 1000
          }
          
        } else {
          if (obj[key]) {
            params[key] = obj[key];
          }
        }
				
			}
			return params;
    },

    // 获取检验项目列表
    getInspectItemList() {
      let _params = this.initParams(this.filterParam)
      // let _params = {}
      // if (!Number(_params.itemStatus)) {
      //   _params.itemStatus = -1
      // }
      // console.log(_params)
      _params.pageNum = this.pageNum
      _params.pageSize = this.pageSize
      this.$post('/fast-center/detectionItem/getPages', _params).then((result) => {
        this.inspectList = result.records
        this.total = result.total
      }).catch((err) => {
        
      });
    },
    selectInspectItemList() {
      this.pageNum = 1
      // this.pageSize = 10
      this.getInspectItemList()
    },

    handleInput() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.selectInspectItemList()
      },300)
    },

    // 选择日期
    handleChange(date) {
      console.log(date);
      this.filterParam.time = date
      this.selectInspectItemList()
      // this.filterParam.endTime = date[1]
    },

    // 切换开关
    handleSwitch(val) {
      console.log(val);
    },

    // 改变页码
    handlePageNum(val) {
      this.pageNum = val
      this.getInspectItemList()
      // console.log(val);
    },

    // 改变页容量
    handlePageSize(val) {
      this.pageSize = val
      this.getInspectItemList()
      console.log(val);
    },
    changIns() {
      if (this.updateType) {
        this.updateInspectItem()
      } else {
        this.insertInspectItem()
      }
    },
    // 新建按钮
    insertButton() {
      this.addParams = {
        item: "", // 检验项目名称
        itemCode: "", // 检验项目符号
        itemStatus: ''
      }
      this.updateType = false
      this.isShowDialog = true
    },
    // 新建检验项目
    insertInspectItem() {
      let _insertParams = this.addParams
      if (!_insertParams.item) {
        this.$Message.error('检验项目名称未填写')
        return false
      }
      if (!_insertParams.itemCode) {
        this.$Message.error('检验项目符号未填写')
        return false
      }

      if(!String(_insertParams.itemStatus)) {
        this.$Message.error('状态未选择')
        return false
      }

      this.$post('/fast-center/detectionItem/insert', _insertParams).then((result) => {
        this.$Message.success(result)
        this.isShowDialog = false
        this.addParams = {
          item: "", // 检验项目名称
          itemCode: "", // 检验项目符号
          itemStatus: ''
        }
        this.getInspectItemList()
      })
    },
    // 编辑按钮
    handleEdit(id) {
      this.updateType = true
      this.$get('/fast-center/detectionItem/getById/' + id).then((result) => {
        this.addParams = {
          itemCode: result.itemCode,
          item: result.item,
          itemStatus: result.itemStatus,
          id: result.id
        }
        this.isShowDialog = true
      })
    },
    // 编辑检验项目
    updateInspectItem() {
      let _insertParams = this.addParams
      if (!_insertParams.item) {
        this.$Message.error('检验项目名称未填写')
        return false
      }
      if (!_insertParams.itemCode) {
        this.$Message.error('检验项目符号未填写')
        return false
      }

      if(!String(_insertParams.itemStatus)) {
        this.$Message.error('状态未选择')
        return false
      }

      this.$post('/fast-center/detectionItem/update', _insertParams).then((result) => {
        console.log(result)
        this.$Message.success(result)
        this.isShowDialog = false
        this.addParams = {
          item: "", // 检验项目名称
          itemCode: "", // 检验项目符号
          itemStatus: ''
        }
        this.getInspectItemList()
      }).catch((err) => {
        
      });
    }
  }
};
</script>

<style lang="less" scoped>
.inspect-item {
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
        .input-wrap {
          display: inline-block;
          margin-right: 30px;
          width: 28%;
          > .desc {
            font-weight: bold;
            margin-bottom: 6px;
          }
          &:last-child {
            margin-right: 0;
          }
        }
        .filterBtn {
          margin-left: 30px;
        }
      }
    }
    //  数据筛选  end

    // 单位列表  start
    .inspect-list {
      margin-top: 48px;
    }
    // 单位列表  end
  }
}
</style>

<style lang="less" scoped>

.ivu-modal-content {
  .ivu-input,
  .ivu-input-wrapper,
  .ivu-select-single,.ivu-select-selection {
    width: 100% !important;
  }
}

/deep/.ivu-modal-wrap {
  min-height: 502px;
  .input-wrap {
    position: relative;
    &:last-child {
      margin-bottom: 0 !important;
    }
  }
}
</style>
