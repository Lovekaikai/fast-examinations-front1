<template>
  <div class="add-standard">
    <div class="main">
      <Form label-position="top">
        <!-- 配置商品/类别  start -->
        <div class="category-wrap">
          <div v-if="this.routerParam.type === 'add'">
            <div class="title" style="font-weight: bold;margin-bottom: 8px;">配置商品/类别:</div>
            <el-cascader  v-model="value" :options="options" :props="props"
              clearable  @change="handleChange" size="small"></el-cascader>
          </div>
          <div v-else>
            <span style="font-weight: bold;font-size:16px">当前配置商品/类别：</span>
            <span style="margin-left:20px;letter-spacing:3px">{{categoryName}}</span>
          </div>
        </div>
        <div class="addCondition-wrap">
          <div class="left-wrap">
            <span>添加前提条件:</span>
            <div class="checkbox-item">
              <input type="checkbox" :checked="!isChecked" @change="handleChoose('no')" />否
            </div>
            <div class="checkbox-item">
              <input type="checkbox" :checked="isChecked" @change="handleChoose('yes')" />是
            </div>
          </div>
          <span class="operation-item hoverPointer" v-show="isChecked" @click="isShowDialog=true" >条件设置</span>

          <my-button btn-text="新增检测项目" class="addBtn" @click.native="handleAddInspect"></my-button>
        </div>

        <!-- 下部分  start -->
        <div class="down-wrap" v-for="(inpectItem,inpectIndex) in inspectItemParams" :key="inpectIndex">
          <div class="plan-wrap">
            <FormItem label="检验项目:" prop="plan" class="input-wrap">
               <div v-if="inpectItem.inspectName" style="padding-left:20px">
                <span style="font-size:18px;font-weight:bold;color:#808080;margin-right:80px">{{inpectItem.inspectName}}</span>
                <span style="font-size:13px;color:#0080EE;text-decoration:underline;cursor:pointer;" @click="handleEditItemName(inpectIndex)">修改</span>
              </div>
              <Select v-model="inpectItem.inspect" class="select" v-else>
                <Option  v-for="value in itemList" :value="value.id" :label="value.item" :key="value.id" >
                  <span>{{value.item}}</span>
                  <span style="float:right;color:#ccc">{{value.itemCode}}</span>
                </Option>
              </Select>
            </FormItem>
            <Icon class="remove hoverPointer" type="md-remove-circle" v-show="inpectIndex!=0" @click="handleRemove(inpectIndex)" />
          </div>

          <div class="down-content">
            <div class="inspect-item" v-for="(conditionItem,conditionIndex) in inpectItem.conditionList" :key="conditionIndex" >
              <div v-if="conditionItem.condition" style="font-size:14px">
                <span style="font-weight:bold;margin-right:30px">前提条件:</span>
                <span
                  style="font-weight:bold;letter-spacing:2px;color:#1CC09F;text-decoration:underline;"
                >{{conditionItem.condition}}</span>
              </div>
              <div class="assist-item" v-for="(assistItem,assistIndex) in conditionItem.assist" :key="assistIndex" >
                <FormItem label="限量值:" class="input-wrap">
                  <Input v-model="assistItem.limit" clearable size="small" 
                    placeholder="请输入" @on-blur="handleLimit(assistItem,conditionItem.assist)" />
                </FormItem>
                <FormItem label="参数单位:" class="input-wrap">
                  <Select class="select" v-model="assistItem.measurement"
                    @on-change="handleSelectMeasurement(assistItem,conditionItem.assist)">
                    <Option v-for="item in assistItem.unitList" :value="item.id" :label="item.measurement" :key="item.value" >
                      <span>{{item.measurement}}</span>
                      <span style="float:right;color:#ccc">{{item.description}}</span>
                    </Option>
                  </Select>
                </FormItem>
                <FormItem label="公式选择:" class="input-wrap">
                  <Select class="select" v-model="assistItem.formula"
                    @on-change="handleSelectFormula(assistItem,conditionItem.assist)">
                    <Option v-for="item in assistItem.formulaList" :value="item.id"
                      :label="item.conditionCode" :key="item.id" >
                      <span>{{item.conditionCode}}</span>
                      <span style="float:right;color:#ccc">{{item.description}}</span>
                    </Option>
                  </Select>
                </FormItem>
                <FormItem label="  " class="input-wrap">
                  <Icon type="ios-add-circle" class="operation hoverPointer"
                    @click="handleAddAssist(inpectIndex,conditionIndex,assistItem,assistIndex)"
                    v-if="conditionItem.assist.length === 1"
                    v-show="assistItem.formula == '1' || assistItem.formula == '2' || assistItem.formula == '3' || assistItem.formula == '4'"/>
                  <Icon type="ios-remove-circle" class="operation hoverPointer"
                    @click="handleRemoveAssist(inpectIndex,conditionIndex,assistIndex)"
                    v-show="assistIndex!=0" />
                </FormItem>
              </div>
            </div>

            <div class="methods-wrap">
              <div v-if="inpectItem.methodsDesc">
                <div style="margin-right:60px;display:inline-block"><span style="font-weight: bold; margin-right: 20px;">检验方法：</span><span style="font-size:13px">{{inpectItem.methodsDesc}}</span></div>
                <span style="font-size:13px;color:#0080EE;text-decoration:underline;cursor:pointer;" @click="handleEditMethod(inpectIndex)">修改</span>
              </div>
              <FormItem label="检验方法:" prop="plan" class="input-wrap" style="width:35%;margin-top:60px" v-else>
                <Select v-model="inpectItem.methods" multiple class="select" placeholder="可多选" filterable>
                  <Option v-for="value in methodsList" :value="value.id" :key="value.id" >{{value.detectionMethod}}</Option>
                </Select>
              </FormItem>
            </div>
          </div>
        </div>
        <!-- 下部分  end -->

        <!-- 底部按钮 -->
        <FormItem class="footer">
          <my-button btn-text="保存" @click.native="handleSave" class="saveBtn"></my-button>
          <my-button btn-text="取消" bg-color="#D9534F" bd-color="#D43F3A" @click.native="jumpToCategory()"></my-button>
        </FormItem>
      </Form>

      <!-- 条件设置对话框 -->
      <Modal title="条件设置" v-model="isShowDialog" width="1000" class-name="vertical-center-modal" class="modal" >
        <Form label-position="top" class="modal-form">
          <FormItem label="检验项目:" prop="plan" class="input-wrap">
            <Select v-model="conditionParasm.inspectItem" clearable style="width:409px" filterable>
              <Option v-for="value in itemList" :value="value.item" :label="value.item" :key="value.id" >
                <span>{{value.item}}</span>
                <span style="float:right;color:#ccc">{{value.itemCode}}</span>
              </Option>
            </Select>
            <span class="operation-item hoverPointer" @click="handleAddCondition">新增条件</span>
          </FormItem>

          <!-- 条件内容 -->
          <div class="condition-item" v-for="(item,index) in conditionParasm.condition" :key="index" >
            <div class="condition-title">
              条件 {{index+1}}:
              <Icon class="remove hoverPointer" type="md-remove-circle" v-show="index!=0" @click="dialogRemove(index)" />
            </div>
            <div class="assist-item" v-for="(assistItem,assistIndex) in item.assist" :key="assistIndex" >
              <FormItem label="限量值:" class="input-wrap">
                <Input v-model="assistItem.limit" clearable size="small"
                  placeholder="请输入" @on-blur="handleModalLimit(assistItem,item.assist,index)" />
              </FormItem>
              <FormItem label="参数单位:" class="input-wrap">
                <Select class="select" v-model="assistItem.measurement" @on-change="handleModalSelectMeasurement(assistItem,item.assist)" >
                  <Option v-for="item in assistItem.unitList" :value="item.measurement" :label="item.measurement" :key="item.id" >
                    <span>{{item.measurement}}</span>
                    <span style="float:right;color:#ccc">{{item.description}}</span>
                  </Option>
                </Select>
              </FormItem>
              <FormItem label="公式选择:" class="input-wrap">
                <Select class="select" v-model="assistItem.formula" @on-change="handleModalSelectFormula(assistItem,item.assist,index)" >
                  <Option v-for="item in assistItem.formulaList" :value="item.conditionCode" :label="item.conditionCode" :key="item.id" >
                    <span>{{item.conditionCode}}</span>
                    <span style="float:right;color:#ccc">{{item.description}}</span>
                  </Option>
                </Select>
              </FormItem>
              <FormItem label="  " class="operation-box">
                <Icon type="ios-add-circle" class="operation hoverPointer" @click="dialogAddAssist(index,assistItem,assistIndex)"
                  v-if="item.assist.length === 1"
                  v-show="assistItem.formula == '>' || assistItem.formula == '≥' || assistItem.formula == '<' || assistItem.formula == '≤'" />
                <Icon type="ios-remove-circle" class="operation hoverPointer" @click="dialogRemoveAssist(index,assistIndex)" v-show="assistIndex!=0" />
              </FormItem>
            </div>
          </div>
        </Form>
        <div slot="footer" style="text-align:center">
          <my-button class="saveBtn" btnText="保 存" @click.native="handleModalSave" style="margin-right:40px" :loading="loading"></my-button>
          <my-button btn-text="取 消" bg-color="#D9534F" bd-color="#D43F3A" @click.native="isShowDialog=false"></my-button>
        </div>
      </Modal>
    </div>
  </div>
