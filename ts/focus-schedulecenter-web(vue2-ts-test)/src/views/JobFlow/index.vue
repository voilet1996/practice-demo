<template>
    <etl-manager
        :extendedPlugins="extendedPlugins"
        :mode="mode"
        :is-open-custom-palette="isOpenCustomPalette"
        :etl-id="etlId"
    />
</template>

<script>
import EtlManager from '@com/Manager/EtlManager'
import EtlPluginBuilder from '@com/Manager/EtlManager/builder'
import {
    CodeEditorAttributePanel,
    BasicInfoAttributePanel,
    RunningLogAttributePanel,
    JobLogAttributePanel,
    EtlJobAttributePanel,
    SequenceFlowAttributePanel,
    EmailJobAttributePanel,
    SqlJobAttributePanel,
    ShellJobAttributePanel,
    BeanJobAttributePanel,
    HttpJobAttributePanel,
} from '@com/Manager/base/attrubitePanel'

import {
    // Plugin - Event (default registerd in FusionBpmnBasicEditor)
    FusionBpmnStartEvent,
    FusionBpmnEndEvent,
    FusionBpmnParallelGateway,
    FusionBpmnExclusiveGateway,
    FusionBpmnInclusiveGateway,
    FusionBpmnStartEventConfig,
    FusionBpmnEndEventConfig,
    FusionBpmnParallelGatewayConfig,
    FusionBpmnExclusiveGatewayConfig,
    FusionBpmnInclusiveGatewayConfig,
} from 'framework-bpmn'
import {
    FusionBpmnEtlJob,
    FusionBpmnEmailJob,
    FusionBpmnSqlJob,
    FusionBpmnShellJob,
    FusionBpmnBeanJob,
    FusionBpmnHttpJob,
    FusionBpmnEtlJobConfig,
    FusionBpmnEmailJobConfig,
    FusionBpmnSqlJobConfig,
    FusionBpmnShellJobConfig,
    FusionBpmnBeanJobConfig,
    FusionBpmnHttpJobConfig,
} from './BpmnManager'

const CodeEditor = {
    pluginName: 'codeEditor',
    attributePanel: CodeEditorAttributePanel,
}
const BasicInfo = {
    pluginName: 'basicInfo',
    attributePanel: BasicInfoAttributePanel,
}
const RunningLog = {
    pluginName: 'RunningLogPanel',
    attributePanel: RunningLogAttributePanel,
}
const JobLog = {
    pluginName: 'JobLogPanel',
    attributePanel: JobLogAttributePanel,
}
const SequenceFlow = {
    pluginName: 'Flow',
    attributePanel: SequenceFlowAttributePanel,
}
const EtlJob = {
    pluginName: 'ETLJob',
    bpmnPlugin: FusionBpmnEtlJob,
    attributePanel: EtlJobAttributePanel,
    customPalette: {
        label: FusionBpmnEtlJobConfig.businessLabel,
        className: FusionBpmnEtlJobConfig.className,
        group: '任务列表',
    },
}

const EmailJob = {
    pluginName: 'EmailJob',
    bpmnPlugin: FusionBpmnEmailJob,
    attributePanel: EmailJobAttributePanel,
    customPalette: {
        label: FusionBpmnEmailJobConfig.businessLabel,
        className: FusionBpmnEmailJobConfig.className,
        group: '任务列表',
    },
}
const SqlJob = {
    pluginName: 'SQLJob',
    bpmnPlugin: FusionBpmnSqlJob,
    attributePanel: SqlJobAttributePanel,
    customPalette: {
        label: FusionBpmnSqlJobConfig.businessLabel,
        className: FusionBpmnSqlJobConfig.className,
        group: '任务列表',
    },
}
const ShellJob = {
    pluginName: 'ShellJob',
    bpmnPlugin: FusionBpmnShellJob,
    attributePanel: ShellJobAttributePanel,
    customPalette: {
        label: FusionBpmnShellJobConfig.businessLabel,
        className: FusionBpmnShellJobConfig.className,
        group: '任务列表',
    },
}
const BeanJob = {
    pluginName: 'BeanJob',
    bpmnPlugin: FusionBpmnBeanJob,
    attributePanel: BeanJobAttributePanel,
    customPalette: {
        label: FusionBpmnBeanJobConfig.businessLabel,
        className: FusionBpmnBeanJobConfig.className,
        group: '任务列表',
    },
}
const HttpJob = {
    pluginName: 'HttpJob',
    bpmnPlugin: FusionBpmnHttpJob,
    attributePanel: HttpJobAttributePanel,
    customPalette: {
        label: FusionBpmnHttpJobConfig.businessLabel,
        className: FusionBpmnHttpJobConfig.className,
        group: '任务列表',
    },
}

export default {
    data() {
        return {
            mode: 'prue',
            extendedPlugins: [
                {
                    pluginName: FusionBpmnStartEventConfig.businessType,
                    bpmnPlugin: FusionBpmnStartEvent,
                    customPalette: {
                        label: FusionBpmnStartEventConfig.businessLabel,
                        className: FusionBpmnStartEventConfig.className,
                        group: '流程',
                    },
                },
                {
                    pluginName: FusionBpmnEndEventConfig.businessType,
                    bpmnPlugin: FusionBpmnEndEvent,
                    customPalette: {
                        label: FusionBpmnEndEventConfig.businessLabel,
                        className: FusionBpmnEndEventConfig.className,
                        group: '流程',
                    },
                },
                //注册的时候需要注意：属性面板需要写在属性面版区域，顺序决定了页面上tab展示的顺序

                //ETL基本信息
                BasicInfo,

                // 流程日志
                RunningLog,

                // 流程编辑
                SequenceFlow,

                EtlJob, //etl任务
                EmailJob, //邮件任务
                SqlJob, //Sql任务
                ShellJob, //Shell任务
                BeanJob, //Bean任务
                HttpJob, //Http任务

                //Job日志
                JobLog,

                // 使用 EtlManagerBuilder 构建组件
                // myUnitConvertTask,
                {
                    pluginName: FusionBpmnParallelGatewayConfig.businessType,
                    bpmnPlugin: FusionBpmnParallelGateway,
                    customPalette: {
                        label: FusionBpmnParallelGatewayConfig.businessLabel,
                        className: FusionBpmnParallelGatewayConfig.className,
                        group: '流程',
                    },
                },
                {
                    pluginName: FusionBpmnInclusiveGatewayConfig.businessType,
                    bpmnPlugin: FusionBpmnInclusiveGateway,
                    customPalette: {
                        label: FusionBpmnInclusiveGatewayConfig.businessLabel,
                        className: FusionBpmnInclusiveGatewayConfig.className,
                        group: '流程',
                    },
                },
                {
                    pluginName: FusionBpmnExclusiveGatewayConfig.businessType,
                    bpmnPlugin: FusionBpmnExclusiveGateway,
                    customPalette: {
                        label: FusionBpmnExclusiveGatewayConfig.businessLabel,
                        className: FusionBpmnExclusiveGatewayConfig.className,
                        group: '流程',
                    },
                },

                // 代码展示器
                CodeEditor,
            ],
            etlId: undefined,
            isOpenCustomPalette: true,
        }
    },
    created() {
        let params = new window.URLSearchParams(location.href.split('?')[1])
        this.etlId = params.get('scheduleId') || ''
        this.isOpenCustomPalette = params.get('isOpen') == '0' ? false : true
    },
    components: { EtlManager },
}
</script>
