<template>
    <div class="home">
        <div class="space"></div>
        <div class="top-wrapper">
            <div class="display-block">
                <div class="wrapper">
                    <div
                        class="block"
                        v-for="item in displayBlocks.slice(0, 2)"
                        :key="item.text"
                    >
                        <div
                            class="icon"
                            :style="{ background: item.leftBackground }"
                        ></div>
                        <div
                            class="text"
                            :style="{ background: item.rightBackground }"
                        >
                            <div class="data">{{ item.data }}</div>
                            <div>{{ item.text }}</div>
                        </div>
                    </div>
                </div>
                <div class="wrapper">
                    <div
                        class="block"
                        v-for="item in displayBlocks.slice(2)"
                        :key="item.text"
                    >
                        <div
                            class="icon"
                            :style="{ background: item.leftBackground }"
                        ></div>
                        <div
                            class="text"
                            :style="{ background: item.rightBackground }"
                        >
                            <div class="data">{{ item.data }}</div>
                            <div>{{ item.text }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="charts">
                <div class="line-chart"></div>
                <div class="round-chart"></div>
                <div class="select">
                    <fu-select v-model="time" size="mini" @change="timeChange">
                        <fu-option
                            v-for="item in timeOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.text"
                        ></fu-option>
                    </fu-select>
                    <fu-date-picker
                        size="mini"
                        :title="customDate"
                        v-if="time === 'custom'"
                        v-model="customDate"
                        type="datetimerange"
                        @change="customDateChange"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        range-separator="-"
                        start-placeholder="起始日期"
                        end-placeholder="截止日期"
                    ></fu-date-picker>
                </div>
            </div>
        </div>
        <div class="bottom-wrapper">
            <div class="query-header">
                <span>今日任务</span>
                <a
                    style="margin-left: 5px; color: #409eff"
                    @click="toJobScheduling"
                >
                    >>更多</a
                >
                <div class="query">
                    <fu-form :inline="true" size="mini">
                        <fu-form-item label="调度时间" label-width="100px">
                            <fu-date-picker
                                clearable
                                v-model="form.timeRange"
                                type="daterange"
                                value-format="yyyy-MM-dd"
                                range-separator="-"
                                start-placeholder="起始日期"
                                end-placeholder="截止日期"
                            ></fu-date-picker>
                        </fu-form-item>
                        <fu-form-item label="调度任务名称" label-width="130px">
                            <fu-input
                                clearable
                                v-model="form.jobName"
                                placeholder="名称"
                            ></fu-input>
                        </fu-form-item>

                        <fu-form-item label="编号" label-width="80px">
                            <fu-input
                                clearable
                                placeholder="编号"
                                v-model="form.id"
                            ></fu-input>
                        </fu-form-item>
                        <fu-form-item>
                            <fu-button
                                icon="el-icon-search"
                                type="success"
                                @click="tableSearch"
                                >查询</fu-button
                            >
                        </fu-form-item>
                    </fu-form>
                </div>
            </div>
            <div class="table">
                <fu-table border :fu-request="tableReq">
                    <fu-table-column
                        type="index"
                        label="序号"
                        width="55"
                        center
                    ></fu-table-column>
                    <fu-table-column
                        v-for="item in tableColumns"
                        :key="item.prop"
                        :label="item.label"
                        :prop="item.prop"
                        :min-width="item.width"
                        show-overflow-tooltip
                    >
                        <template slot-scope="scope">
                            <span
                                v-if="
                                    item.isChangeCode &&
                                    item.isChangeCode === 'true'
                                "
                                >{{
                                    tableChangeCode(
                                        scope.row[item.prop],
                                        item.codeArr
                                    )
                                }}</span
                            >
                            <span v-else>{{ scope.row[item.prop] }}</span>
                        </template>
                    </fu-table-column>
                    <fu-table-column label="操作" width="120"></fu-table-column>
                </fu-table>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    DatePicker,
    Form,
    FormItem,
    Input,
    Table,
    TableColumn,
    Button,
    Select,
    Option,
} from 'fusion-ui'
//新版本的echart需要这样引入才生效
// import { getDashboardInfo, getChartInfo } from '@utils/service'
import { getDashboardInfo, getChartInfo } from '../../utils/service'
import * as echarts from 'echarts'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
@Component({
    created() {
        this.queryBaseInfo()
        //请求chart信息
        this.queryChartInfo('1')
    },
    mounted() {
        let lineChartDom = document.querySelector('.line-chart')
        let rounChartDom = document.querySelector('.round-chart')
        this.drawChart(lineChartDom, this.dateOption)
        this.drawChart(rounChartDom, this.roundOption)
        // window.onresize = () => {
        //     echarts.init(lineChartDom).resize({
        //         width: lineChartDom.offsetWidth,
        //         height: lineChartDom.offsetHeight,
        //     })
        //     echarts.init(rounChartDom).resize({
        //         width: rounChartDom.offsetWidth,
        //         height: rounChartDom.offsetHeight,
        //     })
        // }
    },
    components: {
        FuDatePicker: DatePicker,
        FuForm: Form,
        FuFormItem: FormItem,
        FuInput: Input,
        FuTable: Table,
        FuTableColumn: TableColumn,
        FuButton: Button,
        FuSelect: Select,
        FuOption: Option,
    },
})
export default class Home extends Vue {
    // data
    private displayData = {
        jobLogCount: '60',
        jobInfoCount: '20',
        executorCount: '12',
    }
    private time: string = '1'
    private customDate: Array<any> = []
    private timeOptions: Array<any> = [
        { text: '今日', value: '1' },
        { text: '昨日', value: '2' },
        { text: '近一周', value: '3' },
        { text: '本月', value: '4' },
        { text: '上月', value: '5' },
        // { text: "未来三天", value: "5" },
        { text: '自定义', value: 'custom' },
    ]
    private tableColumns: Array<any> = [
        { label: '调度时间', prop: 'triggerTime', width: '100' },
        { label: '调度任务名称', prop: 'scheduleName', width: '100' },
        { label: '编号', prop: 'id', width: '180' },
        { label: '描述', prop: 'scheduleDesc', width: '100' },
        {
            label: '上次成功运行时间',
            prop: 'triggerLastTime',
            width: '100',
        },
        { label: 'Cron', prop: 'jobCron', width: '180' },
        { label: '任务数', prop: 'childTaskCount', width: '100' },
        { label: '创建人', prop: 'creatorName', width: '100' },
        {
            label: '状态',
            prop: 'status',
            width: '100',
            isChangeCode: 'true',
            codeArr: [
                { text: '等待执行', value: '0' },
                { text: '取消执行', value: '1' },
            ],
        },
    ]
    private tableData = {
        page: 1,
        pagerows: 10,
        rows: [],
        totalrows: 0,
    }

