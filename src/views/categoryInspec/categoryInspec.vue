<template>
  <div class="category-inspec">
    <div class="main">
      <!-- 数据筛选  start -->
      <div class="data-filter">
        <div class="title">数据筛选</div>
        <div class="content">
          <div class="left-wrap">
            <div class="input-wrap">
              <div class="desc">类别名:</div>
              <Input v-model="filterParam.className" clearable placeholder="请输入类别名" />
            </div>
            <div class="input-wrap">
              <div class="desc">检验日期:</div>
              <DatePicker type="datetimerange" v-model="time" placeholder="请选择日期" format="yyyy-MM-dd HH:mm:ss" @on-change="handleChange"></DatePicker>
            </div>
            <!-- 筛选按钮 -->
            <my-button
              btn-text="筛 选"
              bg-color="#F3F3F3"
              bd-color="#ccc"
              text-color="#888"
              class="filterBtn"
            ></my-button>
          </div>
          <div class="right-wrap">
            <!-- 新建按钮 -->
            <my-button class="addBtn" @click.native="isShowDialog=true"></my-button>
          </div>
        </div>
      </div>
      <!-- 数据筛选  end -->

      <!-- 检验列表  start -->
      <div class="check-list">
        <div class="title">检验列表</div>
        <div class="content">
          <Table :columns="columns" :data="inspectList">
            <template slot="operation">
              <!-- <Button type="text" @click="handleEdit(index)">编辑</Button> -->
              <span class="operation-item hoverPointer" @click="handleEdit">编辑</span>
            </template>
          </Table>
        </div>
      </div>
      <!-- 检验列表  end -->
    </div>

    <!-- 新建的对话框 -->
    <Modal
      :title="dialogTitle"
      v-model="isShowDialog"
      width="500"
      class-name="vertical-center-modal"
      class="modal"
    >
      <Form :model="dialogParams" label-position="top">
        <FormItem label="类别名称:" class="input-wrap">
          <Input v-model="dialogParams.name" clearable placeholder="请输入类别名称" />
        </FormItem>
        <FormItem class="input-wrap" label='是否虚目录：'>
          <RadioGroup v-model="dialogParams.animal">
            <Radio label="是（可检测类别）"></Radio>
            <Radio label="否（非检测类别）"></Radio>
            <!-- <Radio label="印度黑羚"></Radio> -->
          </RadioGroup>
        </FormItem>
        <FormItem label="上传多张图片:" class="input-wrap">
          <div class="demo-upload-list" v-for="(item,index) in uploadList" :key="index">
            <template v-if="item.status === 'finished'">
              <img :src="item.url" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handlePreview(item.url)"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            ref="upload"
            :data="imgData"
            :show-upload-list="false"
            :default-file-list="defaultList"
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']"
            :max-size="2048"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            multiple
            type="drag"
            action="https://zs.cntracechain.com/imageService/image/add"
            style="display: inline-block;width:80px;"
          >
            <div class="upLoad-wrap">
              <Icon type="ios-camera" size="30"></Icon>
            </div>
          </Upload>
          <Modal title="图片预览" v-model="previewImgDialog">
            <img :src="previewImg" v-if="previewImgDialog" style="width: 100%" />
            <div slot="footer" class="footer">
              <my-button
                btnText="关 闭"
                bg-color="#F3F3F3"
                bd-color="#ccc"
                text-color="#888"
                @click.native="previewImgDialog=false"
              ></my-button>
            </div>
          </Modal>
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <my-button class="saveBtn" btnText="保 存"></my-button>
        <my-button
          btnText="取 消"
          bg-color="#D9534F"
          bd-color="#D43F3A"
          @click.native="isShowDialog=false"
        ></my-button>
      </div>
    </Modal>

    <!-- 分页  start -->
    <pagination :total="total" :current.sync='pageNum' :page-size='pageSize' @change-pageNum="handlePageNum" @change-pageSize="handlePageSize"></pagination>
    <!-- 分页 end -->
  </div>
</template>

