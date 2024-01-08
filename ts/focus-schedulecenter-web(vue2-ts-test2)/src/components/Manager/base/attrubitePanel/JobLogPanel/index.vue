<template>
  <div
    class="job-log-panel"
    :style="{
      '--backgroundColor': backgroundColor,
      '--fontColor': fontColor,
    }"
  >
    <div class="log-panel-export" @click="exportLog">导出日志</div>
    <p class="log-panel-line" v-text="contents"></p>

    <span class="flicker-cursor">&nbsp;</span>
  </div>
</template>

<script>
import { postJSON } from "@/utils/post.js";
import { queryJobLog, queryJobDeatil } from "../../../base/Req";
export default {
  name: "JobLogPanel",
  data() {
    return {
      taskId: "",
      //最新运行id
      currentExecutionId: "",
      timeout: null,
      contents: "",
      timeGap: 1000,
    };
  },
  components: {},
  props: {
    backgroundColor: {
      type: String,
      default: "#142334",
    },
    fontColor: {
      type: String,
      default: "#fafafa",
    },

    etlManager: {
      type: Object,
      require: true,
    },
  },
  created() {
    this.clickResponse();
    //每次点运行就更新currentExecutionId
    this.etlManager.on("etl.service.procssId.update", () => {
      //   this.etlManager.showAttributePanel()
      //   this.etlManager.setAttributePanelType("JobLogPanel")
      // 请求时间间隔要求 1s 5s 10s 10s ...
      this.timeGap = 1000;
      //更新最新的运行id
      this.currentExecutionId = this.etlManager.getRunEtlProcessId();
    });
  },
  computed: {},
  mounted() {},
  methods: {
    clickResponse() {
      // 监听元素选中事件
      this.etlManager.on("bpmn.selection.changed", this.checkAttrPanel);
    },
    checkAttrPanel(event, selection) {
      let { extendedAttrPanelMap } = this.etlManager;
      if (selection && selection.newSelection.length) {
        let element = selection.newSelection[selection.newSelection.length - 1];

        let currentAttributePanelKey = element.id.split("_")[0];
        if (
          extendedAttrPanelMap.get(currentAttributePanelKey) &&
          extendedAttrPanelMap.get(currentAttributePanelKey).config.isBpmn
        ) {
          //是对应的bpmn步骤
          !extendedAttrPanelMap.get("JobLogPanel").config.isShow &&
            this.$set(
              extendedAttrPanelMap.get("JobLogPanel").config,
              "isShow",
              true
            );
          if (this.currentExecutionId && element.id) {
            //轮询请求job日志
            this.queryLog(this.currentExecutionId, element.id);
          }
          this.taskId = element.id;
          return;
        }
      }
      //不是对应的bpmn步骤
      extendedAttrPanelMap.get("JobLogPanel").config.isShow &&
        this.$set(
          extendedAttrPanelMap.get("JobLogPanel").config,
          "isShow",
          false
        );
      //将隐藏时，将面板跳转为第一个
      this.etlManager.setAttributePanelTypeToFirst();

      this.taskId = "";
    },
    /**
     * @description 查询日志
     */
    //TODO
    async queryLog(logId, taskId) {
      this.contents = "";
      try {
        console.log(
          `[JobLogPanel]<queryLog> etl请求运行结果(${Date.now()})...`
        );
        let type = this.$route.query.mode === "view";
        // view查日志 时候调一个单独的接口
        let res = type
          ? await queryJobDeatil(logId, taskId)
          : await queryJobLog(logId, taskId);
        // let res = await queryJobLog(logId, taskId);
        if (!type && res.data[0].data.etlExecutionStatus === "running") {
          //正在运行中
          //隔10s进行轮询
          this.timeout = setTimeout(() => {
            this.queryLog(logId, taskId);
          }, this.timeGap);
          if (this.timeGap === 1000) {
            this.timeGap = 5000;
          } else if (this.timeGap === 5000) {
            this.timeGap = 10000;
          }
        } else if (
          res.data[0].data.etlExecutionStatus === "success" ||
          res.data[0].data.etlExecutionStatus === "error" ||
          res.data[0].data.etlExecutionStatus === "unRun" ||
          res.data[0].data.etlExecutionStatus === "failure" ||
          type
        ) {
          //运行成功或失败
          this.timeout = null;
          console.log(
            `[JobLogPanel]<queryLog> etl后台运行进程已经结束，运行结果为${res.data[0].data.etlExecutionStatus}`
          );
          this.contents = res.data[0].data.etlLog;
        }
      } catch (e) {
        console.error(`[JobLogPanel]<queryLog> ERROR: ${e}`);
      }
    },
    /**
     * @description 导出日志
     */
    exportLog() {
      this.saveFile(`日志ID[${this.currentExecutionId}].log`, this.contents);
    },
    saveFile(filename, filecontent) {
      let URL = window.URL || window.webkitURL;
      function click(node) {
        try {
          node.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );
        } catch (e) {
          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent(
            "click",
            true,
            true,
            window,
            0,
            0,
            0,
            80,
            20,
            false,
            false,
            false,
            false,
            0,
            null
          );
          node.dispatchEvent(evt);
        }
      }

      function saveAs(blob, filename) {
        let type = blob.type;
        let force_saveable_type = "application/octet-stream";
        if (type && type != force_saveable_type) {
          // 强制下载，而非在浏览器中打开
          let slice = blob.slice || blob.webkitSlice || blob.mozSlice;
          blob = slice.call(blob, 0, blob.size, force_saveable_type);
        }

        let url = URL.createObjectURL(blob);

        // https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS#Valid Namespace URIs
        // 此处不要修改http协议为https, namespace URI仅支持4种固定写法
        let save_link = document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "a"
        );
        save_link.href = url;
        save_link.download = filename;
        save_link.rel = "noopener"; // tabnabbing
        click(save_link);
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1e4); // 10s
      }

      function rightSave(filename, filecontent) {
        let blob = new Blob([filecontent], { type: "text/plain" });

        saveAs(blob, filename);
      }
      rightSave(filename, filecontent);
    },
  },
};
</script>

<style lang="less" scoped>
.job-log-panel {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0 20px;
  background-color: var(--backgroundColor);
  color: var(--fontColor);
  overflow: auto;
  font-size: 16px;
  line-height: 24px;
  box-sizing: border-box;
  .log-panel-export {
    position: absolute;
    right: 10px;
    top: 10px;
    padding: 0px 5px;
    font-size: 13px;
    border: 1px solid #cacaca;
    border-radius: 5px;
    cursor: pointer;
  }
  p {
    white-space: break-spaces;
    word-break: break-all;
    margin: 0;
  }
  .flicker-cursor {
    background: #1d1f20;
    width: 100%;
    border-left: 0.1em solid transparent;

    animation: cursor 1s infinite;
  }
  @keyframes cursor {
    50% {
      border-color: white;
    }
  }
}
</style>
