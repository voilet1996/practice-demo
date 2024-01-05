<template>
  <div
    ref="logPanel"
    class="log-panel"
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
import { queryLogById } from "../../../base/Req";
import { ELEMENT_STATE } from "../../static";
export default {
  name: "RunningLogPanel",
  data() {
    return {
      timeout: null,
      contents: "",
      timeGap: 1000,
      processId: "",
    };
  },
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
    this.etlManager.on("etl.service.procssId.update", ({ processId }) => {
      console.log(
        `[RunningLogPanel]<etl.service.procssId.update> 监听到etl后台进程变化[${processId}], 开始启动日志轮询`
      );
      this.initBpmnState();
      this.etlManager.showAttributePanel();
      this.etlManager.setAttributePanelType("RunningLogPanel");
      // 请求时间间隔要求 1s 5s 10s 10s ...
      this.timeGap = 1000;
      this.processId = processId;
      this.queryLog(processId);
    });
  },
  mounted() {},
  methods: {
    /**
     * @description 日志请求
     */
    async queryLog(etlId) {
      try {
        console.log(
          `[RunningLogPanel]<queryLog> etl请求运行结果(${Date.now()})...`
        );
        let res = await queryLogById(etlId);
        if (res.data[0].data.etlExecutionStatus === "running") {
          //正在运行中
          //隔10s进行轮询
          this.timeout = setTimeout(() => {
            this.queryLog(etlId);
          }, this.timeGap);
          if (this.timeGap === 1000) {
            this.timeGap = 5000;
          } else if (this.timeGap === 5000) {
            this.timeGap = 10000;
          }
        } else if (
          res.data[0].data.etlExecutionStatus === "success" ||
          res.data[0].data.etlExecutionStatus === "error" ||
          res.data[0].data.etlExecutionStatus === "failure" ||
          res.data[0].data.etlExecutionStatus === "unRun"
        ) {
          //运行成功或失败
          this.timeout = null;
          console.log(
            `[RunningLogPanel]<queryLog> etl后台运行进程已经结束，运行结果为${res.data[0].data.etlExecutionStatus}`
          );
        }
        //更新bpmn步骤的状态
        let taskExecutions = res.data[0].data.taskExecutions;
        taskExecutions.forEach((item) => {
          let state;

          switch (item.executionStatus) {
            case "success":
              state = ELEMENT_STATE.SUCCESS;
              break;
            case "running":
              state = ELEMENT_STATE.RUNNING;
              break;
            default:
              state = ELEMENT_STATE.FAILED;
              break;
          }

          //设置状态+重渲染bpmn
          let bpmnElement = this.etlManager.getBpmnElement(item.taskId);
          if (bpmnElement) {
            bpmnElement.businessObject.runningTime = item.executionTime
              ? (item.executionTime / 1000).toFixed(2)
              : "-";
          }
          this.etlManager.setBpmnElementState(item.taskId, state);
          console.log(
            `[RunningLogPanel]<queryLog> 任务轮询结果 [${item.taskId}]: ${state}`
          );
        });
        this.contents = res.data[0].data.etlLog;
        //滚动条滚到最底部
        let logPanelDom = this.$refs.logPanel;
        logPanelDom.scrollTop = logPanelDom.scrollHeight;
      } catch (e) {
        console.error(`[RunningLogPanel]<queryLog> ERROR: ${e}`);
      }
    },
    /**
     * @description 刚开始初始化 bpmn步骤的状态 为未执行
     */
    initBpmnState() {
      let allElements = this.etlManager.getAllBpmnElement();
      allElements.forEach((item) => {
        //设置状态+重渲染bpmn
        this.etlManager.setBpmnElementState(item.id, ELEMENT_STATE.READY);
      });
    },
    /**
     * @description 导出日志
     */
    exportLog() {
      this.saveFile(`日志ID[${this.processId}].log`, this.contents);
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
.log-panel {
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
