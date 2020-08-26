<template>
  <div class="organization-manage">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="left-wrap">
            <div class="input-wrap">
              <div class="desc">管理部门名称:</div>
              <Input v-model="filterParam.organization" @input.native="handleInput" @on-clear="initOrganizationList()" clearable placeholder="请输入 "/>
            </div>
            <div class="input-wrap">
              <div class="desc">日期:</div>
              <DatePicker @on-change="handlePicker" type="datetimerange" format="yyyy-MM-dd HH:mm"  placement="bottom-end" placeholder="请选择日期"></DatePicker>
            </div>
            <div class="input-wrap">
              <div class="desc">所在地:</div>
              <!-- <Cascader :data="areaData" @on-change="handleChange"></Cascader> -->
              <Cascader :data="areaData" v-model="location_one" :load-data="loadData" 
              @on-change="handleChange"></Cascader>
            </div>
            <!-- 筛选按钮 -->
            <!-- <my-button btn-text="筛 选" bg-color="#F3F3F3" bd-color="#ccc" text-color="#888" @click.native="handleFilter"></my-button> -->
          </div>

          <!-- 新建按钮 -->
          <div class="right-wrap">
            <my-button class="addBtn" @click.native="handleAdd"></my-button>
          </div>
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 组织管理列表  start -->
      <div class="department-list">
        <div class="title">组织管理列表</div>
        <div class="content">
          <Table :columns="columns" :data="organizationList">
            <template slot="operation" slot-scope="{row}">
              <span class="operation-item hoverPointer" @click="handleEdit(row)">编辑</span>
              <span class="operation-item hoverPointer" @click="$router.push({name:'site-arrange',params:{organizationId:row.id}})" >配置</span>
            </template>
          </Table>
        </div>
      </div>
      <!-- 组织管理列表  end -->
    </div>

    <!-- 新建/编辑的对话框 -->
    <Modal :title="dialogTitle" v-model="isShowDialog" width="600" class-name="vertical-center-modal" class="modal" >
      <Form :model="dialogParams" label-position="top">
        <FormItem label="管理部门:" class="input-wrap">
          <Input v-model="dialogParams.organization" clearable placeholder="请输入管理部门" />
          <div class="error">{{nameError}}</div>
        </FormItem>
        <FormItem label="所在地:" class="input-wrap">
          <Cascader :data="areaData" v-model="location_two" :load-data="loadData" :change-on-select="changeOnSelect"  
          @on-change="handleModalChange" @on-visible-change="handleChangeOnSelect"></Cascader>
          <div class="error">{{areaError}}</div>
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button class="saveBtn" btnText="保 存" :loading="loading" @click.native="handleSave"></my-button>
        <my-button btnText="取 消" bg-color="#D9534F" bd-color="#D43F3A" @click.native="isShowDialog=false"></my-button>
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
// import tree from '../../../mock/tree'
export default {
  name: "organization-manage",
  components: {
    MyButton,
    MySwitch,
    Pagination
  },
  data() {
    return { 
      filterParam: {
        organization: "", // 组织机构名称
        areaId: "", // 	地址区域id
        startDate: "", // 开始日期
        endDate: "" // 结束日期 
      },
      pageNum: 1, // 当前页 
      pageSize: 10, // 页大小 
      total: 0, // 数据总条数  
      loading: false,   
      areaData: [],  // 所在地
      props: {
        label: 'areaName',
        value: 'areaId',
        children: 'childArea'
      },
      location_one: [], //选中的所在地
      location_two: [], //选中的所在地
      // 表格的列表标题
      columns: [
        {
          title: "管理部门",
          key: "organization"
        },
        {
          title: "所在地",
          key: "address"
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
      organizationList: [],   // 组织机构列表
      isShowDialog: false, // 控制是否弹出禁止弹窗
      dialogTitle: "新建组织管理", // dialog标题
      dialogParams: {
        id: "",  // 组织机构id
        organization: "", // 组织机构名称
        areaId: "", // 所在地区域id
        address: ""   // 所在地地址
      },
      nameError: "",
      areaError: "",
      changeOnSelect: false,
      timer: null  // 定时器
    };
  },
  // watch: {
  //   filterParam: {
  //     handler: function() {
  //       this.pageNum = 1
  //       this.getOrganizationList()
  //     },
  //     deep: true
  //   }
  // },
  async created() {
    await this.getOrganizationList()
    await this.getAreaData(0)
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

    initOrganizationList() {
      this.pageNum = 1
      this.getOrganizationList()
    },
    
    // 获取组织机构列表
    getOrganizationList() {
      return new Promise(async resolve => {
        let params = this.initParams(this.filterParam)
        // console.log(params)
        params.pageNum = this.pageNum
        params.pageSize = this.pageSize
        const res = await this.$post('/fast-center/userOrganization/list',params)
        this.organizationList = res.records
        this.total = res.total
        resolve(true)
      })
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

          // obj.value = item.depart_id;

          // obj.label = item.depart_name;

          // if (item.has_child === 2) {//根据后台字段返回数值判断是否有子节点

          //   obj.children = [];

          //   obj.loading = false;

          // }

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

    handleChangeOnSelect (value) {
      console.log(value)
      this.changeOnSelect = value
    },

    // 输入管理部门名称
    handleInput() {
      //清除上一次的定时
      clearTimeout(this.timer)

      //设置延时发送请求
      this.timer = setTimeout(() =>{
        this.initOrganizationList()
      },300) 
    },

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
      this.initOrganizationList()
    },


    // 选择所在地
    handleChange(value) {
      console.log(value)
      this.filterParam.areaId = value.length === 0 ? "" : value.pop()
      this.initOrganizationList()
    },

    // 新建
    handleAdd() {
      this.isShowDialog = true
      this.dialogTitle = "新建组织管理";
      // **初始化数据**//
      for(let key in this.dialogParams) {
        this.dialogParams[key] = ""
      }
      this.location_two = []
      this.nameError = ""
      this.areaError = ""
    },

    // 选择弹窗的地址
    handleModalChange(value,selectedData) {
      this.location_two = value
      let selected = selectedData.pop()
      this.dialogParams.areaId = value.length === 0 ? "" : value.pop()
      this.dialogParams.address = value.length === 0 ? "" : selected.mergerName

    },

    // 点击编辑
    async handleEdit(row) {
      console.log(row)
      for(let key in this.dialogParams) {
        this.dialogParams[key] = ""
      }
      this.location_two = []
      this.dialogTitle = "编辑组织管理";
      this.nameError = ""
      this.areaError = ""
      this.isShowDialog = true;
      const res = await this.$get(`/fast-center/userOrganization/get?id=${row.id}`)
      console.log(res)
      this.dialogParams.id= row.id
      this.location_two = res.areaArr
      this.dialogParams.organization = res.organization
      this.dialogParams.address = res.address
      let areaId = JSON.parse(JSON.stringify(res.areaArr))
      this.dialogParams.areaId = areaId.pop()
    },

    async handleSave() {
      //***** 非空验证  *****//
      const { organization, areaId } = this.dialogParams
      this.nameError =  !organization.toString().trim() ? '请输入管理部门' : ''
      this.areaError = !areaId ? '请选择所在地' : ''
      // this.areaError = this.location_two.length <= 3 ? '请选择完整的地址' : ''
      let requestUrl = '/fast-center/userOrganization/'

      if(!this.nameError && !this.areaError) {
        console.log(this.location_two)
        if(this.location_two.length < 3) return this.$Message.warning({ background: true, content: '请选择完整的地址'});
        let params = this.initParams(this.dialogParams)  // 过滤空参数
        requestUrl = this.dialogTitle === "新建组织管理" ? `${requestUrl}add` : `${requestUrl}updateOrganization`
        this.loading = true
        try {
          const res = await this.$post(requestUrl,params)
          this.loading = false
          this.$Message.success({ background: true, content: res});
          this.isShowDialog = false
          if(this.dialogTitle === "新建组织管理") {
            this.initOrganizationList()
          }else {
            this.getOrganizationList()  // 重 新加载数据
          }
        }catch(err) {
          this.loading = false
        }
      }
    },

    // 改变页码
    handlePageNum(val) {
      this.pageNum = val
      this.getOrganizationList()
    },

    // 改变页容量
    handlePageSize(val) {
      this.pageSize = val
      this.initOrganizationList()
    }
  }
};
</script>

<style lang="less" scoped>
.organization-manage {
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
        .left-wrap {
          width: 90%;
          display: inline-block;
          .input-wrap {
            display: inline-block;
            margin-right: 20px;
            > .desc {
              font-weight: bold;
              margin-bottom: 6px;
            }
          }
        }
        .right-wrap {
          display: inline-block;
        }
      }
    }
    //  数据筛选  end

    // 组织管理列表  start
    .department-list {
      margin-top: 48px;
      .content {
        .operation-item {
          &:first-child {
            margin-right: 40px;
          }
        }
      }
    }
    // 组织管理列表  end
  }
}
</style>

<style lang="less" scoped>
.data-filter {
  .left-wrap {
    .input-wrap {
      width: 30%;
    }
  }
}
/deep/.ivu-modal-wrap {
    height: 500px;
    .ivu-modal-content {
    .ivu-input,
    .ivu-input-wrapper {
      width: 100% !important;
    }

    .ivu-cascader {
      /deep/.ivu-input-wrapper {
        width: 100% !important;
      }
    }
  }
}

</style>