</template>
<script>
import MyButton from "components/myButton/MyButton.vue";
export default {
  name: "add-category",
  components: {
    MyButton
  },
  data() {
    return {
      props: { multiple: true },
      options: [],  // 类别
      value: [],
      isChecked: false, // 控制是否勾选前提条件  默认否
      // 检验项目列表
      itemList: [],

      // 参数单位
      measurementList: [],

      // 公式选择
      conditionList: [],

      methodsList: [], // 检测方法
      classificationId: [], // 存放分类id
      categoryName: "", // 存放编辑时返回的分类名
      // 新增检测项目参数
      inspectItemParams: [
        {
          inspect: "", // 检验项目
          conditionList: [
            // 选择条件
            {
              condition: "",
              preConditionEnums: [],
              assist: [
                {
                  limit: "", // 限量值
                  measurement: "", // 参数单位
                  formula: "", // 公式选择
                  formulaList: [], // 公式
                  unitList: []
                }
              ]
            }
          ],
          methods: []
        }
      ],
      configureCondition: [],
      assistList: [], // 存放条件的二维数组
      result: [], // 存放拼接好的条件

      // 条件设置 --- 参数
      conditionParasm: {
        inspectItem: "", // 检验项目
        condition: [
          {
            assist: [
              {
                limit: "", // 限量值
                formula: "", // 公式选择
                measurement: "",
                formulaList: [], // 公式
                unitList: [] // 公式
              }
            ]
          }
        ]
      },
      isShowDialog: false, // 是否弹条件设置对话窗
      routerParam: {}, // 存放路径
      compareObj : {
        formula: ""
      },  // 用来比较
      compareArr: [],  // 数组
      loading: false  // 控制弹窗的保存按钮
    };
  },
  async created() {
    let { paramObj } = this.$route.params
     if(paramObj) {
      paramObj = JSON.parse(paramObj)
      console.log(paramObj,"paramObj")
      this.routerParam = paramObj
    }else {
      return this.$router.push({name: 'standard-Inspec'})
    }
    // this.routerParam = this.$route.params;
    if(this.routerParam.type === 'add') {
      await  this.getTreeStructure();
    }
    await  this.getCondition();
    await this.getMeasurement();
    await  this.getMethodsList();
    await  this.getDetectionItem();

    if (this.routerParam.type === "edit") {
      console.log("编辑页面");
      this.classificationId = [this.routerParam.classifyId];
      let param = {
        classifyId: this.routerParam.classifyId,
        standardId: this.routerParam.standardId
      };
      // 请求编辑品类数据需要
      const res = await this.$get("/fast-center/detectionStandard/editClassify",param,true);
      console.log(res);
      let insepec = []; // 这个是存放编辑获取的数据
      let preCondition = []; // 这个是存放编辑返回的前提条件
      this.categoryName = res.categoryName;
      res.standardItems.map((sitem,sindex) => {
        let methods = sitem.methodIds.map(v => v.id)
        let methodsDesc = sitem.methodIds.map(v => v.name).join('  、')
        let obj1 = {
          inspect: sitem.standardItem.itemId,
          inspectName: sitem.standardItem.itemName,// 增加了检验项目名
          conditionList: [],
          methods,
          methodsDesc  // 增加了检验方法名
        };
        sitem.conclusionEnums.map((citem, i) => {
          let obj2 = {
            condition: citem.preConditionId,
            assist: []
          };
          citem.ConclusionEnum.map(aitem => {
            obj2.assist.push({
              limit: aitem.literal,
              measurement: aitem.measurementId,
              formula: aitem.conditionId,
              formulaList: this.conditionList,
              unitList: this.measurementList
            });
          });
          obj1.conditionList.push(obj2);
        });
        insepec.push(obj1);
      });

      this.inspectItemParams = insepec;
      console.log(this.inspectItemParams,"this.inspectItemParams")

      let standardItemId = res.standardItems[0].standardItem.id;
      preCondition = await this.$get(`/fast-center/detectionStandard/getPreCondition?standardItemId=${standardItemId}`);
      console.log(preCondition, "preCondition");
      if (preCondition.conditionList.length === 0) {
        // 则代表没有设置前提条件
        this.isChecked = false;
      } else {
        this.isChecked = true;
        let condition = [];

        this.inspectItemParams.forEach((sitem, sindex) => {
          sitem.conditionList.forEach((citem, cindex) => {
            preCondition.conditionList.map((pitem, pindex) => {
              if (citem.condition == pitem.preCondition.re) {
                citem.preConditionEnums = pitem.preConditionEnums;
              }
            });
          });
        });

        preCondition.conditionList.map((pitem, i) => {
          let obj = {
            assist: []
          };
          pitem.preConditionEnums.map((pcitem, i) => {
            obj.assist.push({
              limit: pcitem.literal,
              formula: pcitem.conditionRe,
              measurement: pcitem.measurementRe,
              formulaList: this.conditionList,
              unitList: this.measurementList
            });
          });
          condition.push(obj);
        });
        this.conditionParasm.inspectItem = preCondition.preConditionItem;
        this.conditionParasm.condition = condition;
        console.log("insepec=======", insepec);
        console.log(this.conditionParasm);
      }
    }
  },

  mounted() {
    // let _this = this;
    // console.log(this.$route)
    // window.onbeforeunload = e => {
    //   if (_this.$route.fullPath == "/addCategory") {
    //     // 这样就可以在当个页面应用了
    //     e = e || window.event;
    //     if (e) {
    //       e.returnValue = "您是否确认离开此页面-您输入的数据可能不会被保存";
    //     }
    //     return "您是否确认离开此页面-您输入的数据可能不会被保存";
    //   } else {
    //     window.onbeforeunload = null;
    //   }
    // };
  },

  methods: {
    generateRoutes(item) {
      let obj = {};
      obj.label = item.label;
      obj.value = item.value;
      obj.parentId = item.parentId;
      // if (obj.parentId === 0 && item.children.length === 0) {
      //   obj.disabled = true;
      // }
      if (item.children.length !== 0) {
        obj.children = item.children.map(item => {
          return this.generateRoutes(item);
        });
      }
      return obj;
    },

    handleChange(val) {
      this.classificationId = [];
      if (this.value.length === 0) return;
      for (let item of this.value) {
        this.classificationId.push(item[item.length - 1]);
      }
      console.log(this.classificationId);
    },

    // 获取类别、商品
    getTreeStructure() {
      return new Promise(async resolve => {
        const res = await this.$get("/fast-center/category/treeStructure");
        this.options = res.map((item, index) => {
          return this.generateRoutes(item);
        });
        resolve(true);
      });
    },

    // 获取检验项目
    getDetectionItem() {
      return new Promise(async resolve => {
        const res = await this.$post("/fast-center/detectionItem/getPages", {
          pageNum: 0,
          itemStatus: 1
        });
        // console.log(res)
        this.itemList = res;
        resolve(true);
      });
    },

    // 获取关系运算符
    getCondition() {
      return new Promise(async resolve => {
        let params = {
          pageNum: 1,
          pageSize: 50
        };
        const res = await this.$get( "/fast-center/detectionCondition/getPages", params );
        // console.log(res)
        this.conditionList = res.records;
        this.conditionParasm.condition[0].assist[0].formulaList = this.conditionList;
        this.inspectItemParams[0].conditionList[0].assist[0].formulaList = this.conditionList;
        resolve(true);
      });
    },

    //获取计量单位
     getMeasurement() {
       return new Promise(async resolve => {
        const res = await this.$post(`/fast-center/detectionMeasurement/getPages`,{ pageNum: 0, valid: 1 });
        this.measurementList = res;
        this.conditionParasm.condition[0].assist[0].unitList = this.measurementList;
        this.inspectItemParams[0].conditionList[0].assist[0].unitList = this.measurementList;
        resolve(true);
      });
    },

    // 获取检测方法
    getMethodsList() {
      return new Promise(async resolve => {
        const res = await this.$get("/fast-center/dm/listAll");
        this.methodsList = res;
        resolve(true);
      });
    },

    // 点击添加前提条件
    handleChoose(type) {
      this.isChecked = type === "yes" ? true : false;
      if (!this.isChecked) {
        // 新增检测项目参数
        this.inspectItemParams = [
          {
            inspect: "", // 检验项目
            conditionList: [
              // 选择条件
              {
                condition: "",
                preConditionEnums: [],
                assist: [
                  {
                    limit: "", // 限量值
                    measurement: "", // 参数单位
                    formula: "", // 公式选择
                    formulaList: this.conditionList, // 公式
                    unitList: this.measurementList // 公式
                  }
                ]
              }
            ],
            methods: []
          }
        ];
      }
    },

    // 点击新增检测项目
    handleAddInspect() {
      let param = {
        inspect: "", // 检验项目
        conditionList: [
          {
            condition: "",
            preConditionEnums: [],
            assist: [
              {
                limit: "", // 限量值
                measurement: "", // 参数单位
                formula: "", // 公式选择
                formulaList: this.conditionList, // 公式
                unitList: this.measurementList // 参数列表
              }
            ]
          }
        ], // 选择条件
        methods: []
      };
      if (!this.isChecked) {
        this.inspectItemParams.push(param);
      } else if (this.isChecked) {
        // 则代表勾选了前提条件
        let conditionList;
        console.log(this.inspectItemParams);
        conditionList = this.inspectItemParams[0].conditionList.map((sitem, sindex) => {
            return {
              condition: sitem.condition,
              preConditionEnums: sitem.preConditionEnums,
              assist: [
                {
                  limit: "", // 限量值
                  measurement: "", // 参数单位
                  formula: "", // 公式选择
                  formulaList: this.conditionList, // 公式
                  unitList: this.measurementList // 参数列表
                }
              ]
            };
          }
        );
        param.conditionList = conditionList;
        this.inspectItemParams.push(param);
        console.log(this.inspectItemParams, "push之后的inspectItemParams");
        // if(this.result.length === 0) { // 则代表没有点击弹窗  直接新增项目
        //   let conditionList
        //   console.log(this.inspectItemParams)
        //   conditionList = this.inspectItemParams[0].conditionList.map((sitem,sindex) => {
        //     return {
        //       condition: sitem.condition,
        //       preConditionEnums: sitem.preConditionEnums,
        //       assist: [
        //         {
        //           limit: "", // 限量值
        //           measurement: "", // 参数单位
        //           formula: "", // 公式选择
        //           formulaList: this.conditionList,  // 公式
        //           unitList: this.measurementList   // 参数列表
        //         }
        //       ]
        //     }
        //   })
        //   param.conditionList = conditionList
        //   this.inspectItemParams.push(param);
        //   return
        // }
        // this.inspectItemParams.push(param);
        // this.inspectItemParams = this.inspectItemParams.map((sitem,sindex) => {
        // if(this.result.length > sitem.conditionList.length ) {
        //   let num = this.result.length-sitem.conditionList.length
        //   console.log(num)
        //   for(let i = 0; i < num; i++) {
        //     console.log(i)
        //     sitem.conditionList.push({
        //     condition : "",
        //       assist : [{ limit: "",  measurement: "", formula: "",formulaList: this.conditionList,unitList:this.measurementList}]
        //     })
        //   }

        //   this.result.map((ritem,rindex) => {
        //     sitem.conditionList[rindex].condition = ritem
        //     sitem.conditionList[rindex].preConditionEnums = this.assistList[rindex]
        //   })
        //   }else {
        //     sitem.conditionList=sitem.conditionList.splice(0,this.result.length)
        //     this.result.map((ritem,rindex) => {
        //       sitem.conditionList[rindex].condition = ritem
        //       sitem.conditionList[rindex].preConditionEnums = this.assistList[rindex]
        //     })
        //   }
        //   return {
        //     inspect:sitem.inspect,
        //     conditionList:sitem.conditionList, // 选择条件,
        //     methods: sitem.methods
        //   }
        // })
      }
    },

    // 点击移除新增的检测项目
    handleRemove(inspectIndex) {
      this.$Modal.confirm({
        title: "删除提示",
        content: "<p>是否确认删除该检测项目?</p>",
        onOk: () => {
          this.inspectItemParams.splice(inspectIndex, 1);
          this.$Message.success("删除成功");
        }
      });
    },

    // 点击新增辅助条件
    handleAddAssist(inpectInex, conditionIndex, assistItem, assistIndex) {
      // console.log(assistItem);
      let unit = [];
      // console.log(this.measurementList);
      unit = this.measurementList.filter(v => Number(v.id) === Number(assistItem.measurement));
      // console.log(unit);
      let param = this.validFormular(assistItem);
      param.unitList = unit;
      // console.log(param, "param");
      this.inspectItemParams[inpectInex].conditionList[conditionIndex].assist.push(param);
      // console.log(this.inspectItemParams);
    },

    // 点击删除新增辅助条件
    handleRemoveAssist(inpectIndex, conditionIndex, assistIndex) {
      // console.log(index);
      this.inspectItemParams[inpectIndex].conditionList[
        conditionIndex
      ].assist.splice(assistIndex, 1);
    },

    // 输入项目的 限量值
    handleLimit(assistItem, assist) {
      // console.log(assistItem);
      this.validLimit(assistItem, assist);
    },

    // 选择项目的  参数单位
    handleSelectMeasurement(assistItem, assist) {
      let unit = this.measurementList.filter(
        v => v.id == assist[0].measurement
      );
      if (assist.length >= 2) {
        assist[1].unitList = unit;
      }
    },

    // 选择项目的 公式
    handleSelectFormula(assistItem, assist) {
      // console.log(assistItem);
      if (assist.length >= 2) {
        let param = this.validFormular(assist[0]);
        // console.log(param);
        assist[1].formulaList = param.formulaList;
      }
      this.validLimit(assistItem, assist);
    },

    // 项目  保存
    async handleSave() {
      // console.log(this.inspectItemParams);
      let requestAddParma = {}; // 装新建要构造的数据
      let requestEditParma = {}; // 装编辑要构造的数据
      let standardItemVos = [];
      let inspectItemObj = {};
      let conditionObj = {};
      if (this.classificationId.length === 0) return this.$Message.warning({background: true,content: "请选择商品/类别"});
      for (let item of this.inspectItemParams) {
        // 非空判断
        if (!item.inspect) return this.$Message.warning({background: true,content: "请选择检验项目"});
        if (item.methods.length === 0) return this.$Message.warning({background: true,content: "请选择检验方法"});

        inspectItemObj = {
          detectionItemId: item.inspect,
          conditionEnums: [],
          detectionMethods: item.methods
        };

        // 则代表 当前是没有选择条件的
        if (!this.isChecked || (this.isChecked && !this.inspectItemParams[0].conditionList[0].condition)) {
          console.log("此时没有配置前提条件");
          for (let citem of item.conditionList) {
            conditionObj = {
              preConditionItem: "",
              preConditionRe: "",
              preConditionEnums: [],
              xiandingzhi: []
            };
            for (let aitem of citem.assist) {
              for(let key in aitem) {
                if (!aitem[key]) return this.$Message.warning({ background: true,content: "请完善条件配置"});    
              }
              conditionObj.xiandingzhi.push({
                conditionId: aitem.formula,
                measurementId: aitem.measurement,
                literal: aitem.limit 
              });
            }
            inspectItemObj.conditionEnums.push(conditionObj);
          }
        } else {
          // 则当前是有设置选择条件的
          for (let citem of item.conditionList) {
            conditionObj = {
              preConditionItem: this.conditionParasm.inspectItem,
              preConditionRe: citem.condition,
              preConditionEnums: citem.preConditionEnums,
              xiandingzhi: []
            };
            for (let aitem of citem.assist) {
              console.log(aitem)
              for(let key in aitem) {
                if (!aitem[key]) return this.$Message.warning({ background: true,content: "请完善条件配置"});    
              }

              conditionObj.xiandingzhi.push({
                conditionId: aitem.formula,
                measurementId: aitem.measurement,
                literal: aitem.limit
              });
            }
            inspectItemObj.conditionEnums.push(conditionObj);
          }
        }

        standardItemVos.push(inspectItemObj);
      }
      requestAddParma.standardId = this.routerParam.standardId; // 检验标准id
      requestAddParma.classificationId = this.classificationId; // 分类id
      requestAddParma.standardItemVos = standardItemVos;
      if (this.routerParam.type === "edit") {
        // 当前是编辑
        requestEditParma.classifyId = this.routerParam.classifyId;
        requestEditParma.standardId = this.routerParam.standardId;
        requestEditParma.standardDto = requestAddParma;
      }
      let requireUrl;
      let requestParam;
      if (this.routerParam.type === "add") {
        requireUrl = "/fast-center/detectionStandard/config";
        requestParam = requestAddParma;
      } else if (this.routerParam.type === "edit") {
        requireUrl = "/fast-center/detectionStandard/editStandardClassify";
        requestParam = requestEditParma;
      }
      console.log(requireUrl);
      // console.log(JSON.parse(requestParam))

      const res = await this.$post(requireUrl, requestParam,true);
      console.log(res);
      this.$Message.success({ background: true, content: res });
      this.jumpToCategory()
    },

    // 跳转到品类管理页面
    jumpToCategory() {
      this.$router.go(-1)
    },

    // 点击检验项目的检验项目修改
    handleEditItemName(inspectIndex) {
      this.$set(this.inspectItemParams[inspectIndex],"inspectName","")
    },

    // 点击检验项目的检验方法修改
    handleEditMethod(inspectIndex) {
      this.$set(this.inspectItemParams[inspectIndex],"methodsDesc","")
    },

    // 点击对话窗--新增条件
    handleAddCondition() {
      let param = {
        assist: [
          {
            limit: "", // 限量值
            measurement: "", // 参数单位
            formula: "", // 公式选择
            formulaList: this.conditionList, // 公式
            unitList: this.measurementList // 单位
          }
        ]
      };
      this.conditionParasm.condition.push(param);
    },

    // 点击对话窗 -- 增加辅助条件
    dialogAddAssist(index, assistItem, assistIndex) {
      let unit = [];
      unit = this.measurementList.filter(v => v.measurement == assistItem.measurement);
      let param = this.validFormular(assistItem);
      param.unitList = unit;
      this.conditionParasm.condition[index].assist.push(param);
      console.log(this.conditionParasm);
    },

    // 点击对话窗 -- 删除条件
    dialogRemove(index) {
      this.$Modal.confirm({
        title: "删除提示",
        content: "<p>是否确认删除该条件?</p>",
        onOk: () => {
          this.conditionParasm.condition.splice(index, 1);
          this.$Message.success("删除成功");

        }
      });
    },

    // 点击对话窗 -- 删除辅助条件
    dialogRemoveAssist(index, assistIndex) {
      this.conditionParasm.condition[index].assist.splice(assistIndex, 1);
    },

    validLimit(assistItem, assist,index) { // index是当前的索引
      if (assist.length >= 2) {
        // 此时需要与前一个做比对
        if (assist[0].formula == "<" || assist[0].formula == "2" || assist[0].formula == "≤" || assist[0].formula == "4") {
          if((!assist[1].limit.toString().trim() && !assist[0].limit.toString().trim()) && assistItem.formula) {
            // 代表当前是先选择了一组公式   再输入值
            assistItem.limit = " ";

          }else if ( Number(assist[1].limit) >= Number(assist[0].limit) && assistItem.formula) {
            this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
            assistItem.limit = " ";
            return;
          }
        }else if(assist[0].formula == ">" || assist[0].formula == "1" || assist[0].formula == "≥" || assist[0].formula === "3") {
          if((!assist[1].limit.toString().trim() && !assist[0].limit.toString().trim()) && assistItem.formula) {
            // 代表当前是先选择了一组公式   再输入值
            assistItem.limit = " ";
          }else if(!assist[1].limit.toString().trim()) {
            return
          }
          else if ( Number(assist[1].limit) <= Number(assist[0].limit) && assistItem.formula) {
            this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
            assistItem.limit = " ";
            return;
          }
        } 
        console.log(assist)
      }
      // let length = this.conditionParasm.condition.length
      // if(length >= 2 && index > 0) {  // 第一个不需要做对比
      // // 当前输入的是> || ≥ 和上个的 ≤ || < 作比较
      //   if(assistItem.formula == ">" || assistItem.formula == "≥") {
      //     let compareObj = this.conditionParasm.condition[index-1].assist.find(v => v.formula == "<" || v.formula == "≤")
      //     console.log(compareObj,"compareObj")
      //     if(assistItem.formula == ">" && (compareObj.formula == "≤" || compareObj.formula == "<")) {
      //        if(Number(assistItem.limit) < Number(compareObj.limit)) {
      //         assistItem.limit = " "
      //         this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
      //         return
      //       } 
      //     }else if(assistItem.formula == "≥" && compareObj.formula == "≤") {
      //       if(Number(assistItem.limit) <= Number(compareObj.limit)) {
      //         assistItem.limit = " "
      //         this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
      //         return
      //       }    
      //     }else if(assistItem.formula == "≥" && compareObj.formula == "<") {
      //       if(Number(assistItem.limit) < Number(compareObj.limit)) {
      //         assistItem.limit = " "
      //         this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
      //         return
      //       }    
      //     }
      //   }else if(assistItem.formula == ">" || assistItem.formula == "≥") {
      //      // 当前输入的是< || ≤ 和下个的 ≥ || > 作比较
      //     let compareObj = this.conditionParasm.condition[index+1].assist.find(v => v.formula == ">" || v.formula == "≥")
      //     console.log(compareObj,"compareObj")
      //     if(assistItem.formula == "<" && (compareObj.formula == "≤" || compareObj.formula == "<")) {
      //        if(Number(compareObj.limit) < Number(assistItem.limit)) {
      //         assistItem.limit = " "
      //         this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
      //         return
      //       } 
      //     }
      //   }
       
      //   if(compareObj.formula == "≤") {
      //     if(assistItem.formula == ">") {
      //       if(Number(assistItem.limit) < Number(compareObj.limit)) {
      //         assistItem.limit = " "
      //         this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
      //         return
      //       }  
      //     }
      //   }
      //   if(assistItem.formula == ">" && (compareObj.formula == "≤" || compareObj.formula == "<")) {
      //     if(Number(assistItem.limit) < Number(compareObj.limit)) {
      //       assistItem.limit = " "
      //       this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
      //       return
      //     }         
      //   }else if(assistItem.formula == "≥" && (compareObj.formula == "≤" || compareObj.formula == "<")) {
      //       if(Number(assistItem.limit) <= Number(compareObj.limit)) {
      //         assistItem.limit = " "
      //         this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
      //         return
      //       }    
      //   }
      // }
    },

    validFormular(assistItem) {
      console.log(assistItem);
      let list = [];
      if (assistItem.formula === ">" || assistItem.formula === "≥" || assistItem.formula == "1" || assistItem.formula == "3") {
        list = this.conditionList.filter( v => v.conditionCode == "<" || v.conditionCode == "≤");
        // console.log(list)
      } else if ( assistItem.formula === "<" || assistItem.formula === "≤" || assistItem.formula == "2" || assistItem.formula == "4" ) {
        list = this.conditionList.filter(v => v.conditionCode == ">" || v.conditionCode == "≥");
      }
      let param = {
        limit: "", // 限量值
        formula: "", // 公式选择
        formulaList: list, // 公式选择
        measurement: ""
      };
      return param;
    },

    compare(property,desc) {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            if(desc==true){
                // 升序排列
                return value1 - value2;
            }else{
                // 降序排列
                return value2 - value1;
            }
        }
    },

    // 对话窗  输入限量值
    handleModalLimit(assistItem, assist,index) {
      console.log(assistItem);
      console.log(assist);
      this.validLimit(assistItem, assist,index);

    },

    // 对话窗  选择参数
    handleModalSelectMeasurement(assistItem, assist) {
      let unit = this.measurementList.filter(v => v.measurement == assist[0].measurement);
      if (assist.length >= 2) {
        assist[1].unitList = unit;
      }
    },

    //对话窗  选择公式
    handleModalSelectFormula(assistItem, assist,index) {
      // console.log(assistItem)
      // console.log(assist)
      if (assist.length >= 2) {
        let param = this.validFormular(assist[0]);
        console.log(param);
        assist[1].formulaList = param.formulaList;
      }
      this.validLimit(assistItem, assist,index);
    },

    testArr(x, arr = []) {
      console.log("参数:", arr);
      let result = [];
      arr.forEach(item => {
        let limitArr = [];
        let formulaArr = [];
        let measurement = [];
        if (item.length - 1 > 0) {
          item.forEach(item1 => {
            limitArr.push(item1.literal);
            formulaArr.push(item1.conditionRe);
            measurement.push(item1.measurementRe);
          });
          limitArr.sort();
          let strConcat = limitArr[0] + measurement[0];
          if (formulaArr.indexOf(">") > -1) {
            strConcat += "<";
          } else {
            strConcat += "≤";
          }
          strConcat += x;
          if (formulaArr.indexOf("<") > -1) {
            strConcat += "<";
          } else {
            strConcat += "≤";
          }
          strConcat += limitArr[1];
          strConcat += measurement[0];
          result.push(strConcat);
        } else {
          result.push(
            x + item[0].conditionRe + item[0].literal + item[0].measurementRe
          );
        }
      });
      return result;
    },

    formatArr(arr = []) {
      let list = []
      arr.forEach(item => {
        let symbolObj = {}
        let limitArr = [];
        let formulaArr = [];
        if (item.length - 1 > 0) {
          item.sort((a,b) => {
            return a.literal - b.literal 
          })
          symbolObj.minValue = item[0].literal
          symbolObj.maxValue = item[1].literal
          if(item[0].conditionRe === "≥" && item[1].conditionRe === "≤") {// 全闭区间
            symbolObj.symbol = 7
          }else if(item[0].conditionRe === "≥" && item[1].conditionRe === "<") {  //左闭右开区间
            symbolObj.symbol = 8
          }else if(item[0].conditionRe === ">" && item[1].conditionRe === "≤") {  // -左开右闭区间
            symbolObj.symbol = 9
          }else if(item[0].conditionRe === ">" && item[1].conditionRe === "<") {  // -全开区间
            symbolObj.symbol = 10
          }
        }else {
          symbolObj.maxValue = item[0].literal
          if(item[0].conditionRe === ">") {// 大于
            symbolObj.symbol = 1
          }else if(item[0].conditionRe === "<") {  // 小于
            symbolObj.symbol = 2
          }else if(item[0].conditionRe === "=") {  // 等于
            symbolObj.symbol = 3
          }else if(item[0].conditionRe === "!=") {  // 不等于
            symbolObj.symbol = 4
          }else if(item[0].conditionRe === "≥") {  // 大于等于
            symbolObj.symbol = 5
          }else if(item[0].conditionRe === "≤") {  // 小于等于
            symbolObj.symbol = 6
          }
        }

        list.push(symbolObj)
      })

      console.log(list,'list')
      return list
    },

    async handleModalSave() {
      const { inspectItem, condition } = this.conditionParasm;
      console.log(this.conditionParasm);
      if (!inspectItem) return this.$Message.warning({background: true,content: "请选择检验项目"});
      for (let item of condition) {
        for (let aitem of item.assist) {
          for (let key in aitem) {
            if (!aitem[key].toString().trim())
              return this.$Message.warning({background: true,content: "请完善条件配置"});
          }
        }
      }

      // --------------以上是做非空校验----------------------///

      this.assistList = [];
      for (let item of this.conditionParasm.condition) {
        console.log(item)
        let obj = item.assist.map(v => {
          return {
            conditionRe: v.formula,
            literal: v.limit.toString().trim(),
            measurementRe: v.measurement
          };
        });
        this.assistList.push(obj);
      }
      // console.log(this.assistList);
      let list = this.formatArr(this.assistList)
      this.loading = true
      try {
        const res = await this.$post('/fast-center/detectionStandard/isConditionRepeat',{test:list})
        this.loading = false
        console.log(res)
        if(res) return this.$Message.warning({ background: true, content: "区间有交集,请重新配置"});
      }catch(err){
        return this.loading = false
      }
      
      this.result = this.testArr(this.conditionParasm.inspectItem,this.assistList);
      // console.log(this.result);

      this.inspectItemParams.forEach((sitrm, sindex) => {
        if (this.result.length > sitrm.conditionList.length) {
          let num = this.result.length - sitrm.conditionList.length;
          console.log(num);
          for (let i = 0; i < num; i++) {
            sitrm.conditionList.push({
              condition: "",
              assist: [
                {
                  limit: "",
                  measurement: "",
                  formula: "",
                  formulaList: this.conditionList,
                  unitList: this.measurementList
                }
              ]
            });
          }

          this.result.map((ritem, rindex) => {
            sitrm.conditionList[rindex].condition = ritem;
            sitrm.conditionList[rindex].preConditionEnums = this.assistList[rindex];
          });
        } else {
          sitrm.conditionList = sitrm.conditionList.splice(0,this.result.length);
          this.result.map((ritem, rindex) => {
            sitrm.conditionList[rindex].condition = ritem;
            sitrm.conditionList[rindex].preConditionEnums = this.assistList[rindex];
          });
        }
      });
      this.isShowDialog = false;
    }
  }
};
</script>

