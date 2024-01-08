<script>
import { postJSON } from "@/utils/post.js"
import { mergeConflictedData, transformMappingKeys } from "@/utils/tools.js"
export default {
  name: "",
  components: {},
  // extends: null,
  // minxins: [],
  props: ["etlManager", "bpmnId", "businessInstance"],
  data() {
    return {
      taskData: {},
      defaultTabIndex: 1, //默认显示第二个tab签
    }
  },
  computed: {},
  watch: {
    //JSON变化监听，通知外侧组件更新数据
    taskData: {
      handler() {
        this.businessInstance &&
          this.businessInstance.updateConfig(this.taskData)
      },
      deep: true,
    },
    //步骤面板切换事件，可能面板类型没有变化，所以每个步骤需要重新初始化数据
    bpmnId: {
      handler() {
        //初始化整个步骤信息
        this.initBaseData()
        //清空步骤内部缓存数据、请求终止、默认选中第一个tab签等
        this.initTaskData()
        //@Julia 20211019 新增逻辑--默认选中第二个tab签
        this.setDefaultTab()
      },
      deep: true,
    },
  },
  beforeCreate() {},
  created() {
    this.initBaseData()
    this.initEventListener()
  },
  beforeMount() {},
  mounted() {
    //@Julia 20211019 新增逻辑--默认选中第二个tab签
    this.setDefaultTab()
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    /**
     * @description 默认选中第二个tab签
     */
    setDefaultTab() {
      this.$nextTick(() => {
        let tabs = document.querySelectorAll(".el-tabs__item")
        if (tabs.length > this.defaultTabIndex) {
          tabs[this.defaultTabIndex].click()
        }
      })
    },
    /**
     * @description 事件监听
     */
    initEventListener() {
      this.businessInstance.on("label.update", () => {
        this.taskData.baseTask.jobDesc = this.businessInstance.jobDesc
      })
    },
    initBaseData() {
      let recoverData =
        this.businessInstance && this.businessInstance.getConfig()
          ? this.businessInstance.getConfig()
          : {}

      if (Object.keys(recoverData).length > 0) {
        //回显
        //初始化taskData
        this.$set(this, "taskData", JSON.parse(JSON.stringify(recoverData)))
      } else {
        //新增
        //初始化taskData
        this.$set(this, "taskData", JSON.parse(JSON.stringify(this.CONFIG)))
        //获取步骤名称，主要是名称后的数字，用来拼英文名
        let jobDesc = this.businessInstance.jobDesc
        let taskType = this.businessInstance.taskType
        let reg = /(\d+)$/g
        let num = reg.exec(jobDesc)
        let taskName = num ? `${taskType}${num[1]}` : `${taskType}`
        this.taskData.baseTask.jobDesc = jobDesc
        this.taskData.baseTask.taskName = taskName
      }

      //taskId设置,理论上只有新建步骤的时候需要此行代码
      this.taskData.baseTask.taskId = this.bpmnId
    },
    /**
     * @description 合并冲突
     */
    mergeConflictedData(
      jsonData,
      newData,
      writableProps,
      keysMapping,
      identifyKey,
      isAddNewData
    ) {
      return mergeConflictedData(
        jsonData,
        newData,
        writableProps,
        keysMapping,
        identifyKey,
        isAddNewData
      )
    },
    /**
     * @description 依据keysMapping映射关系,修改表格数据data 的映射key值，删除旧key值
     */
    transformMappingKeys(data, keysMapping) {
      return transformMappingKeys(data, keysMapping)
    },
    /**
     * @description 请求接口 拼接修改新数据 拼数据1/数据2
     */
    async transformNewData(tableEnName, newData, identifyKey) {
      let params = {
        data: [
          {
            name: "select",
            vtype: "formpanel",
            data: {
              tableId: tableEnName,
              number: "2",
            },
          },
        ],
      }
      let res = await postJSON("/api/dmodel/v1/DataTable/queryDataToTable.do", {
        postData: JSON.stringify(params),
      })
      if (res) {
        let dataLists = res.data[0].data
        newData.forEach((item) => {
          //赋上数据1/数据2
          // item.previewDataFirst = dataLists[0][item[identifyKey]];
          // item.previewDataSecond = dataLists[1][item[identifyKey]];
          this.$set(item, "previewDataFirst", dataLists[0][item[identifyKey]])
          this.$set(item, "previewDataSecond", dataLists[1][item[identifyKey]])
        })
      }
    },

    /**
     * @description 从全部表格数据中 返回所有已启用的数据
     */
    cutStartUsingData(tableData) {
      let resultData = tableData.filter((item) => {
        return item.startUsing
      })
      return resultData
    },
  },
}
</script>

<style lang="less" scoped></style>
