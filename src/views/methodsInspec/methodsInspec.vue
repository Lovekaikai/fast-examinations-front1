<template>
  <div class="methods-inspec">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="input-wrap">
            <div class="desc">检验方法编号:</div>
            <Input v-model="filterParam.detectionMethod" @input.native="handleInput" @on-clear="initDetectionMethod()" clearable placeholder="请输入检验方法" />
          </div>
          <div class="input-wrap">
            <div class="desc">日期:</div>
            <DatePicker type="datetimerange" format="yyyy-MM-dd HH:mm" placeholder="请选择日期" @on-change="handleChange"></DatePicker>
          </div>

          <my-button @click.native="isShowDialog=true"></my-button>
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 检验方法列表  start -->
      <div class="methods-list">
        <div class="title">检验方法列表</div>
        <div class="content">
          <Table :columns="columns" :data="methodsList">
            <template slot="operation" slot-scope="{row}">
              <span class="operation-item hoverPointer" @click="updateChange(row)">编辑</span>
            </template>
          </Table>
        </div>
      </div>
      <!-- 检验方法列表  end -->
    </div>

    <!-- 新建的对话框 -->
    <Modal
      title="新建检验方法"
      v-model="isShowDialog"
      width="432"
      class-name="vertical-center-modal"
      class="modal"
    >
      <Form :model="dialogParams" label-position="top">
        <FormItem label="检验方法编号:" class="input-wrap">
          <Input v-model="dialogParams.detectionMethod" clearable placeholder="请输入检验方法编号" />
        </FormItem>
        <FormItem label="分析方法:" class="input-wrap">
          <Input
            v-model="dialogParams.description"
            type="textarea"
            placeholder="请输入分析方法(不超过150字)"
            class="textarea"
            :rows="4"
            maxlength="150"
            show-word-limit
          />
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button btnText="保 存" class="saveBtn" @click.native="insertDetectionMethod"></my-button>
        <my-button
          btnText="取 消"
          bg-color="#D9534F"
          bd-color="#D43F3A"
          @click.native="isShowDialog=false"
        ></my-button>
      </div>
    </Modal>

    <!-- 新建的对话框 -->
    <Modal
      title="编辑检验方法"
      v-model="updateDiao"
      width="432"
      class-name="vertical-center-modal"
      class="modal"
    >
      <Form :model="dialogParams" label-position="top">
        <FormItem label="检验方法编号:" class="input-wrap">
          <Input v-model="updateParams.detectionMethod" clearable placeholder="请输入检验方法编号" />
        </FormItem>
        <FormItem label="分析方法:" class="input-wrap">
          <Input
            v-model="updateParams.description"
            type="textarea"
            placeholder="请输入分析方法(不超过150字)"
            class="textarea"
            :rows="4"
            maxlength="150"
            show-word-limit
          />
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button btnText="保 存" class="saveBtn" @click.native="updateDetectionMethod"></my-button>
        <my-button
          btnText="取 消"
          bg-color="#D9534F"
          bd-color="#D43F3A"
          @click.native="updateDiao = false"
        ></my-button>
      </div>
    </Modal>

    <!-- 分页  start -->
    <pagination v-if="total > 0" :total="total" :currnet="pageNum" :page-size="pageSize" @change-pageNum="handlePageNum" @change-pageSize="handlePageSize"></pagination>
    <!-- 分页 end -->
  </div>
</template>

<script>
import MyButton from "components/myButton/MyButton.vue";
import MySwitch from "components/mySwitch/MySwitch.vue";
import Pagination from "components/pagination/Pagination.vue";