<style lang="less" scoped>
.add-standard {
  .loading-c {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(255,255,255,.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .main {
    background: @color-white;
    padding: 28px 30px 50px;
    height: 100%;

    .center-wrap {
      // margin: 32px 0;
      .title {
        font-weight: bold;
        margin-bottom: 8px;
      }
      .content {
        font-size: @fontsize-small-s;
        .left-box,
        .right-box {
          display: inline-block;
          width: 300px;
          height: 200px;
          border: 1px solid #ccc;
          border-radius: 10px;
          padding: 5px 10px;
          overflow: auto;
          .box-content {
            padding: 10px;
            .item {
              line-height: 35px;
              .category {
                margin-right: 15px;
                &:hover {
                  cursor: pointer;
                }
              }
            }
          }
        }
        .left-box {
          margin-right: 20px;
        }
      }
    }

    .category-wrap {
      margin-bottom: 40px;
    }
    .select {
      width: 409px;
    }
    .addCondition-wrap {
      display: inline-block;
      font-size: @fontsize-small-s;
      line-height: 36px;
      margin: 36px 0 20px;
      .left-wrap {
        display: inline-block;
        > span {
          font-weight: bold;
          margin-right: 22px;
        }
        .checkbox-item {
          display: inline-block;
          margin-right: 20px;
          > input {
            position: relative;
            top: 2px;
            margin-right: 8px;
          }
        }
      }
      .operation-item {
        margin: 0 42px;
      }
    }
    .down-wrap {
      margin-bottom: 40px;
      .plan-wrap {
        position: relative;
        .remove {
          position: absolute;
          top: -3px;
          left: 100px;
          font-size: 20px;
          color: @btn-bgColor-red;
          margin-left: 20px;
        }
        .addBtn {
          margin: 0 40px 0 32px;
        }
      }

      .down-content {
        margin-top: 26px;
        border: 1px solid @bdColor-grey;
        padding: 28px;
        .inspect-item {
          margin-bottom: 32px;
          &:not(:first-child) {
            padding-top: 32px;
            border-top: 1px dashed #ccc;
          }
          .remove {
            font-size: 20px;
            color: @btn-bgColor-red;
            margin-left: 20px;
          }
          .assist-item {
            margin-top: 26px;
            .select {
              width: 100%;
            }
            .operation {
              font-size: 30px;
              line-height: 36px;
              color: @btn-bgColor-green;
              margin-left: 34px;
            }
            /deep/.ivu-input {
              height: 34px;
            }
          }
        }

        .methods-wrap {
          /deep/.ivu-select-selection {
            height: 100%;
          }
          /deep/.ivu-select-placeholder {
            line-height: 38px;
          }
        }
      }
    }

    .footer {
      text-align: center;
      margin-top: 100px;
      .saveBtn {
        margin-right: 40px;
      }
    }
  }
}
</style>
<style lang="less" scoped>
/deep/.ivu-form-item-label {
  font-weight: bold;
  color: @color-dark-grey;
}
.top-wrap {
  /deep/.ivu-form-item {
    display: inline-block;
    width: 45%;
    &:first-child {
      margin-right: 100px;
    }
  }
}
.center-wrap {
  /deep/.ivu-input {
    font-size: @fontsize-small-s!important;
    height: 32px !important;
    border-radius: 16px !important;
    text-align: center !important;
  }
}
.down-wrap {
  .plan-wrap {
    // line-height: 60px;
    /deep/.ivu-form-item {
      display: inline-block;
      &:first-child {
        width: 409px;
      }
    }
  }
  .down-content {
    /deep/.ivu-form-item-label {
      font-size: @fontsize-small-s;
    }
    .assist-item {
      /deep/.ivu-form-item {
        display: inline-block;
        &:nth-child(2) {
          margin: 0 60px;
        }
        &:not(:last-child) {
          width: 27%;
        }
      }
    }
  }
}

/deep/.el-cascader {
  width: 60%;
  border-color: @bdColor-grey-s!important;
  font-size: 13px!important;
}

</style>
<style lang="less" scoped>
// 对话窗样式
/deep/.ivu-modal-wrap {
  min-height: 600px;
}
/deep/.ivu-input-word-count {
  line-height: 36px;
}
/deep/.ivu-select-input {
  font-size: 13px;
}
</style>