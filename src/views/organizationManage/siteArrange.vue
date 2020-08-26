<template>
  <div class="site-arrange">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="input-wrap">
            <div class="desc">管理点名称:</div>
            <Input v-model="filterParams.organization" @on-keyup="handleInput" @on-clear="getPointlist()"  clearable placeholder="请输入" />
          </div>
          <div class="input-wrap">
            <div class="desc">所在地:</div>
            <Cascader :data="areaData" v-model="location" :load-data="loadData" 
              @on-change="handleChange"></Cascader>
          </div>
          <!-- 筛选按钮 -->
          <!-- <my-button btn-text="筛 选" bg-color="#F3F3F3" bd-color="#ccc" text-color="#888" class="filterBtn"></my-button> -->
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 管理点  start -->
      <div class="site-wrap">
        <div class="title">
          管理点
          <Checkbox class="checkBox" :value="checkAll" @click.native="handleCheckAll">全选</Checkbox>
        </div>
        <div class="site-list">
          <CheckboxGroup v-model="labArr" @on-change="checkAllGroupChange">
            <Checkbox :label="item.implementOrganizationId" v-for="item in pointList" 
            :key="item.implementOrganizationId" class="checkbox-item" >{{item.labName}}</Checkbox>
          </CheckboxGroup>
        </div>
      </div>
      <!-- 管理点  end -->


      <!-- 保存 按钮 -->
      <div class="btn-wrap">
        <my-button btn-text="保 存" @click.native="handleSave" :loading="loading"></my-button>
      </div>
    </div>
  </div>
</template>

<script>
import MyButton from "components/myButton/MyButton.vue";

export default {
  name: "site-arrange",
  components: {
    MyButton
  },
  data() {
    return {
       filterParams: {
        organizationId: "", // 组织机构id
        organization: "", // 		管理点名称
        areaId: ""
      }, // 地址区域id 
      location: [], //选中的所在地
      pointList: [],
      areaData: [],  // 所在地
      checkAll: false, //是否全选
      labArr: [], // 选中的复选框
      timer: null,
      loading: false
    };
  },
  async created() {
    const { organizationId } = this.$route.params
    if(organizationId) {
      this.filterParams.organizationId = organizationId
      await this.getPointlist()
      await this.getAreaData(0)
    }else {
      this.$router.push({name: 'organization-manage'})
    }
  },

  watch: {
    // filterParams: {
    //   handler: function() {
    //     this.getPointlist()
    //   },
    //   deep: true
    // }
  },

  mounted() {
    let _this = this
    window.onbeforeunload = e => {
      if(_this.$route.fullPath == "/siteArrange") {  // 这样就可以在当个页面应用了
        e = e || window.event
        if (e) {
          e.returnValue = '您是否确认离开此页面-您输入的数据可能不会被保存';
        }
        return '您是否确认离开此页面-您输入的数据可能不会被保存';
      }else {
        window.onbeforeunload = null
      }
    };
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

    // 获取组织机构列表
    getPointlist() {
      return new Promise(async resolve => {
        let params = this.initParams(this.filterParams)
        const res = await this.$post('/fast-center/userOrganization/point/list',params)
        console.log(res)
        this.pointList = res
        this.labArr = res.filter(v => v.deploy === 1).map(v => v.implementOrganizationId)
        console.log(this.labArr)
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
      },100)
    },

    handleInput() {
      clearTimeout(this.timer)
      this.timer = setTimeout(async () =>{
         this.getPointlist()
      },300) 
    },

    // 选择所在地
    handleChange(value) {
      this.filterParams.areaId = value.length === 0 ? "" : value.pop()
      this.getPointlist()
    },

    // 全选
    handleCheckAll() {
      this.checkAll = !this.checkAll;
      if (this.checkAll) {
        this.labArr = this.pointList.map(v => v.implementOrganizationId);
      } else {
        this.labArr = [];
      }
    },

    // 选择单个复选框
    checkAllGroupChange(data) {
      // console.log(data);
      if (data.length === this.pointList.length) {
        this.checkAll = true;
      } else {
        this.checkAll = false;
      }
    },

    // 点击保存
    async handleSave() {
      console.log(this.labArr) 
      let params = {
        organizationId: this.filterParams.organizationId,
        labArr: this.labArr
      }
      this.loading = true
      try{
        const res = await this.$post('/fast-center/userOrganization/point/set',params)
        this.loading = false
        this.$Message.success({ background: true, content: res})
        this.$router.push({name: 'organization-manage'})
      }catch(err) {
        this.loading = false
      }
    }
  }
};
</script>

<style lang="less" scoped>
.site-arrange {
  height: 100%;
  position: relative;
  .main {
    background: @color-white;
    padding: 28px 25px 40px;
    height: 100%;
    // margin-bottom: 30px;
    .title {
      font-size: @fontsize-large;
      font-weight: bold;
      margin-bottom: 34px;
      letter-spacing: 1px;
    }

    //  数据筛选  start
    .data-filter {
      margin-bottom: 56px;
      .content {
        width: 100%;
        .input-wrap {
          width: 30%;
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

    // 管理点 start
    .site-wrap {
      .title {
        .checkBox {
          font-size: @fontsize-small-s;
          font-weight: normal;
          margin-left: 50px;
        }
      }
      .site-list {
        .checkbox-item {
          width: 22%;
          font-size: @fontsize-small-s;
          padding-left: 20px;
          margin-bottom: 34px;
        }
      }
    }
    // 管理点  end

    .btn-wrap {
      text-align: center;
      margin-top: 150px;
      // position: absolute;
      // bottom: 20px;
      // left: 50%;
      // transform: translateX(-50%);
    }
  }
}
</style>

<style lang="less" scoped>
/deep/.ivu-checkbox {
  margin-right: 5px;
}
</style>