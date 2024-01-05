import CodeEditorPanel from "./CodeEditor"
import BasicInfoPanel from "./BasicInfoPanel"
import RunningLogPanel from "./RunningLogPanel"
import SequenceFlowPanel from "./SequenceFlowPanel"
import JobLogPanel from "./JobLogPanel"

import EtlJobPanel from "@views/JobFlow/Jobs/EtlJob/AttributePanel"
import EmailJobPanel from "@views/JobFlow/Jobs/EmailJob/AttributePanel"
import SqlJobPanel from "@views/JobFlow/Jobs/SqlJob/AttributePanel"
import ShellJobPanel from "@views/JobFlow/Jobs/ShellJob/AttributePanel"
import BeanJobPanel from "@views/JobFlow/Jobs/BeanJob/AttributePanel"
import HttpJobPanel from "@views/JobFlow/Jobs/HttpJob/AttributePanel"

import EtlJobRule from "@views/JobFlow/Jobs/EtlJob/AttributePanel/rules.js"
import EmailJobRule from "@views/JobFlow/Jobs/EmailJob/AttributePanel/rules.js"
import SqlJobRule from "@views/JobFlow/Jobs/SqlJob/AttributePanel/rules.js"
import ShellJobRule from "@views/JobFlow/Jobs/ShellJob/AttributePanel/rules.js"
import BeanJobRule from "@views/JobFlow/Jobs/BeanJob/AttributePanel/rules.js"
import HttpJobRule from "@views/JobFlow/Jobs/HttpJob/AttributePanel/rules.js"

export const EtlJobAttributePanel = {
  config: {
    label: "属性面板",
    isLocked: false,
    isStatic: false,
  },
  panel: EtlJobPanel,
  validator: EtlJobRule,
}

export const CodeEditorAttributePanel = {
  config: {
    label: "源代码",
    desc: "实时代码状态查询",
    isLocked: true,
    isStatic: false,
  },
  panel: CodeEditorPanel,
}
export const BasicInfoAttributePanel = {
  config: {
    label: "工作流基本信息",
    desc: "工作流基本信息展示",
    isLocked: true,
    isStatic: false,
  },
  panel: BasicInfoPanel,
}
export const RunningLogAttributePanel = {
  config: {
    label: "流程日志",
    isLocked: true,
    isStatic: true,
  },
  panel: RunningLogPanel,
}

export const JobLogAttributePanel = {
  config: {
    label: "Job日志",
    isLocked: false,
    isStatic: true,
  },
  panel: JobLogPanel,
}
export const SequenceFlowAttributePanel = {
  config: {
    label: "属性面板",
    isLocked: false,
    isStatic: false,
    isBpmn: true,
  },
  panel: SequenceFlowPanel,
}
export const EmailJobAttributePanel = {
  config: {
    label: "属性面板",
    isLocked: false,
    isStatic: false,
  },
  panel: EmailJobPanel,
  validator: EmailJobRule,
}
export const SqlJobAttributePanel = {
  config: {
    label: "属性面板",
    isLocked: false,
    isStatic: false,
  },
  panel: SqlJobPanel,
  validator: SqlJobRule,
}
export const ShellJobAttributePanel = {
  config: {
    label: "属性面板",
    isLocked: false,
    isStatic: false,
  },
  panel: ShellJobPanel,
  validator: ShellJobRule,
}
export const BeanJobAttributePanel = {
  config: {
    label: "属性面板",
    isLocked: false,
    isStatic: false,
  },
  panel: BeanJobPanel,
  validator: BeanJobRule,
}
export const HttpJobAttributePanel = {
  config: {
    label: "属性面板",
    isLocked: false,
    isStatic: false,
  },
  panel: HttpJobPanel,
  validator: HttpJobRule,
}
