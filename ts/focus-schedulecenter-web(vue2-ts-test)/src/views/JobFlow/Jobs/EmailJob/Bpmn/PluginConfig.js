const pluginConfig = {
  bpmnType: "bpmn:ServiceTask",
  businessType: "EmailJob",
  group: "model",
  className: "iconfont icon-zuocedaohang_youjianrenwu",
  businessLabel: "邮件任务",
  xmlConfig: {
    "flowable:class": "com.gwssi.focus.schedulecenter.flow.ServiceTaskExecutor",
  },
  rendererConfig: {
    url: {
      failed: "img/bpmn/addColumnTask_failed.svg",
      success: "img/bpmn/addColumnTask_success.svg",
      ready: "img/bpmn/addColumnTask_ready.svg",
      running: "img/bpmn/addColumnTask_running.svg",
    },
    attr: { x: 0, y: 0, width: 105, height: 80 },
  },
}

export default pluginConfig
