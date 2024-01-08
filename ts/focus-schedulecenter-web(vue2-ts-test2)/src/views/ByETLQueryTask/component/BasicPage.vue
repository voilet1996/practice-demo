<template>
  <div>
    <div class="header">
      <div class="left" v-if="topLeftArea">
        <slot name="topleft"></slot>
      </div>
      <div class="right">
        <template v-if="needDefaultQueryCom">
          <AdvancedQuery
            :columns="queryColumns"
            :hideAdvancedQuery="true"
            @search="handleQuery"
          />
        </template>
        <template v-else>
          <slot name="topright"></slot>
        </template>
      </div>
    </div>
    <div class="table-area">
      <CommonTable
        ref="mainTable"
        :reqUrl="reqUrl"
        :reqParams="reqParams"
        :tableId="'mainTable'"
        :fuColumn="tableColumns"
        :staticTableData="table.data"
        :dynamicSlotName="'operation'"
        :operationWidth="operationWidth"
        :isNeedOperation="isNeedOperation"
      >
        <template v-for="itemS in slotArr" slot-scope="scope" :slot="itemS">
          <!-- 转码 -->
          {{ changeCode(scope.row[itemS], itemS) }}
        </template>
        <template slot-scope="myscope" slot="operation">
          <slot name="operationColumn" :scope="myscope"></slot>
        </template>
      </CommonTable>
    </div>
  </div>
</template>

<script>
import { postJSON } from "@/utils/post";
import CommonTable from "@/components/CommonTable/CommonTable";
import AdvancedQuery from "@/components/AdvancedQuery/queryUpdate";
import { Dialog, Button, Message, MessageBox, Upload } from "fusion-ui";

export default {
  components: {
    CommonTable,
    AdvancedQuery,
    FuButton: Button,
  },
  props: {
    isNeedOperation: {
      default: true,
      type: Boolean,
    },
    // 默认查询组件
    needDefaultQueryCom: {
      default: false,
      type: Boolean,
    },
    // 头部左侧插槽
    topLeftArea: {
      default: false,
      type: Boolean,
    },
    // 查询组件需要的数据
    queryColumns: {
      default: () => [],
      type: Array,
    },
    // 列表请求的url
    reqUrl: {
      default: "",
      type: String,
    },
    // 列表请求的参数
    tableReqParams: {
      default: () => [],
      type: Array,
    },
    // 列表渲染用的数据
    tableColumns: {
      default: () => [],
      type: Array,
    },
    // 转码用的对象
    changeCodeObj: {
      default: () => {},
      type: Object,
    },
    // 操作列宽度
    operationWidth: {
      default: "200",
      type: String,
    },
  },
  computed: {
    reqParams: {
      get() {
        let data = {
          ...JSON.parse(JSON.stringify(this.queryParams)),
        };
        console.log(this.tableReqParams);
        let reqP = JSON.parse(JSON.stringify(this.tableReqParams));
        if (reqP.length === 1) {
          reqP[0].data = data;
        } else {
          reqP.forEach((item) => {
            item.data = data[item.name];
          });
        }
        return reqP;
      },
      set(newVal) {
        return newVal;
      },
    },
    changeCode() {
      return (value, prop) => {
        try {
          const idx = this.changeCodeObj[prop].findIndex(
            (item) => item.value === value
          );
          return this.changeCodeObj[prop][idx].text;
        } catch (error) {
          return value;
        }
      };
    },
  },
  data() {
    return {
      table: {
        data: {
          page: 1,
          pagerows: 10,
          rows: [{ sjbm: "aaa" }],
          totalrows: -1,
        },
      },
      slotArr: [],
      queryParams: {},
    };
  },
  created() {
    this.tableColumns.forEach((item) => {
      if (item.slot) {
        this.slotArr.push(item.prop);
      }
    });
  },
  methods: {
    reloadTable() {
      this.$refs.mainTable.reloadTable();
    },
    handleQuery(queryParams) {
      this.queryParams = {
        ...JSON.parse(JSON.stringify(queryParams)),
      };
    },
  },
};
</script>

<style lang="less" scoped>
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  .left {
    margin: auto 0;
  }
}
</style>