<script>
import MyButton from "components/myButton/MyButton.vue";
import Pagination from "components/pagination/Pagination.vue";
export default {
  name: "category-Inspec",
  components: {
    MyButton,
    Pagination
  },
  data() {
    return {
      // 筛选的参数
      filterParam: {
        className: "",
        startTime: '',
        endTime: ''
      },
      time: [],
      pageNum: 1, // 页数
      pageSize: 10,
      // 表格的列表标题
      columns: [
        {
          title: "类别名称",
          key: "classification"
        },
        {
          title: "最后修改时间",
          key: "createTime"
        },
        {
          title: "操作",
          slot: "operation",
          width: 200
        }
      ],
      // 表格数据
      inspectList: [
        {
          category: "蔬菜类",
          time: "2019/09/09 14:12"
        },
        {
          category: "蔬菜类",
          time: "2019/09/09 14:12"
        },
        {
          category: "蔬菜类",
          time: "2019/09/09 14:12"
        },
        {
          category: "蔬菜类",
          time: "2019/09/09 14:12"
        }
      ],
      isShowDialog: false, // 控制是否弹出禁止弹窗
      dialogTitle: "新建类别",
      // 新建对话窗的参数
      dialogParams: {
        name: "", // 姓名
        animal: '',
        goodUrlArr: [] // 类别图片
      },
      defaultList: [],
      // 上传图片附带的参数
      imgData: {
        imgSystemId: "shabi",
        imgSpecificUniqueValue: "lowB"
      },
      previewImgDialog: false, // 控制是否弹出预览图片弹窗
      uploadList: [],
      previewImg: "", // 预览的图片
      total: 20 // 数据总条数
    };
  },
  created() {
    this.getCategory()

  },
  mounted() {
    this.uploadList = this.$refs.upload.fileList;
    console.log(this.uploadList);

  },
  methods: {
    // 获取检测产别列表
    getCategory() {
      let _params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        classificationType: 0,
        classification: this.filterParam.className,
        startTime: this.filterParam.startTime,
        endTime: this.filterParam.endTime
      }
      this.$get('/detectionClassification/classificationPage').then((res) => {
        console.log(res)
        this.inspectList = res.pageList
      }).catch((err) => {
        
      });
      // console.log(res)

      // this.inspectList = res.data.pageList
    },
    // 选择日期
    handleChange(date) {
      // console.log(date);
      this.filterParam.startTime = date[0]
      this.filterParam.endTime = date[1]
    },

    // 点击编辑
    handleEdit(index) {
      // console.log(index);
      this.dialogTitle = "编辑类别";
      this.isShowDialog = true;
    },

    // 改变页码(页数)
    handlePageNum(val) {
      console.log(val);
      this.pageNum = val
    },

    // 改变页容量(条数)
    handlePageSize(val) {
      console.log(val);
      this.pageSize = val
    },

    // 预览图片
    handlePreview(url) {
      this.previewImg = url;
      this.previewImgDialog = true;
    },
    handleRemove(file) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },

    // 图品上传成功触发
    handleSuccess(res, file) {
      let url = res.data.imgUrl;
      this.dialogParams.goodUrlArr.push({
        images: url
      });
      file.url = url;
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: "The file format is incorrect",
        desc:
          "File format of " +
          file.name +
          " is incorrect, please select jpg or png."
      });
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "Exceeding file size limit",
        desc: "File  " + file.name + " is too large, no more than 2M."
      });
    },
    handleBeforeUpload() {
      const check = this.uploadList.length < 5;
      if (!check) {
        this.$Notice.warning({
          title: "Up to five pictures can be uploaded."
        });
      }
      return check;
    },
    // 新建类别
    insertClassification() {
      let _insert = {
        classification: this.dialogParams.name,
        detectionImages: this.dialogParams.goodUrlArr
      }
      this.$post('/detectionClassification/classificationInsert', _insert).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.data.message)
        } else {
          this.$Message.error(res.data.message)
        }
      })
    },
    // 获取某个类别的详情信息
    classificationInfo(id) {
      this.$get('/detectionClassification/classificationInfo/' + id).then(res => {
        if(res.code === 200) {

        } else {
          this.$Message.error(res.message)
        }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.category-inspec {
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

    // 检验列表  start
    .check-list {
      margin-top: 48px;
    }
    // 检验列表  end
  }
}
</style>

<style lang="less" scoped>
/deep/.ivu-input,
/deep/.ivu-input-wrapper,
/deep/.ivu-select-single /deep/.ivu-select-selection,
/deep/.ivu-date-picker {
  width: 100% !important;
}
/deep/.ivu-modal-wrap {
  height: 500px;
}

/deep/.ivu-modal-content {
  /deep/.ivu-modal-body {
    padding: 20px 32px!important;
  }
}
</style>