<template>
  <div class="account-manage">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="input-wrap">
            <div class="desc">姓名:</div>
            <Input v-model="filterParam.realName" @input.native="handleInput" @on-clear="initAccountList()" clearable placeholder="请输入姓名" />
          </div>
          <div class="input-wrap">
            <div class="desc">手机号码:</div>
            <Input v-model="filterParam.mobile" @input.native="handleInput" @on-clear="initAccountList()" clearable placeholder="请输入手机号码" />
          </div>
          <div class="input-wrap">
            <div class="desc">管理部门:</div>
            <Select v-model="filterParam.organization" @on-change="initAccountList()" clearable>
              <Option v-for="item in organizationList" :value="item.organization" :key="item.id">{{item.organization}}</Option>
            </Select>
          </div>
          <div class="input-wrap">
            <div class="desc">日期:</div>
            <DatePicker  @on-change="handlePicker" type="datetimerange" format="yyyy-MM-dd HH:mm" placement="bottom-end" placeholder="请选择日期"></DatePicker>
          </div>
          <!-- 新建按钮 -->
          <my-button @click.native="handleAdd"></my-button>
          <!-- 筛选按钮 -->
          <!-- <my-button btn-text="筛 选" bg-color="#F3F3F3" bd-color="#ccc" text-color="#888" @click.native="handleFilter"></my-button> -->
        </div>
      </div>
      <!-- 数据筛选  end -->

            <!-- 员工账号列表  start -->
            <div class="account-list">
              <div class="title">员工账号列表</div>
              <div class="content">
                <Table :columns="columns" :data="accountList">
                  <template slot="accountStatus" slot-scope="{row}">
                    <span :style="{color: row.accountStatus === 1 ? '#10E700' : '#e73c3b'}">{{row.accountStatus | formatStatus}}</span>
                  </template>
                  <template slot="operation" slot-scope="{row}">
                    <i-switch
                      v-model="row.accountStatus"
                      @on-change="handleSwitch(row,$event)"
                      true-color="#1CC09F"
                      false-color="#ccc"
                      size="large"
                      :true-value="1"
                      :false-value="0"
                    >
                      <span slot="open">正常</span>
                      <span slot="close">禁用</span>
                    </i-switch>
                    <!-- <my-switch :status="row.status" @change-switch="handleSwitch(row,$event)"></my-switch> -->
                    <span class="operation-item hoverPointer" @click="handleEdit(row)">编辑</span>
                  </template>
                </Table>
              </div>
            </div>
            <!-- 员工账号列表  end -->
          </div>

          <!-- 新建的对话框 -->
          <Modal :title="dialogTitle" v-model="isShowDialog" width="430" class-name="vertical-center-modal" class="modal">
            <Form :model="dialogParams" label-position="top">
              <FormItem label="姓名:" class="input-wrap">
                <Input clearable placeholder="请输入姓名" v-model="dialogParams.realName" />
                <div class="error">{{nameError}}</div>
              </FormItem>
              <FormItem label="手机号码:" class="input-wrap">
                <Input clearable placeholder="请输入手机号码" v-model="dialogParams.mobile" />
                <div class="error">{{mobileError}}</div>
              </FormItem>
              <FormItem label="选择组织:" class="input-wrap">
                <Select v-model="dialogParams.organizationId" clearable>
                  <Option v-for="item in organizationList" :value="item.id" :key="item.id">{{item.organization}}</Option>
                </Select>
                <div class="error">{{selectError}}</div>
              </FormItem>
              <FormItem label="账号名:" class="input-wrap">
                <Input clearable placeholder="请输入账号名" disabled v-model="dialogParams.account" v-if="dialogTitle === '编辑账号'"/>
                <Input clearable placeholder="请输入账号名" v-model="dialogParams.account" v-else/>
                <div class="error">{{accountError}}</div>
              </FormItem>
            </Form>
            <div slot="footer" class="footer">
              <my-button class="saveBtn" btnText="保 存" @click.native="handleSave" :loading="loading"></my-button>
              <my-button btnText="取 消" bg-color="#D9534F" bd-color="#D43F3A" @click.native="isShowDialog=false" ></my-button>
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
  name: "account-manage",
  components: {
    MyButton,
    MySwitch,
    Pagination
  },
  data () {
    return {
      filterParam: {
        organization: "", // 组织机构名称
        realName: "",  // 用户姓名
        mobile: "",  // 用户手机号码
        startDate: "", // 开始日期
        endDate: "", // 结束日期 
      },
      pageNum: 1,
      pageSize: 10,
      timer: null,
      loading: false,
      organizationList: [],  // 组织机构下拉列表
      // 表格的列表标题
      columns: [
        {
          title: "姓名",
          key: "realName",
        },
        {
          title: "账号名称",
          key: "account"
        },
        {
          title: "手机号码",
          key: "mobile",
          width: 150
        },
        {
          title: "管理部门",
          key: "organization"
        },
        {
          title: "状态",
          slot: "accountStatus",
          width: 80
        },
        {
          title: "创建日期",
          key: "createTime"
        },
        {
          title: "操作",
          slot: "operation"
        }
      ],
      accountList: [],
      isShowDialog: false, // 控制是否弹出禁止弹窗
      dialogTitle: "新建账号",
      // 对话窗的参数
      dialogParams: {
        realName: "", // 用户姓名
        mobile: "", // 用户手机号码
        account: "", // 用户账号名称
        organizationId: "" // 组织机构id
      },
      nameError: "",
      mobileError: "",
      selectError: "",
      accountError: "",
      total: 0 ,// 数据总条数
      accountId:0//编辑用户ID
    };
  },
  // watch: {
  //   filterParam: {
  //     handler: function() {
  //       this.pageNum = 1
  //       this.getAccountList()
  //     },
  //     deep: true
  //   }
  // },
  filters: {
    formatStatus (value) {
      switch (value) {
        case 1:
          return "有效"
        case 0:
          return "无效"
        default:
          break
      }
    }
  },
  async created () {
    await this.getAccountList()
    await this.getOrganizationList()
  },
  methods: {
    // 初始参数
    initParams (obj) {
      let params = {};
      for (let key in obj) {
        if (obj[key]) {
          params[key] = obj[key];
        }
      }
      return params;
    },

    initAccountList() {
      this.pageNum = 1
      this.getAccountList()
    },

    // 获取账号列表
    getAccountList () {
      return new Promise(async resolve => {
        let params = this.initParams(this.filterParam)
        params.pageNum = this.pageNum
        params.pageSize = this.pageSize
        const res = await this.$post('/fast-center/userAccount/list', params)
        // console.log(res)
        this.accountList = res.records
        this.total = res.total
        resolve(true)
      })
    },

    // 获取组织机构列表
    getOrganizationList () {
      return new Promise(async resolve => {
        const res = await this.$get('/fast-center/userOrganization/pull')
        // console.log(res)
        this.organizationList = res
        resolve(true)
      })
    },

    // 选择日期
    handlePicker (date) {
      console.log(date)
      for (let item of date) {
        if (!item) {
          this.filterParam.startDate = item
          this.filterParam.endDate = item
        }else {
          this.filterParam.startDate = date[0]
          this.filterParam.endDate = date[1]
        }
      }
      this.initAccountList()
    },

    // 输入姓名 / 手机号码
   handleInput() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.initAccountList()
      },300)
    },

    // 清除日期
    handleClearTime () {
      this.filterParam.pageNum = 1
      this.filterParam.startDate = ''
      this.filterParam.endDate = ''
      this.getAccountList()
    },
    // 点击筛选
    // handleFilter () {
    //   console.log(this.filterParam)
    // },

    // 点击新建
    handleAdd () {
      this.isShowDialog = true;
      this.dialogTitle = "新建账号";
      // ****初始化**** //
      for (let key in this.dialogParams) {
        this.dialogParams[key] = ""
      }
      this.nameError = ""
      this.mobileError =""
      this.selectError = ""
      this.accountError = ""
    },

    // 点击编辑
    handleEdit (row) {
      // 让后端返回 对应的id
      this.dialogTitle = "编辑账号";
      this.isShowDialog = true;
      console.log(row);
      this.accountId = row.accountId
      this.dialogParams.realName = row.realName
      this.dialogParams.mobile = row.mobile
      this.dialogParams.account = row.account
      this.dialogParams.organizationId = row.organizationId
      this.nameError = ""
      this.mobileError =""
      this.selectError = ""
      this.accountError = ""
    },

    // 点击保存
    handleSave () {
      const { realName, mobile, account, organizationId } = this.dialogParams
      this.nameError = !realName.toString().trim() ? '请输入姓名' : ''
      this.accountError = !account.toString().trim() ? '请输入账号名' : ''
      this.selectError = !organizationId ? '请选择组织' : ''
      if (mobile.toString().trim()) {
        if (/^([0-9]{3,4})?[0-9]{7,8}$|^([0-9]{3,4}-)?[0-9]{7,8}$/.test(mobile)) {
          this.mobileError = ''
        } else {
          this.mobileError = '请输入正确的手机号码'
        }
      } else {
        this.mobileError = '请输入手机'
      }

      // 账号验证
      if (account.toString().trim()) {
        if (/[\u4E00-\u9FA5]/g.test(account)) {
          this.accountError = '账号不能含有中文'
        } else {
          this.accountError = ''
        }
      } else {
        this.accountError = '请输入账号'
      }

      if (!this.nameError && !this.mobileError && !this.accountError && !this.selectError) {
        this.loading = true
        if (this.dialogTitle === "编辑账号") {
          let update = {
                "realName": this.dialogParams.realName,
                "accountId": this.accountId,
                "organizationId": this.dialogParams.organizationId,
                "mobile": this.dialogParams.mobile
          }
          this.$post('/fast-center/userAccount/updateAccount', update).then(res => {
            // console.log(res)
            this.$Message.success({ background: true, content: res });
            this.isShowDialog = false
            this.loading = false
            this.getAccountList()
          }).catch(err => {
            this.loading = false
          })
        } else {
          this.$post('/fast-center/userAccount/addAccount', this.dialogParams).then(res => {
            this.$Message.success({ background: true, content: res });
            this.isShowDialog = false
            this.loading = false
            this.initAccountList()
          }).catch(err => {
            this.loading = false
          })
        }
      }
    },

    // 切换开关
    handleSwitch (row) {
      let param = {
        accountStatus: row.accountStatus,
        id: row.accountId
      }
      this.$post('/fast-center/userAccount/updateStatus', param).then(res => {
        // this.$Message.success({ background: true, content: res });
        if(res === '注销账号'){
        this.$Message.error({ background: true, content: res });
        }else {
        this.$Message.success({ background: true, content: res });
        }
      })
    },

    // 改变页码
    handlePageNum (val) {
      // console.log(val);
      this.pageNum = val
      this.getAccountList()
    },

    // 改变页容量
    handlePageSize (val) {
      // console.log(val);
      this.pageSize = val
      this.initAccountList()
    }
  }
};
</script>

<style lang="less" scoped>
.account-manage {
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
        .input-wrap {
          display: inline-block;
          margin-right: 24px;
          > .desc {
            font-weight: bold;
            margin-bottom: 6px;
          }
        }
      }
    }
    //  数据筛选  end

    // 账号列表  start
    .account-list {
      margin-top: 48px;
      .content {
        .operation-item {
          text-align: right;
          margin-left: 40px;
        }
      }
    }
    // 账号列表  end
  }
}
</style>

<style lang="less" scoped>
.data-filter {
  .input-wrap {
    width: 21%;
  }
}

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
  .ivu-select {
    width: 100% !important;
  }
}
</style>