    //日期分布图
    private dateOption = {
        title: {
            text: '日期分布图',
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['成功', '失败', '进行中'],
        },
        xAxis: {
            type: 'category',
            data: [
                '2021-11-20',
                '2021-11-21',
                '2021-11-22',
                '2021-11-23',
                '2021-11-24',
            ],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                data: [150, 140, 130, 150, 135],
                type: 'line',
                name: '成功',
            },
            {
                data: [160, 110, 150, 170, 145],
                type: 'line',
                name: '失败',
            },
            {
                data: [170, 160, 190, 200, 170],
                type: 'line',
                name: '进行中',
            },
        ],
    }
    //成功比例图
    private roundOption = {
        title: {
            text: '成功比例图',
            subtext: '',
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
        },
        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 1048, name: '成功' },
                    { value: 735, name: '失败' },
                    { value: 580, name: '进行中' },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    }
    private form = {
        jobName: '',
        id: '',
        timeRange: [],
    }
    private queryForm = {
        jobName: '',
        id: '',
        timeRange: [],
    }

    get tableReq() {
        return {
            url: '/api/schedulecenter/v1/schedule-task/pageList.do',
            params: [
                {
                    name: 'params',
                    vtype: 'json',
                    data: {
                        jobName: this.queryForm.jobName,
                        id: this.queryForm.id,
                        startTime: this.queryForm.timeRange[0] || '',
                        endTime: this.queryForm.timeRange[1] || '',
                        createPerson: '',
                        flag: 'TODAY', // 1小时-HOURS；今天-TODAY；三天-THREE_DAY
                    },
                },
                {
                    vtype: 'pagination',
                    name: 'pagerows',
                    data: -1,
                },
                { vtype: 'pagination', name: 'totalrows', data: 0 },
                {
                    vtype: 'pagination',
                    name: 'page',
                    data: this.tableData.page,
                },
            ],
        }
    }
    get displayBlocks() {
        return [
            {
                text: '任务数量',
                leftBackground: 'rgb(120,111,178)',
                rightBackground: 'rgb(142,126,235)',
                data: this.displayData.jobInfoCount,
            },
            {
                text: '执行器数量',
                leftBackground: 'rgb(52,166,91)',
                rightBackground: 'rgb(13,197,69)',
                data: this.displayData.executorCount,
            },
            {
                text: '调度次数',
                leftBackground: 'rgb(90,171,197)',
                rightBackground: 'rgb(79,202,235)',
                data: this.displayData.jobLogCount,
            },
            // {
            //   text: "今日异常",
            //   leftBackground: "rgb(184,138,94)",
            //   rightBackground: "rgb(231,153,81)",
            //   data: this.displayData.errorJob,
            // },
        ]
    }

    tableSearch() {
        this.queryForm = JSON.parse(JSON.stringify(this.form))
    }
    async queryBaseInfo() {
        try {
            let res = await getDashboardInfo()
            if (res) {
                this.displayData = res.data[0].data
            }
        } catch (e) {
            // Message.error("新建任务失败！")
            console.log(e)
        }
    }
    async queryChartInfo(type, startDate = '', endDate = '') {
        try {
            let res = await getChartInfo(type, startDate, endDate)
            if (res) {
                let content = res.data[0].data.content
                this.dateOption.xAxis.data = content.triggerDayList
                this.dateOption.series[0].data = content.triggerDayCountSucList
                this.dateOption.series[1].data = content.triggerDayCountFailList
                this.dateOption.series[2].data =
                    content.triggerDayCountRunningList

                this.roundOption.series[0].data[0].value =
                    content.triggerCountSucTotal
                this.roundOption.series[0].data[1].value =
                    content.triggerCountFailTotal
                this.roundOption.series[0].data[2].value =
                    content.triggerCountRunningTotal
                let lineChartDom = document.querySelector('.line-chart')
                let rounChartDom = document.querySelector('.round-chart')
                this.drawChart(lineChartDom, this.dateOption)
                this.drawChart(rounChartDom, this.roundOption)
            }
        } catch (e) {
            // Message.error("新建任务失败！")
            console.log(e)
        }
    }
    customDateChange(val) {
        if (val.length !== 0) {
            this.queryChartInfo('', val[0], val[1])
        }
    }
    timeChange(val) {
        if (val === 'custom') {
            this.customDateChange(this.customDate)
        } else {
            this.queryChartInfo(val)
        }
    }
    drawChart(dom, option) {
        let myChart = echarts.init(dom)
        myChart.setOption(option)
    }
    toJobScheduling() {
        window.location.href = '/schedulecenter/#/JobScheduling'
    }
    // 表格转码
    tableChangeCode(data, arr) {
        if (data) {
            let res = ''
            let filArr = arr.filter((item) => item.value === data.trim())
            res = filArr.length === 1 ? filArr[0].text : data
            return res
        }
    }
}
</script>
<style lang="less" scoped>
.home {
    width: 100%;
    height: 100%;
    .space {
        height: 10px;
    }
    .top-wrapper {
        display: flex;
        width: 100%;
        height: calc(35% - 10px);
        min-width: 1200px;
        min-height: 260px;
        // margin-top: 10px;

        .display-block {
            width: 650px;
            height: 100%;
            padding: 50px 0 50px 50px;
            border-right: 0.5px solid #c4cbcf;
            box-sizing: border-box;
            .wrapper {
                display: flex;
                .block {
                    width: 250px;
                    height: 90px;
                    margin: 0 40px 30px 0;
                    display: flex;
                    .icon {
                        width: 90px;
                        height: 100%;
                    }
                    .text {
                        width: 160px;
                        height: 100%;
                        text-align: center;
                        font-size: 19px;
                        color: white;
                        font-weight: bolder;
                        .data {
                            height: 20px;
                            margin-top: 18px;
                            margin-bottom: 9px;
                        }
                    }
                }
            }
        }
        .charts {
            flex: 1;
            height: 100%;
            display: flex;
            margin-left: 20px;
            margin-top: 20px;
            position: relative;
            min-width: 600px;
            .line-chart {
                width: 63%;
                height: 100%;
            }
            .round-chart {
                width: 23%;
                height: 100%;
            }
            .select {
                position: absolute;
                top: 0;
                right: 20px;
                /deep/.el-date-editor {
                    width: 200px;
                }
                /deep/.el-select {
                    width: 200px;
                    display: block;
                    margin-bottom: 20px;
                }
            }
        }
    }
    .bottom-wrapper {
        // width: 100%;
        box-sizing: border-box;
        min-width: 1200px;

        height: calc(65% - 10px);
        margin: 10px 20px 0 20px;
        border: 1px solid #c4cbcf;
        .query-header {
            height: 40px;
            position: relative;
            padding: 10px;
            .query {
                position: absolute;
                right: 0;
                top: 10px;
            }
        }
        .table {
            //表格实现滚动条
            height: calc(100% - 60px);
            div:first-child {
                height: 100%;
                /deep/.el-table {
                    height: 100%;
                    .el-table__body-wrapper {
                        height: calc(100% - 48px);
                        overflow-y: auto;
                    }
                }
            }
        }
    }
}
</style>
