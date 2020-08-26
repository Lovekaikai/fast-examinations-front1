<template>
  <div class="param-unit">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="left-wrap">
            <div class="input-wrap">
              <div class="desc">参数单位:</div>
              <Input v-model="param.measurement"  @input.native="handleInput" @on-clear="initParamUnitList()" clearable placeholder="请输入参数单位" />
            </div>
            <div class="input-wrap">
              <div class="desc">日期:</div>
              <DatePicker placeholder="请选择日期" type="datetimerange" format="yyyy-MM-dd HH:mm" @on-change="handleChange"></DatePicker>
            </div>
            <!-- 筛选按钮 -->
            <!-- <my-button btn-text="筛 选" bg-color="#F3F3F3" bd-color="#ccc" text-color="#888" class="filterBtn"></my-button> -->
          </div>

          <div class="right-wrap">
            <!-- 新建按钮 -->
            <my-button @click.native="handleAdd"></my-button>
          </div>
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 单位列表  start -->
      <div class="unit-list">
        <div class="title">单位列表</div>
        <div class="content">
          <Table :columns="columns" :data="unitList">
            <template slot="valid" slot-scope="{row}">
              <span :style="{color: row.valid === 1? '#10E700' : '#e73c3b'}">{{row.valid === 1? "有效":"无效"}}</span>
            </template>
            <template slot="operation" slot-scope="{row}">
              <span class="operation-item hoverPointer" @click="editParamUnit(row)">编辑</span>
              <!-- <span class="operation-item hoverPointer" @click="delParamUnit(row)">删除</span> -->
              <!-- <span class="operation-item hoverPointer">查看详情</span> -->
            </template>
          </Table>
        </div>
      </div>
      <!-- 单位列表  end -->
    </div>

    <!-- 新建的对话框 -->
    <Modal title="新建参数单位" v-model="addShowDialog" width="420" class-name="vertical-center-modal" class="modal" @on-cancel="addhandleClose">
      <Form ref="addUnitParams" :model="addUnitParams" label-position="top">
        <FormItem label="参数名称:" class="input-wrap">
          <Input v-model="addUnitParams.description" clearable placeholder="请输入参数名称" />
          <div class="error">{{paramError}}</div>
        </FormItem>
        <FormItem label="参数符号:" class="input-wrap">
          <Input v-model="addUnitParams.measurement" clearable placeholder="请输入参数符号" />
          <div class="error">{{unitError}}</div>
        </FormItem>
        <FormItem label="状态:" prop="valid" class="input-wrap">
          <i-switch size="large" @on-change="addhandleSwitch(addUnitParams.valid)" v-model="addUnitParams.valid" :true-value="1" :false-value="0"
          true-color="#1CC09F" false-color="#ccc">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button @click.native="addhandleSubmit('addUnitParams')" class="saveBtn" btnText="保 存"></my-button>
        <my-button @click.native="addcancelClick('addUnitParams')" btnText="取 消" bg-color="#D9534F" bd-color="#D43F3A"></my-button>
      </div>
    </Modal>

    <!-- 编辑的对话框 -->
    <Modal title="编辑参数单位" v-model="editShowDialog" width="420" class-name="vertical-center-modal" class="modal" >
      <Form ref="editUnitParams" :model="editUnitParams" label-position="top">
        <FormItem label="参数名称:" class="input-wrap">
          <Input v-model="editUnitParams.description" clearable placeholder="请输入参数名称" />
          <div class="error">{{paramError}}</div>
        </FormItem>
        <FormItem label="参数符号:" class="input-wrap">
          <Input v-model="editUnitParams.measurement" clearable placeholder="请输入参数符号" />
          <div class="error">{{unitError}}</div>
        </FormItem>
        <FormItem label="状态:" prop="valid" class="input-wrap">
          <i-switch size="large" @on-change="edithandleSwitch(editUnitParams.valid)" v-model="editUnitParams.valid" :true-value="1" :false-value="0" 
          true-color="#1CC09F" false-color="#ccc">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button @click.native="edithandleSubmit('editUnitParams')" class="saveBtn" btnText="保 存"></my-button>
        <my-button @click.native="editcancelClick('editUnitParams')" btnText="取 消" bg-color="#D9534F" bd-color="#D43F3A"></my-button>
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
  name: "param-unit",
  components: {
    MyButton,
    MySwitch,
    Pagination
  },
  data() {
    return {
      //列表请求参数
      param: {
        measurement: "",
        valid: -1,
        startTime: "",
        endTime: ""
      },
      pageNum: 1,
      pageSize: 10,
      timer: null,
      // 表格的列表标题
      columns: [
        {
          title: "参数名称",
          key: "description"
        },
        {
          title: "参数符号",
          key: "measurement"
        },
        {
          title: "创建时间",
          key: "createTime"
        },
        {
          title: "状态",
          slot: "valid"
        },
        {
          title: "操作",
          slot: "operation"
        }
      ],
      // 单位列表数据
      unitList: [],
      addShowDialog: false, // 控制是否弹出禁止弹窗新建
      editShowDialog: false, // 控制是否弹出禁止弹窗编辑

      // 新建单位参数
      addUnitParams: {
        description: "",
        measurement: "",
        valid: 1
      },
      // 新建表单验证对象
      addruleValidate: {
        description: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ],
        measurement: [
          { required: true, message: "请输入参数单位", trigger: "blur" }
        ]
      },
      
       // 编辑要传单位参数
      editUnitParams: {
        id:"",
        measurement: "",
        description: "",
        valid: "", 
      },
      paramError: "",
      unitError: "",    
      total: 0 // 数据总条数
    };
  },
  watch: {
    // param: {
    //   deep: true,
    //   handler: function(newValue, oldValue) {
    //     this.pageNum = 1
    //     this.getParamUnitList();
    //   }
    // }
  },
  created() {
    this.getParamUnitList();
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

    initParamUnitList() {
      this.pageNum = 1
      this.getParamUnitList()
    },

    //参数单位列表
    async getParamUnitList() {
      // console.log(this.param);
      let _params = this.initParams(this.param)
      _params.pageNum = this.pageNum,
      _params.pageSize = this.pageSize
      const { records, total } = await this.$post("/fast-center/detectionMeasurement/getPages",_params);
      this.unitList = records;
      this.total = total;
    },

    // 输入商品名称
    handleInput() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() =>{
        this.initParamUnitList()
      },300)
    },

    // 选择日期
    handleChange(date) {
      if (date) {
        // 获取到秒级时间戳
        this.param.startTime = Date.parse(new Date(date[0])) / 1000;
        this.param.endTime = Date.parse(new Date(date[1])) / 1000;
      } else {
        this.param.startTime = "";
        this.param.endTime = "";
      }
      this.initParamUnitList()
    },

    // 点击新建弹框
    handleAdd() {
      // ****初始化**** //
      for (let key in this.addUnitParams) {
        this.addUnitParams[key] = ""
      }
      this.addUnitParams.valid = 1
      this.addShowDialog = true;
      this.paramError = ""
      this.unitError = ""
    },
    // 切换开关
    addhandleSwitch(val) {
      console.log(val);
      this.addUnitParams.valid = val;
    },

    //点击新建参数单位保存按钮
    addhandleSubmit(name) {
      // console.log(name)
      const { description,measurement } = this.addUnitParams
      this.paramError = !description.toString().trim() ? '请输入参数名称' : ''
      this.unitError = !measurement.toString().trim() ? '请输入参数单位' : ''
      
      if(!this.paramError && !this.unitError) {
        this.$post( "/fast-center/detectionMeasurement/insert",this.addUnitParams).then(res => {
            this.addShowDialog = false;
            this.$Message.success(res);
            // this.handleReset("addUnitParams");
            // 新建参数单位成功后刷新列表
            this.initParamUnitList();
          });
      }
    },
    // 点击取消订单取消按钮 清空表单
    addcancelClick(formName) {
      this.addShowDialog = false;
      this.handleReset("addUnitParams");
    },
    // 关闭前的回调，点击x后关闭 清空表单
    addhandleClose() {
      this.addcancelClick();
    },
    //重置表单方法
    handleReset(name) {
      console.log(name)
      this.$refs[name].resetFields();
    },

    //点击编辑
    editParamUnit(row){
      this.editShowDialog = true
      // console.log(row)
      this.editUnitParams.id = row.id
      this.editUnitParams.measurement = row.measurement
      this.editUnitParams.description = row.description
      this.editUnitParams.valid = row.valid
      this.paramError = ""
      this.unitError = ""
    },
    // 点击取消订单取消按钮 清空表单
    editcancelClick(formName) {
      this.editShowDialog = false;
      // this.handleReset("editUnitParams");
    },
  
     // 切换开关
    edithandleSwitch(val) {
      console.log(val);
      this.editUnitParams.valid = val;
    },
    //点击编辑参数单位保存按钮
    edithandleSubmit(name) {
      // console.log(name)
      const { description,measurement } = this.editUnitParams
      this.paramError = !description.toString().trim() ? '请输入参数名称' : ''
      this.unitError = !measurement.toString().trim() ? '请输入参数单位' : ''
      if(!this.paramError && !this.unitError) {
        this.$post("/fast-center/detectionMeasurement/update",this.editUnitParams).then(res => {
            this.editShowDialog = false;
            this.$Message.success(res);
            // this.handleReset("editUnitParams");
            // 编辑参数单位成功后刷新列表
            this.getParamUnitList();
          });
      }
    },

    //删除参数单位列表一条数据
    delParamUnit(row) {
      // console.log(row);
       this.$msgbox.confirm("你是否确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$get(`/fast-center/detectionMeasurement/deleteById?id=${row.id}`).then(res => {
             console.log(res)
            this.$Message.success(res);
            //删除参数单位成功后刷新列表
            this.getParamUnitList();                   
          });
        })
        .catch(() => {
          this.$Message.info("已取消删除");
        });
    },
    // 改变页码
    handlePageNum(val) {
      this.pageNum = val;
      this.getParamUnitList()
    },

    // 改变页容量
    handlePageSize(val) {
      this.pageSize = val;
      this.initParamUnitList()
    }
  }
};
</script>

<style lang="less" scoped>
.param-unit {
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
        .left-wrap {
          width: 90%;
          display: inline-block;
          .input-wrap {
            width: 32%;
          }
        }
        .right-wrap {
          display: inline-block;
        }
        .input-wrap {
          display: inline-block;
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

    // 单位列表  start
    .unit-list {
      margin-top: 48px;
    }
    // 单位列表  end
  }

  .modal {
    .input-wrap {
      display: inline-block;
    }
  }

  // 单位列表  start
  .unit-list {
    margin-top: 48px;
    .content {
      .operation-item {
        margin-right: 40px;
      }
    }
  }
  // 单位列表  end
}
</style>

<style lang="less" scoped>
/deep/.ivu-modal-wrap {
  min-height: 600px;
  .input-wrap {
    position: relative;
    &:last-child {
      margin-bottom: 0 !important;
    }
  }
  .error {
    // position: absolute;
    // top: ;
    font-size: @fontsize-small;
    color: #e73c3b;
    line-height: 24px;
  }
}

.ivu-modal-content {
  .ivu-input,
  .ivu-input-wrapper,
  .ivu-select-single,
  .ivu-select-selection {
    width: 100% !important;
  }
}
</style>