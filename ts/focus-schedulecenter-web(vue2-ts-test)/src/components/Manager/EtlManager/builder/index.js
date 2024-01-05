import { CustomPluginBuilder } from "framework-bpmn"

// const config = {
//   // 组件名称 要求 pluginName === attributePanel.panel.name === bpmnPluginConfig.businessType
//   pluginName: "mappingTask",
//   // 属性面板配置项
//   attributePanel: {
//     // 属性面板的容器
//     panel: mappingTaskAttributePanel,
//     // 属性面板的校验逻辑
//     validator: mappingTaskAttributeRule,
//   },
//   bpmnPlugin: {
//     // bpmn 标准对应标签
//     bpmnType: "bpmn:ServiceTask",
//     // 组件业务类型
//     businessType: "mappingTask",
//     // 控制条/点击操作台 分组类型 一般都是model
//     group: "model",
//     // 控制条/点击操作台 className 用于配置背景图
//     className: "fusion-bpmn-mapping-task",
//     // 控制条/点击操作台 鼠标hover时显示的文本
//     businessLabel: "映射",
//     // 组件对应xml写入的kv属性对
//     xmlConfig: {
//       "flowable:class": "com.gwssi.focus.schedulecenter.flow.ServiceTaskExecutor",
//     },
//     // 组件拖拽到画布上的渲染配置
//     rendererConfig: {
//       // 直接渲染的svg文本，也可以用url替换，url的优先级低于svgText;
//       // 如配置url，若url是svg则返回的时候会读取svg内容，类似设置svgText;如果不是svg类型，则直接生成image标签，image标签不能设置状态颜色
//       svgText: `<svg t="1629352679859" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16170" xmlns:xlink="http://www.w3.org/1999/xlink" width="48" height="48"><defs><style type="text/css"></style></defs><path d="M894.85 120.49H591.8a30.9 30.9 0 0 0-30.87 30.87V476.2H473V151.36a30.9 30.9 0 0 0-30.87-30.87h-303a30.9 30.9 0 0 0-30.87 30.87v704.33a30.9 30.9 0 0 0 30.87 30.87h303.05A30.9 30.9 0 0 0 473 855.69V534.3h87.88v321.39a30.9 30.9 0 0 0 30.87 30.87H895a30.63 30.63 0 0 0 30.69-31.8v-703.4a30.9 30.9 0 0 0-30.84-30.87z m-479.91 708H166.37V178.6h248.57z m452.67 0H619V178.6h248.61z" p-id="16171"></path><path d="M261.51 440.07h58.1v130.19h-58.1zM714.36 440.07h58.1v130.19h-58.1z" p-id="16172"></path></svg>`,
//       // 渲染元素的坐标和尺寸
//       attr: {
//         // 图形左位移 默认 0
//         x: 0,
//         // 图形左位移 默认 0
//         y: 0,
//         // 图形宽度 默认 48
//         width: 48,
//         // 图形高度 默认 48
//         height: 48,
//       },
//     },
//   },
// }

const pluginBuilder = (config) => {
  const { pluginName, attributePanel, bpmnPlugin } = config
  // TODO 各种校验我都懒得加了 name 强制一直的我都没写入
  let plugin = { pluginName, attributePanel }
  if (bpmnPlugin) {
    plugin["bpmnPlugin"] = CustomPluginBuilder(bpmnPlugin)
    plugin["customPalette"] = {
      label: bpmnPlugin.businessLabel,
      className: bpmnPlugin.className,
      group: bpmnPlugin.group,
    }
  }
  return plugin
}

export default pluginBuilder
