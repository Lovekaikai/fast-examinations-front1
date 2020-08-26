<template>
  <div class="standard-inspec">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="left-wrap">
            <div class="input-wrap">
              <div class="desc">检验名称:</div>
              <Input v-model="filterParam.standard" @input.native="handleInput" @on-clear="initStandardList()" clearable placeholder="请输入" />
            </div>
            <div class="input-wrap">
              <div class="desc">日期:</div>
              <DatePicker @on-change="handlePicker" type="datetimerange" format="yyyy-MM-dd HH:mm" placeholder="请选择日期"></DatePicker>
            </div>
          </div>
          <!-- 新建按钮 -->
          <div class="right-wrap">
            <my-button @click.native="handleAdd"></my-button>
          </div>
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 检验标准列表  start -->
      <div class="methods-list">
        <div class="title">检验标准列表</div>
        <div class="content">
          <Table :columns="columns" :data="standardList">
            <template slot="operation" slot-scope="{row}">
              <span class="operation-item" @click="handleEdit(row)">编辑</span>
              <span class="operation-item" @click="jumpToCategory(row)">品类管理</span>
            </template>
          </Table>
        </div>
      </div>
      <!-- 检验标准列表  end -->
    </div>


    <!-- 新增 / 编辑对话窗 -->
    <Modal :title="dialogTitle" v-model="isShowDialog" width="432"
      class-name="vertical-center-modal" class="modal">
      <Form :model="dialogParams" label-position="top">
        <FormItem label="检验标准名称：" class="input-wrap">
          <Input v-model="dialogParams.standard" clearable placeholder="请输入" />
          <span class="error">{{standardError}}</span>
        </FormItem>
        <FormItem label="检验标准编号：" class="input-wrap">
          <Input v-model="dialogParams.description" clearable placeholder="请输入" />
          <span class="error">{{descriptionError}}</span>
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button btnText="保 存" class="saveBtn" :loading="loading" @click.native="handleSave"></my-button>
        <my-button btnText="取 消" bg-color="#D9534F" bd-color="#D43F3A"
          @click.native="isShowDialog=false"></my-button>
      </div>
    </Modal>


    <!-- 分页  start -->
    <pagination :total="total" @change-pageNum="handlePageNum" :current="pageNum" :page-size="pageSize" @change-pageSize="handlePageSize"></pagination>
    <!-- 分页 end -->
  </div>
</template>

<script>
import MyButton from "components/myButton/MyButton.vue";
import MySwitch from "components/mySwitch/MySwitch.vue";
import Pagination from "components/pagination/Pagination.vue";

export default {
  name: "standard-Inspec",
  components: {
    MyButton,
    MySwitch,
    Pagination
  },
  data() {
    return {
      showLoading: false,
      // 筛选的参数
      filterParam: {
        standard: "", // 检验名称
        startTime: "", // 开始时间
        endTime: "" // 结束时间
      },
      pageNum: 1,   // 当前页
      pageSize: 10,  // 页容量
      total: 0, // 数据总条数
      loading: false,
      // 表格的列表标题
      columns: [
        {
          title: "检验标准",
          key: "description"
        },
        {
          title: "名称",
          key: "standard"
        },
        {
          title: "创建人",
          key: "createName"
        },
        {
          title: "最后修改时间",
          key: "updateTime"
        },
        {
          title: "操作",
          slot: "operation",
          width: 200
        }
      ],    
      standardList: [],   // 检验列表数据
      isShowDialog: false, // 控制是否弹出禁止弹窗
      dialogTitle: "新建检验标准",
      // 对话窗的参数
      dialogParams: {
        id: "",   // 标准id
        standard: "", // 标准名
        description: "" // 标准代码
      },
      standardError: "",
      descriptionError: "",
      timer: null
    };
  },
  created() {
    this.getStandardList()
  },
  // watch: {
  //   filterParam: {
  //     handler: function() {
  //       this.pageNum = 1
  //       this.getStandardList()
  //     },
  //     deep: true
  //   }
  // },

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

    initStandardList() {
      this.pageNum = 1
      this.getStandardList()
    },
    
    async getStandardList() {
      let params = this.initParams(this.filterParam)
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      const res = await this.$get('/fast-center/detectionStandard/list',params)
      this.standardList = res.records
      this.total = res.total
    },

    // 输入检验名称
    handleInput() {
      clearTimeout(this.timer)
      this.timer = setTimeout(async () =>{
         this.initStandardList()
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
      this.initStandardList()
    },

    // 点击新建
    handleAdd() {
      // ***** 初始化 ****** //
      for(let key in this.dialogParams) {
        this.dialogParams[key] = ""
      }
      this.isShowDialog = true
      this.dialogTitle = "新建检验标准";
      this.standardError = ""
      this.descriptionError = ""
    },

    // 点击编辑
    handleEdit(row) {
      this.dialogTitle = "编辑检验标准";
      this.isShowDialog = true;
      this.standardError = ""
      this.descriptionError = ""
      // 方法一赋值
      // for(let key1 in this.dialogParams) {
      //   for(let key2 in row) {
      //     if(key1 === key2) this.dialogParams[key1] = row[key2]
      //   }
      // }
      this.dialogParams = {...row} // 方法2 直接赋值  在保存请求数据时结构要的数值 谨慎要用浅拷贝 不然和表格的对象指向同一地址
    },

        // 点击弹窗保存
    async handleSave() {
      // 非空判断
      const { id, standard, description} = this.dialogParams
      let params = {id,standard,description}
      this.standardError = !standard.toString().trim() ? '请输入检验标准名称' : ''
      this.descriptionError = !description.toString().trim() ? '请输入检验标准编号' : ''
      let requestUrl = '/fast-center/detectionStandard/'
      if(!this.standardError && !this.descriptionError) {
        params = this.initParams(params)
        requestUrl = this.dialogTitle === "新建检验标准" ? `${requestUrl}add` : `${requestUrl}edit`
        this.loading = true
        try {
          const res = await this.$post(requestUrl,params)
          this.isShowDialog = false
          this.loading = false
          this.$Message.success({ background: true, content: '操作成功'})
          if(this.dialogTitle === "新建检验标准") {
            this.initStandardList()
          }else {
            this.getStandardList() // 重新加载数据
          }
        }catch(err) {
          this.loading = false
        }
      }
    },

    // 点击跳转品类管理
    jumpToCategory(row) {
      let paramObj = {id:row.id,description:row.description}
      paramObj = JSON.stringify(paramObj)
      this.$router.push({name: 'category-mange',params:{paramObj}})
    },

    // 改变页码
    handlePageNum(val) {
      this.pageNum = val
      this.getStandardList()
    },

    // 改变页容量
    handlePageSize(val) {
      this.pageSize = val
      this.initStandardList()
    }
  }
};
</script>

<style lang="less" scoped>
.standard-inspec {
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
          width: 90%;
          display: inline-block;
          .input-wrap {
            width: 40%;
          }
        }
        .right-wrap {
          width: 10%;
          display: inline-block;
        }
        .input-wrap {
          display: inline-block;
          margin-right: 60px;
          > .desc {
            font-weight: bold;
            margin-bottom: 6px;
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
      .content {
        .operation-item {
          color: @color-blue-ss;
          text-decoration: underline;
          &:first-child {
            margin-right: 45px;
          }
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