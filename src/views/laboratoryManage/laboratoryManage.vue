<template>
  <div class="laboratory-manage">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="input-wrap">
            <div class="desc">实验室名称:</div>
            <Input v-model="filterParam.labName" @input.native="handleInput" @on-clear="initLaboratoryList()" clearable placeholder="请输入" />
          </div>
          <div class="input-wrap">
            <div class="desc">所在地:</div>
            <!-- <Cascader :data="locationData" v-model="location"></Cascader> -->
            <Cascader :data="areaData" v-model="location" :load-data="loadData" 
              @on-change="handleChange"></Cascader>
          </div>
          <div class="input-wrap">
            <div class="desc">开通状态:</div>
            <Select v-model="filterParam.labStatus" clearable @on-change="initLaboratoryList()">
              <Option v-for="item in statusList" :value="item.value" :key="item.value">
                {{item.label}}
              </Option>
            </Select>
          </div>
          <div class="input-wrap">
            <div class="desc">日期:</div>
            <DatePicker @on-change="handlePicker" type="datetimerange" format="yyyy-MM-dd HH:mm"  placement="bottom-end" placeholder="请选择日期"></DatePicker>
          </div>
          <!-- 筛选按钮 -->
          <!-- <my-button btn-text="筛 选" bg-color="#F3F3F3" bd-color="#ccc" text-color="#888"></my-button> -->
          <my-button @click.native="handleAdd"></my-button>
          <!-- 新建按钮 -->
          <!-- <div>
            <my-button class="addBtn" @click.native="isShowDialog=true"></my-button>
          </div> -->
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 实验室管理列表  start -->
      <div class="laboratory-list">
        <div class="title">实验室管理列表</div>
        <div class="content">
          <Table :columns="columns" :data="laboratoryList">
             <template slot="administrationOrganization" slot-scope="{row}">
              <span>{{!row.administrationOrganization ? '暂无' : row.administrationOrganization}}</span>
            </template>
            <template slot="labStatus" slot-scope="{row}">
              <span :style="{color: row.labStatus === 1 ? '#10E700' : '#e73c3b'}">
                {{row.labStatus === 1 ? '已激活' : '未激活'}}
              </span>
            </template>
            <template slot="operation" slot-scope="{row}">
              <!-- <span class="operation-item hoverPointer" @click="handleEdit(index)">编辑</span> -->
              <span class="operation-item hoverPointer" @click="handleCheck(row)">查看配置码</span>
            </template>
          </Table>
        </div>
      </div>
      <!-- 实验室管理列表  end -->
    </div>

    <!-- 新建的对话框 -->
    <Modal :title="dialogTitle" v-model="isShowDialog" width="390" 
      class-name="vertical-center-modal" class="modal" >
      <Form label-position="top">
        <!-- <FormItem label="实验室名称:" class="input-wrap">
          <Input v-model="dialogParams.name" clearable placeholder="请输入实验室名称" />
        </FormItem> -->
        <FormItem label="选择组织:" class="input-wrap">
          <Select v-model="organizationId" clearable style="width:100%">
            <Option v-for="item in organizationList" :value="item.id" :key="item.id" >{{item.organization}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button class="saveBtn" btnText="保 存" @click.native="handleSave" :loading="loading"></my-button>
        <my-button btnText="取 消" bg-color="#D9534F" bd-color="#D43F3A" @click.native="isShowDialog=false"></my-button>
      </div>
    </Modal>


    <!-- 查看配置码的对话窗 -->
     <Modal title="查看配置码" v-model="isShowCheckDialog" width="400" 
      class-name="vertical-center-modal" class="modal" >
      <div style="font-weight:bold;text-align:center;letter-spacing:2px;font-size:15px">实验室信息</div>
        <Form :model="dialogCheckParams" style="margin-top:30px">
          <FormItem label="实验室名称:" class="input-wrap">
            <span style="font-size:13px">{{dialogCheckParams.labName}}</span>
          </FormItem>
          <FormItem label="配置码:" class="input-wrap">
            <span style="font-size:13px">{{dialogCheckParams.systemCode}}</span>
          </FormItem>
        </Form>
      <div slot="footer" class="footer">
        <my-button btnText="确 定" @click.native="handleConfirm"></my-button>
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
  name: "laboratory-manage",
  components: {
    MyButton,
    MySwitch,
    Pagination
  },
  data() {
    return {
      filterParam: {
        labName: "", // 实验室名称
        areaId: "", // 	地址区域id
        labStatus: null,  // 开通状态
        startDate: "", // 开始日期
        endDate: "" // 结束日期 
      },
      pageNum: 1, // 当前页 
      pageSize: 10, // 页大小 
      total: 0, // 数据总条数
      timer: null,
      loading: false,
      areaData: [],  // 所在地
      location: [], //选中的所在地
      // 开通状态
      statusList: [
        { value: 1, label: "已激活" },
        { value: 2, label: "未激活" }
      ],
      // 表格的列表标题
      columns: [
        {
          title: "实验室名称",
          key: "labName"
        },
        {
          title: "管理部门",
          slot: "administrationOrganization"
        },
        {
          title: "实验室地址",
          key: "labAddress"
        },
        {
          title: "创建时间",
          key: "createTime"
        },
        {
          title: "开通状态",
          slot: "labStatus",
          width: 120
        },
        {
          title: "操作",
          slot: "operation",
          width: 160
        }
      ],     
      laboratoryList: [], // 实验室列表数据
      organizationList: [],   // 组织机构列表
      isShowDialog: false, // 控制新建是否弹出禁止弹窗
      isShowCheckDialog: false, // 控制查看配置码是否弹出禁止弹窗
      dialogTitle: "新建实验室", // dialog标题
      // 对话窗的 所在地
      dialogSiteData: [
        {
          value: "guangdong",
          label: "广东省",
          children: [
            {
              value: "guangzhou",
              label: "广州市",
              children: [
                {
                  value: "tianhe",
                  label: "天河区"
                }
              ]
            }
          ]
        }
      ],
      dialogSite: [], //对话窗选中的所在地
      dialogCheckParams: {
        labName: "",  // 实验室名称
        systemCode: ""  // 配置码
      },
      organizationId: ""  // 组织机构id
    };
  },
  async created() {
    await this.getLaboratoryList()
    await this.getAreaData(0)
    await this.getOrganizationList()
  },
  // watch: {
  //   filterParam: {
  //     handler: function() {
  //       this.pageNum = 1
  //       this.getLaboratoryList()
  //     },
  //     deep: true
  //   }
  // },
  // activated() {
  //   this.getLaboratoryList()
  //   this.getOrganizationList()
  // },

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

    initLaboratoryList() {
      this.pageNum = 1
      this.getLaboratoryList()
    },

    // 获取实验室列表
    getLaboratoryList() {
      return new Promise(async resolve => {
        let params = this.initParams(this.filterParam)
        params.pageNum = this.pageNum
        params.pageSize = this.pageSize
        const res = await this.$post('/fast-center/detectionImplementPoints/list',params)
        this.laboratoryList = res.records
        this.total = res.total
        resolve(true)
      })
    },

    // 获取组织机构列表
    getOrganizationList() {
      return new Promise(async resolve => {
        const res = await this.$get('/fast-center/userOrganization/pull')
        console.log(res)
        this.organizationList = res
        resolve(true)
      })    
    },

    // 输入实验室名称
    handleInput() {
        //清除上一次的定时
      clearTimeout(this.timer)

      //设置延时发送请求
      this.timer = setTimeout(() =>{
        this.initLaboratoryList()
      },300) 
    },

    handleTreeData(list) {
      // console.log(list)
      let arr = [];
      let obj;

      if (list && list.length !== 0) {

        list.map((item) => {
          obj = {...item}
          if(item.level !== 3) {
            obj.children = []
            obj.loading = false
          }
          arr.push(obj);
        });

        return arr

      }else {
        console.log('进来了')
        obj.loading = false;
        arr.push(obj);
        return arr
      }

    },

    // 获取四级区域地址
    getAreaData(id) {
      return new Promise(async resolve => {
        const res = await this.$get(`/fast-center/area/subordinate?parentId=${id}`,false)
        console.log(res)
        this.areaData = this.handleTreeData(res)
        console.log(this.areaData)
        resolve(true)
      })    
    },

    // 动态加载所在地
    async loadData(item,callback) {
      item.loading = true;
      // console.log(item)
      setTimeout(async () => {
        const {value} = item
        const res = await this.$get(`/fast-center/area/subordinate?parentId=${value}`,false)
        item.children = this.handleTreeData(res)
        // console.log(item.children,"item.children")
        let flag = item.children.some(element => {
          return element.level === 2
        })
        if(flag)  item.children.shift()  // 这里是要去掉 市辖区
        item.loading = false;
        callback()
      },10)
    },

    // 选择所在地
    handleChange(value) {
      this.filterParam.areaId = value.length === 0 ? "" : value.pop()
      this.initLaboratoryList()
    },

    // 选择开通状态
    // handleStatus(value) {
    //   console.log(value)
    //   console.log(this.filterParam.labStatus)
    //   // this.filterParam.labStatus = value
    //   // this.filterParam.pageNum = 1
    //   // this.getLaboratoryList()
    // },  

    // 选择日期
    handlePicker(date) {
      for(let item of date) {
        if(!item) {
          this.filterParam.startDate = item
          this.filterParam.endDate = item
        }else {
          this.filterParam.startDate = date[0]
          this.filterParam.endDate = date[1] 
        }
      }
      this.initLaboratoryList()
    },

    // 点击新增
    handleAdd() {
      this.isShowDialog = true
      this.organizationId = ""
    },

    // 点击编辑
    // handleEdit(index) {
    //   this.dialogTitle = "编辑实验室";
    //   this.isShowDialog = true;
    //   console.log(index);
    // },

    // 点击查看配置码
    async handleCheck(row) {
      this.isShowCheckDialog = true
      const res = await this.$get(`/fast-center/detectionImplementPoints/get?id=${row.id}`)
      this.dialogCheckParams.labName = res.labName
      this.dialogCheckParams.systemCode = res.systemCode
    },

    // 点击查看配置码确认
    handleConfirm() {
      this.isShowCheckDialog = false
      for(let key in this.dialogCheckParams) {
        this.dialogCheckParams[key] = ""
      }
    },

    // // 选择实验室
    // handleOrganization(val) {
    //   console.log(val)
    //   this.organizationId = val
    // },

    // 点击保存
    async handleSave() {
      if(!this.organizationId) return this.$Message.error({background: true,content: '请选择组织'})
      this.loading = true
      try {
        const res = await this.$get(`/fast-center/detectionImplementPoints/add?organizationId=${this.organizationId}`)
        this.isShowDialog = false
        this.loading = false
        this.initLaboratoryList()
      }catch(err) {
        this.loading = false
      }
    },

    // 改变页码
    handlePageNum(val) {
      this.pageNum = val
      this.getLaboratoryList()
    },

    // 改变页容量
    handlePageSize(val) {
      this.pageSize = val
      this.initLaboratoryList()
    }
  }
};
</script>

<style lang="less" scoped>
.laboratory-manage {
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
          margin-right: 20px;
          > .desc {
            font-weight: bold;
            margin-bottom: 6px;
          }
        }
      }
    }
    //  数据筛选  end

    // 实验室管理列表  start
    .laboratory-list {
      margin-top: 48px;
      .content {
        .operation-item {
          &:first-child {
            margin-right: 25px;
          }
        }
      }
    }
    // 实验室管理列表  end
  }
}
</style>

<style lang="less" scoped>
.data-filter {
  .input-wrap {
    width: 21%;
  }
}

/deep/.ivu-form-item-content {
  /deep/.ivu-input,
  /deep/.ivu-input-wrapper，
  /deep/.ivu-select,
  /deep/.ivu-select-selection {
    width: 100% !important;
  }
}
</style>