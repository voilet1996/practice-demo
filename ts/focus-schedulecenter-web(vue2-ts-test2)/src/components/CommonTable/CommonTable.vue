<!--
支持功能点：
1. 简单的转码（支持逗号分隔的数据转码）(1,2,3,=>你,我,他)
    {
      reqUrl:"/api/core/v1/dictionary/queryData.do?dicId=DWDZS",//转码的URL (类型POST，参数为空，仅需一个url) 转码等级最高级
      prop：""",
      label:"",
      width:"",
      sortable:true,                                            //排序操作
      fixedType:false,                                          // 默认不冻结。(支持：'left','right',false 三种值)
      handlePropertyCallback: splitMinutes,                     // 按自定义规则处理单元格内的数据
      changeArr:[{
        text:"",
        value:""
      }]                                                        // 转码的数组 (类型数组) 转码等级中等
    }
    注意：转码等级！
2. 动态操作列
    通过dynamicSlotName值的改变 显示不同的操作列
    dynamicSlotName: {
      default: "one",
    },
    例子：
    <common-table :other-column="otherColumn" :dynamicSlotName="'one'">
      <template slot-scope="myscope" slot="one">
        <i class="iconfont icon-peizhi" title="字段规则"></i>
        <i class="iconfont iconbiaoge_shanchu" title="删除" @click="deleteItem(myscope.data)"></i>
      </template>

      <template slot-scope="myscope" slot="two">
          <i class="iconfont icon-peizhi" title="规则"></i>
      </template>
    </common-table>

3. 配置复选框
    isHasSelection 传true

4.按自定义规则处理单元格内的数据（无须转码）
  例如：返回的时间中有秒，但页面只需展示到分钟
  {
    label: "会议开始时间",
    prop: "meetingStartTime",
    handlePropertyCallback: splitMinutes, // 该字段的value为一个function，需要定义在父组件的data中（与elementui的自定义表单校验规则类似）
    width: "150",
  },
5.表格重新加载
   this.$refs.xxx.reloadTable(); xxx指外层赋的名字 :ref="xxx"
6. 
 --->
<template>
  <div class="fu-common-table-wrapper">
    <fu-table
      :fu-request="tableReq"
      :fu-data="tableData"
      :fu-callback="callback"
      :fu-cbparams="codeList"
      border
      :ref="tableId"
      :fu-id="tableId"
      :max-height="maxHeight"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange"
      @select="handleSelect"
      @select-all="selectAll"
      v-on="$listeners"
      :cell-style="cellStyle"
    >
      <fu-table-column
        type="selection"
        width="55"
        v-if="isHasSelection"
        align="center"
        class="selection-zone"
        :selectable="selectable"
      >
      </fu-table-column>
      <fu-table-column
        type="index"
        width="55"
        label="序号"
        align="center"
        :index="funIndex"
      >
      </fu-table-column>
      <fu-table-column
        v-for="item in fuColumn"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
        :sortable="item.sortable ? 'custom' : false"
        :min-width="item.width"
        :fixed="item.fixedType || false"
        :header-align="item.headerAlign || 'left'"
        :align="item.align || 'left'"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div v-if="item.handlePropertyCallback">
            {{
              handleProperty(scope.row[item.prop], item.handlePropertyCallback)
            }}
          </div>
          <!-- 1.必须有slot插槽具名 2.检查是否可以显示slot插槽 -->
          <template slot-scope="scope" v-else-if="item.slot">
            <slot
              :name="item.slot"
              :row="scope.row"
              :column="scope.column"
              :columnName="scope.column.property"
              :value="scope.row[item.prop]"
              :rowIndex="scope.$index"
              :data="scope"
              >{{ scope.row[item.prop] }}</slot
            >
          </template>
          <span v-else>{{ scope.row[item.prop] }}</span>
        </template>
      </fu-table-column>

      <fu-table-column
        :label="operationName"
        :width="operationWidth"
        fixed="right"
        align="center"
        header-align="center"
        v-if="isNeedOperation"
      >
        <template slot-scope="scope">
          <slot :name="dynamicSlotName" :data="scope.row" :index="scope.$index"
            >暂无操作</slot
          >
        </template>
      </fu-table-column>
    </fu-table>
    <fu-pagination
      v-if="isNeedPaging"
      :fu-request="tableReq"
      ref="page"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="tableData.page"
      :page-sizes="[5, 10, 20, 50]"
      :page-size="tableData.pagerows"
      layout="total, sizes, prev, pager, next, jumper"
      :total="tableData.totalrows"
    >
    </fu-pagination>
  </div>
</template>

<script>
import { Table, TableColumn, Pagination, Message } from "fusion-ui";
import { postJSON } from "@/utils/post";

export default {
  name: "CommonTable",
  components: {
    FuTable: Table,
    FuTableColumn: TableColumn,
    FuPagination: Pagination,
  },
  props: {
    cellStyle: {
      type: Function,
      default: function() {},
    },
    selectable: {
      type: Function,
      default: function() {
        return true;
      },
    },
    maxHeight: {
      type: String,
      default: "550px",
    },
    /**
     * @description 表格请求url
     */
    reqUrl: {
      require: true,
      type: String,
    },
    /**
     * @description 表格请求参数
     */
    reqParams: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /**
     * @description 是否显示复选框
     */
    isHasSelection: {
      type: Boolean,
      default: false,
    },
    // 当一个页面需要引入多个commonTable时，需要定义不同的id
    tableId: {
      type: String,
      required: true,
    },
    /**
     * @description 固定显示的表格列数据 主要是为了适应当前表格
     */
    fuColumn: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /**
     * @description 动态操作列--对应的插槽名称name 用于区分插槽列渲染
     */
    dynamicSlotName: {
      default: "one",
    },
    /**
     * @description 操作列名称,默认为操作
     */
    operationName: {
      default: "操作",
    },
    /**
     * @description 操作列宽度
     */
    operationWidth: {
      default: "120",
      type: String,
    },
    /**
     * @description 是否需要操作列 默认为是
     */
    isNeedOperation: {
      default: true,
      type: Boolean,
    },
    /**
     * @description 是否单选表格 默认为否
     */
    isSingleChoice: {
      default: false,
      type: Boolean,
    },
    /**
     * @description 是否需要分页
     */
    isNeedPaging: {
      default: true,
      type: Boolean,
    },
    /**
     * @description 静态数据
     */
    staticTableData: {
      type: Object,
      default() {
        return {
          page: 1,
          pagerows: 10,
          rows: [],
          totalrows: 0,
        };
      },
    },
    isUseSlot: {
      type: Function,
      default() {
        return true;
      },
    },
  },
  data() {
    return {
      tableData: {
        page: 1,
        pagerows: 10,
        rows: [],
        totalrows: 0,
      },
      sortName: "",
      sortFlag: "",
      multipleSelection: [],
      codeList: {},
    };
  },
  computed: {
    tableReq() {
      let params = [
        {
          vtype: "pagination",
          name: "pagerows",
          data: this.isNeedPaging ? this.tableData.pagerows : -1,
        },
        { vtype: "pagination", name: "totalrows", data: 0 },
        { vtype: "pagination", name: "page", data: this.tableData.page },
        {
          vtype: "pagination",
          name: "sortName",
          data: this.sortName,
        },
        {
          vtype: "pagination",
          name: "sortFlag",
          data: this.sortFlag,
        },
      ];
      params.splice(5, params.length - 5, ...this.reqParams);
      return {
        url: this.reqUrl,
        params,
      };
    },
    //获取表格的rows
    currentRows() {
      return this.$store.state.reqData[this.tableId].rows;
    },
  },
  watch: {
    isNeedOperation(newVal) {
      console.log(newVal);
    },
    staticTableData: {
      immediate: true,
      deep: true,
      handler(val) {
        if ("page" in val) {
          this.tableData.page = val.page;
        }
        if ("pagerows" in val) {
          this.tableData.pagerows = val.pagerows;
        }
        if ("rows" in val) {
          this.tableData.rows = val.rows;
        }
        if ("totalrows" in val) {
          this.tableData.totalrows = val.totalrows;
        }
      },
    },
  },
  beforeCreate() {},
  created() {
    console.log(this.tableId);
    /**
     * @description 初始化转码操作
     */
    function getLabel(that, element) {
      if (element.reqUrl) {
        // 转码请求
        postJSON(element.reqUrl).then((res) => {
          that.$set(that.codeList, element.prop, res.data[0].data);
        });
      } else if (element.changeArr) {
        // 需要等到接口返回数据再执行
        setTimeout(function() {
          that.$set(that.codeList, element.prop, element.changeArr);
        }, 500);
      }
    }
    for (let index = 0; index < this.fuColumn.length; index++) {
      const element = this.fuColumn[index];
      getLabel(this, element);
    }
  },
  methods: {
    /**
     * @description 转码操作
     */
    changeCodecCallback(data, arr) {
      // console.log(data, arr);
      try {
        if (arr) {
          let tempArr = data.split(",");
          const res = [];
          tempArr.forEach((val) => {
            res.push(arr.find((value) => value.value === val).text);
          });
          return res.join(",");
        } else {
          return "";
        }
      } catch (err) {
        return data;
      }
    },
    /**
     * @description 表格回调
     */
    callback(data, codeList) {
      let result = JSON.parse(JSON.stringify(data));
      if (result.rows) {
        for (let index = 0; index < result.rows.length; index++) {
          const element = result.rows[index];
          for (let j = 0; j < this.fuColumn.length; j++) {
            const column = this.fuColumn[j];
            if (column["reqUrl"] || column["changeArr"]) {
              element[column.prop] = this.changeCodecCallback(
                element[column.prop],
                codeList[column.prop]
              );
            }
          }
        }
      }
      return result;
    },
    handleProperty(prop, callback) {
      return callback(prop);
    },
    /**
     * @description 表格全选
     */
    selectAll() {
      if (this.isSingleChoice) {
        Message.warning("当前为单选表格");
      }
    },
    /**
     * @description 表格排序
     */
    sortChange({ column, prop, order }) {
      console.log(column, prop, order);
      this.sortName = prop;
      if (order === "ascending") {
        this.sortFlag = "asc";
      } else {
        this.sortFlag = "desc";
      }
    },
    /**
     * @description 复选框事件
     */
    handleSelectionChange(val) {
      if (!this.isSingleChoice) {
        this.multipleSelection = val;
        this.$emit("deliverySelection", val);
      }
    },
    /**
     * @description 表格选中事件
     */
    handleSelect(selection, row) {
      if (this.isSingleChoice) {
        this.checkedReason = row;
        if (selection.length > 1) {
          this.$refs[this.tableId].$refs.el.clearSelection();
          this.$refs[this.tableId].$refs.el.toggleRowSelection(row);
        }
        this.$emit("deliverySelection", [row]);
      }
    },
    /**
     * @description 表格的重新加载
     * @example this.$refs.xxx.reloadTable(); xxx指外层赋的名字 :ref="xxx"
     */
    reloadTable() {
      this.$refs[this.tableId].queryData();
      if (this.isNeedPaging) {
        this.$refs.page.queryData();
      }
    },

    //表格分页切换
    handleCurrentChange(val) {
      this.tableData.page = val;
    },
    //每页多少条
    handleSizeChange(val) {
      this.tableData.pagerows = val;
    },
    funIndex(index) {
      return (this.tableData.page - 1) * this.tableData.pagerows + index + 1;
    },
  },
};
</script>

<style lang="less" scoped>
/**=========表格和分页组合样式start======================*/
.fu-common-table-wrapper {
  background-color: #ffffff;
  overflow: auto;
}
.fu-common-table-wrapper .el-pagination {
  margin: 20px 0 20px 20px;
}
/**=========表格和分页组合样式end======================*/

/*用在表格和树内部的title样式*/
.fu-common-table-wrapper {
  /*表格中图标按钮样式*/
  /deep/.el-table .iconfont {
    margin-right: 10px;
    // font-size: 20px;
    font-size: 14px; // 文字按钮大小
    color: #409eff;
    cursor: pointer;
  }
  /deep/.el-table .iconfont.disabled {
    cursor: not-allowed;
    color: #666;
  }
  /* 表格样式问题 */
  /deep/.el-table__fixed-right {
    height: 100% !important;
  }
}
</style>
