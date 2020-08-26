<template>
  <div class="goods-Inspec">
    <div class="main">
      <div class="con-tree">
        <Tree :data="baseData" :render="renderContent" class="demo-tree-render"></Tree>
      </div>
      <div class="con-button">
        <my-button @click.native="add(true)" btnText="新增一级"></my-button>
      </div>
      
    </div>

    <!-- 新建的对话框 -->
    <Modal
      title="新建商品类目"
      v-model="inserttreeItem"
      width="500"
      class-name="vertical-center-modal"
      class="modal"
    >
      <Form :model="insertParams" label-position="top">
        <FormItem label="名称:" class="input-wrap">
          <Input v-model="insertParams.name" clearable placeholder="请输入商品名称" />
        </FormItem>
        <FormItem label="是否虚目录:" class="input-wrap">
          <Select v-model="insertParams.isDetection" clearable>
            <Option
              v-for="item in statusList"
              :value="item.value"
              :key="item.value"
            >{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="上传图片:" class="input-wrap">
          <div class="demo-upload-list" v-for="(item,index) in insertParams.addImgList" :key="index">
            <template>
              <img :src="item" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handlePreview(item)"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
              </div>
            </template>
            <!-- <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template> -->
          </div>
          <Upload
            ref="upload"
            :data="imgData"
            :show-upload-list="false"
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
        <my-button class="saveBtn" btnText="保 存" @click.native="addCategory"></my-button>
        <my-button
          btnText="取 消"
          bg-color="#D9534F"
          bd-color="#D43F3A"
          @click.native="inserttreeItem=false"
        ></my-button>
      </div>
    </Modal>

    <!-- 编辑的对话框 -->
    <Modal
      title="编辑商品类目"
      v-model="modifyTreeItem"
      width="500"
      class-name="vertical-center-modal"
      class="modal"
    >
      <Form :model="modifyParams" label-position="top">
        <FormItem label="名称:" class="input-wrap">
          <Input v-model="modifyParams.name" clearable placeholder="请输入商品名称" />
        </FormItem>
        <FormItem label="是否虚目录:" class="input-wrap">
          <Select v-model="modifyParams.isDetection" clearable>
            <Option
              v-for="item in statusList"
              :value="item.value"
              :key="item.value"
            >{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="上传图片:" class="input-wrap">
          <div class="demo-upload-list" v-for="(item,index) in modifyParams.imageList" :key="index">
            <template>
              <img :src="item.image" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handlePreview(item)"></Icon>
                <Icon type="ios-trash-outline" @click.native="removeModifyImg(item)"></Icon>
              </div>
            </template>
            <!-- <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template> -->
          </div>
          <Upload
            ref="upload"
            :data="imgData"
            :show-upload-list="false"
            :on-success="addModifyImg"
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
        <my-button class="saveBtn" btnText="保 存" @click.native="modifyCategory"></my-button>
        <my-button
          btnText="取 消"
          bg-color="#D9534F"
          bd-color="#D43F3A"
          @click.native="modifyTreeItem=false"
        ></my-button>
      </div>
    </Modal>
  </div>
</template>
<script>
import MyButton from "components/myButton/MyButton.vue";
export default {
  components: {
    MyButton
  },
  data() {
    return {
      buttonProps: {
        type: "default",
        size: "small"
      },
      baseData: [], // 数结构数据
      inserttreeItem: false,
      statusList: [
        {
          value: 0,
          label: '是'
        },
        {
          value: 1,
          label: '否'
        }
      ],
      insertParams: {
        name: '',
        addImgList: [],
        isDetection: ''
      },
      defaultList: [
        {
          url:
            "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587624709556&di=897e964e459192cc66c988c150c5d8fc&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201710%2F21%2F20171021225250_XUuBJ.jpeg"
        },
        {
          url:
            "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587624709556&di=897e964e459192cc66c988c150c5d8fc&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201710%2F21%2F20171021225250_XUuBJ.jpeg"
        }
      ],
      // 上传图片附带的参数
      imgData: {
        imgSystemId: "goodsinspex",
        imgSpecificUniqueValue: "goodsinspex"
      },
      previewImgDialog: false, // 控制是否弹出预览图片弹窗
      previewImg: "", // 预览的图片
      parData: [],
      modifyTreeItem: false,
      modifyParams: {
        name: '',
        imageList: [],
        isDetection: ''
      },
      delImgIds: [],
      addImgList: []
    };
  },
  created() {
    this.gteGoodTree();
  },
  methods: {
    // 获取树结构数据
    gteGoodTree() {
      this.$get("/fast-center/category/treeStructure")
        .then(result => {
          console.log(result);
          this.baseData = result.map(item => {
            return this.generateRoutes(item);
          });
        })
        .catch(err => {});
    },
    // 新增一级商品类别

    //深度便树结构
    generateRoutes(item) {
      let obj = {};
      obj.title = item.label;
      obj.id = item.value;
      obj.expand = false;
      obj.parentId = item.parentId;
      // obj.grade = item.grade;
      obj.children = item.children.map(item => {
        return this.generateRoutes(item);
      });
      return obj;
    },
    renderContent(h, { root, node, data }) {
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            width: "100%"
          }
        },
        [
          h(
            "span", 
            {
              style: {
                fontSize: '16px'
              }
            },
            [
              h("span", data.title)
            ]
          ),
          h(
            "span",
            {
              style: {
                display: "inline-block",
                float: "right",
                marginRight: "32px"
              }
            },
            [
              // 编辑
              h("Button", {
                props: Object.assign({}, this.buttonProps, {
                  icon: "ios-brush-outline"
                }),
                style: {
                  marginRight: "10px",
                  borderRadius: "50%",
                  width: "1.5rem",
                  lineHeight: "0",
                  padding: "0",
                  height: "1.5rem"
                },
                on: {
                  click: () => {
                    this.edit(data);
                  }
                }
              }),
              // 增加
              h("Button", {
                props: Object.assign({}, this.buttonProps, {
                  icon: "ios-add"
                }),
                style: {
                  marginRight: "2px",
                  borderRadius: "50%",
                  width: "1.5rem",
                  lineHeight: "0",
                  padding: "0",
                  height: "1.5rem"
                },
                on: {
                  click: () => {
                    this.add(false, data);
                  }
                }
              })
            ]
          )
        ]
      );
    },
    edit(data) {
      this.parData = data
      this.$get('/fast-center/category/detail/' + data.id).then(res => {
        this.modifyParams = {
          id: res.id,
          name: res.name,
          isDetection: res.isDetection,
          imageList: res.imageList
        }
        this.modifyTreeItem = true
      })
    },
    add(is_parent, data) {
      // console.log(node)
      console.log(data)
      this.parData = data
      this.is_parent = is_parent
      this.insertParams.parentId = is_parent ? 0 : data.id  
      // JSON.stringify(JSON.parentId())
      this.inserttreeItem = true
    },

    // 预览图片
    handlePreview(url) {
      this.previewImg = url;
      this.previewImgDialog = true;
    },
    handleRemove(file) {
      console.log(file)
      let idx = this.insertParams.addImgList.findIndex(item => item === file)
      this.insertParams.addImgList.splice(idx, 1)
      // const fileList = this.$refs.upload.fileList;
      // console.log(fileList)
      // this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },

    // 图品上传成功触发
    handleSuccess(res, file) {
      let url = res.data.imgUrl;
      this.insertParams.addImgList.push(url);
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
      const check = this.insertParams.addImgList.length < 5;
      if (!check) {
        this.$Notice.warning({
          title: "Up to five pictures can be uploaded."
        });
      }
      return check;
    },
    // 新建商品类别
    addCategory() {
      let _params = this.insertParams
      if (!_params.name) {
        this.$Message.error('检验商品类目不能为空')
        return false
      }
      if (!String(_params.isDetection)) {
        this.$Message.error('请选择是否虚目录')
        return false
      }
      if (!_params.addImgList.length > 0) {
        this.$Message.error('至少要上传一张图片')
        return false
      }
      this.$post('/fast-center/category/add', _params).then(res => {
        console.log(res)
        this.$Message.success('新建成功')
        let info = {
          title: res.name,
          id: res.id,
          parentId: res.parentId,
          children: [],
          imageList: res.imageList
        }
        if (this.is_parent) {
          this.baseData.push(info)
        } else {
          let _chilren = this.parData.children || []
          _chilren.push(info)
          this.$set(this.parData, 'children', _chilren)
        }
        
        this.inserttreeItem = false
        this.insertParams = {
          name: '',
          addImgList: [],
          isDetection: ''
        }
      })
    },
    // 编辑时删除图片
    removeModifyImg(file) {
      this.modifyParams.imageList.forEach((item, index) => {
        if (item === file) {
          this.modifyParams.imageList.splice(index, 1)
          if (item.imageId) {
            this.delImgIds.push(item.imageId)
          }
          
        }
      })
      let idx = this.addImgList.findIndex(aItem => aItem === file)
      this.addImgList.splice(idx, 1)
    },
    // 编辑时新增图片
    addModifyImg(res) {
      let url = res.data.imgUrl
      this.addImgList.push(url)
      this.modifyParams.imageList.push(
        {
          image: url
        }
      )
    },
    // 编辑商品列表
    modifyCategory() {
      let _params = {
        id: this.modifyParams.id,
        name: this.modifyParams.name,
        isDetection: this.modifyParams.isDetection
      }
      if (this.delImgIds.length > 0) {
        _params.delImgIds = this.delImgIds
      }
      if (this.addImgList.length > 0) {
        _params.addImgList = this.addImgList
      }
      this.$post('/fast-center/category/modify', _params).then(res => {
        console.log(res)
        this.$Message.success('编辑成功')
        let _name = res.name
        // let _chilren = this.parData.children || []
        // _chilren.push(info)
        this.$set(this.parData, 'title', _name)
        this.modifyTreeItem = false
        this.modifyParams = {
          name: '',
          addImgList: [],
          isDetection: ''
        }
        this.delImgIds = []
      })
    }
  }
};
</script>

<style lang="less">
.goods-Inspec {
  .main {
    height: calc(100vh - 175px);
    background: @color-white;
    padding: 28px 25px 28px;
    // margin-bottom: 30px;
    // overflow: auto;
    display: flex;
    .con-tree {
      width: 80%;
      overflow-y: auto;
    }
    .con-button {
      flex: 1;
      text-align: right;
    }
  }
}
.demo-tree-render .ivu-tree-title {
  width: 90%;
}
</style>