export default {
  name: "methods-Inspec",
  components: {
    MyButton,
    MySwitch,
    Pagination
  },
  data() {
    return {
      // 筛选的参数
      filterParam: {
        detectionMethod: "",
        startTime: "",
        endTime: ''
      },
      time: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      // 表格的列表标题
      columns: [
        {
          title: "检验方法编号",
          key: "detectionMethod",
          width: 300
        },
        {
          title: "分析方法",
          key: "description"
        },
        {
          title: "最后修改时间",
          key: "updateTime",
          width: 250
        },
        {
          title: "操作",
          slot: "operation",
          width: 140
        }
      ],
      // 检验列表数据
      methodsList: [],
      isShowDialog: false, // 控制是否弹出禁止弹窗
      // 对话窗的参数
      dialogParams: {
        detectionMethod: "", // 检验项目名称
        description: "" // 分析方法
      },
      updateDiao: false,
      updateParams: {
        id: '',
        description: '',
        detectionMethod: ','
      },
      total: 0 // 数据总条数
    };
  },
  // watch: {
  //   filterParam: {
  //     handler: function() {
  //       this.selectDetectionMethod()
  //     },
  //     deep: true
  //   }
  // },
  created() {
    this.getDetectionMethod()
  },
  methods: {
    // 初始化参数
    initParams(obj) {
      let params = {};
			for (let key in obj) {
				if (obj[key]) {
					params[key] = obj[key];
				}
			}
			return params;
    },
    initDetectionMethod() {
      this.pageNum = 1
      this.getDetectionMethod()
    },

    // 获取检验方法列表
    getDetectionMethod() {
      let _params = this.initParams(this.filterParam)
      _params.pageNum = this.pageNum
      _params.pageSize = this.pageSize
      this.$post('/fast-center/dm/backstageList', _params).then((result) => {
        this.methodsList = result.list
        this.total = result.total
      })
    },

     // 输入方法编号
    handleInput() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() =>{
        this.initDetectionMethod()
      },300)
    },

    // 选择日期
    handleChange(date) {
      for(let item of date) {
        if(!item) {
          this.filterParam.startTime = ""
          this.filterParam.endTime = ""
        }else {
          this.filterParam.startTime = date[0]
          this.filterParam.endTime = date[1]
        }
      }
      this.initDetectionMethod()
    },
    // 改变页码
    handlePageNum(val) {
      this.pageNum = val
      this.getDetectionMethod()
    },

    // 改变页容量
    handlePageSize(val) {
      this.pageSize = val
      this.initDetectionMethod()
    },

    // 新建检验方法
    insertDetectionMethod() {
      let _insertParams = this.dialogParams
      if (!_insertParams.detectionMethod) {
        this.$Message.error('检测方法编号未填写')
        return false
      }
      if (!_insertParams.description) {
        this.$Message.error('分析方法未填写')
        return false
      }

      this.$post('/fast-center/dm/add', _insertParams).then(res => {
          this.$Message.success('新建成功')
          this.isShowDialog = false
          this.dialogParams = {
            detectionMethod: '',
            description: ''
          }
          this.initDetectionMethod()
      })
    },
    // 编辑按钮
    updateChange(row) {
      console.log(row)
      this.updateParams = {
        id: row.id,
        description: row.description,
        detectionMethod: row.detectionMethod
      }
      this.updateDiao = true
    },
    // 修改建议方法
    updateDetectionMethod() {
      let _params = this.updateParams
      if (!_params.detectionMethod) {
        this.$Message.error('检测方法编号未填写')
        return false
      }
      if (!_params.description) {
        this.$Message.error('分析方法未填写')
        return false
      }
      this.$post('/fast-center/dm/modify', _params).then(res => {
          this.$Message.success('修改成功')
          this.updateDiao = false
          this.updateParams = {
            detectionMethod: '',
            description: ''
          }
          this.getDetectionMethod()
      })  
    }
  }
};
</script>

<style lang="less" scoped>
.methods-inspec {
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
          width: 30%;
          margin-right: 60px;
          > .desc {
            font-weight: bold;
            margin-bottom: 6px;
          }
          &:first-child {
            margin-right: 60px;
          }
        }
        .filterBtn {
          margin-left: 30px;
        }
      }
    }
    //  数据筛选  end

    // 检验方法列表  start
    .methods-list {
      margin-top: 48px;
    }
    // 检验方法列表  end
  }
}
</style>

<style lang="less" scoped>

/deep/.ivu-modal-wrap {
  min-height: 500px!important;

    .ivu-modal-content {
    .ivu-input,
    .ivu-input-wrapper,
    .ivu-select {
      width: 100% !important;
    }
  }
}
</style>