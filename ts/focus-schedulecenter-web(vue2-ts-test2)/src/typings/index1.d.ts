// import { EChartsOption } from 'echarts/types/dist/shared'
// import {
//     // 柱状图
//     BarSeriesOption,
//     // 折线/面积图
//     LineSeriesOption,
//     PieSeriesOption,
// } from 'echarts/charts'
// import {
//     // 标题组件
//     TitleComponentOption,
//     // 提示框组件
//     TooltipComponentOption,
//     // 直角坐标系内绘图网格组件
//     GridComponentOption,
//     DatasetComponentOption,
// } from 'echarts/components'
// import { ComposeOption } from 'echarts/core'
// // ...
// import { XAXisOption, YAXisOption } from 'echarts/types/dist/shared'
// import { XAXisComponentOption, YAXisComponentOption } from 'echarts'

type Type2 = {}
declare var bdddd: number
interface ITableColumnObject {
    label: string
    prop: string
    width?: string
    codeArr?: ISelect[]
    isChangeCode?: string
}
interface ItableColumn {
    [index: number]: {
        label: string
        prop: string
        width?: string
        codeArr?: ISelect[]
        isChangeCode?: string
    }
}
interface ITableData {
    page: number
    pagerows: number
    rows: any[]
    totalrows: number
}

interface ISelect {
    text: string
    value: string | number
}
interface ITableData {
    page: number
    pagerows: number
    rows: any[]
    totalrows: number
}
interface IAxis {
    type: string
    data?: (string | number)[]
}
// echarts的option类型定义
// type ECOption = ComposeOption<
//     | TitleComponentOption
//     | TooltipComponentOption
//     | XAXisComponentOption
//     | YAXisComponentOption
//     | BarSeriesOption
//     | LineSeriesOption
//     | PieSeriesOption
// >
type IPageForm = {
    jobName: string
    id: string
    timeRange: any[]
}
interface IDisplayBlocks {
    text: string
    leftBackground: string
    rightBackground: string
    data: any[] | string
}
