<template>
  <div
    class="etl-manager-container"
    v-loading="isLoading"
    :style="{
      '--mainThemeColor': mainThemeColor,
      '--contentPadBackgroundColor': contentPadBackgroundColor,
      '--contentPadBorderColor': contentPadBorderColor,
      '--contentPadSvgColor': contentPadSvgColor,
      '--contentPadHoverBorderColor': contentPadHoverBorderColor,
      '--contentPadgHoverBackroundColor': contentPadgHoverBackroundColor,
      '--isHideBpmnPalette': isOpenCustomPalette ? 'none' : 'block',
      '--isHideCustomPalette': isOpenCustomPalette ? 'block' : 'none',
      '--canvasLeft': isShowCustomPalette ? paletteWidth : '0px',
      '--paletteWidth': paletteWidth,
      '--paletteResizeLeft': paletteResizeLeft,
      '--paletteLeft': paletteLeft,
      '--toggleLeft': toggleLeft,
      '--attrPanelHeight': attrPanelHeight,
      '--attrPanelVisableHeight': isShowAttibutePanel ? attrPanelHeight : '0px',
      '--tooltipTextColor': tooltipTextColor,
      '--panelBorderColor': panelBorderColor,
      '--panelTextColorDefault': panelTextColorDefault,
      '--panelBackgroundDefault': panelBackgroundDefault,
      '--panelTextColorSelected': panelTextColorSelected,
      '--panelBackgroundSelected': panelBackgroundSelected,
    }"
  >
    <!-- bpmn 画布容器 -->
    <div class="etl-manager-canvas" ref="cvs"></div>
    <!-- bpmn 第三方属性面板 -->
    <!-- <div id="js-properties-panel"></div> -->
    <!-- bpmn 右键 contextmenu -->
    <div
      class="etl-manager-contextmenu"
      ref="contextmenu"
      v-show="contextmenuConfig.isShow"
      :style="{
        top: contextmenuConfig.top + 'px',
        left: contextmenuConfig.left + 'px',
      }"
    >
      <div class="ctx-connect" @click="ctxmenuConnection">连线</div>
      <div class="ctx-annotation" @click="ctxmenuAnnotation">备注</div>
      <hr />
      <div class="ctx-edit" @click="ctxmenuEdit">编辑</div>
      <div class="ctx-copy" @click="ctxmenuCopy">复制<span>Ctrl + C</span></div>
      <div class="ctx-paste" @click="ctxmenuPaste">
        粘贴<span>Ctrl + V</span>
      </div>
      <div class="ctx-delete" @click="ctxmenuDelete">
        删除<span>Delete</span>
      </div>
      <hr />
      <div class="ctx-runto disable" @click="ctxmenuRunto">运行至此步</div>
      <!-- <div class="ctx-output" @click="ctxmenuOutput">输出预览</div> -->
    </div>
    <!-- etl 模拟 bpmn palette 容器 最左边那个 -->
    <div class="etl-manager-palette" :class="isShowCustomPalette ? '' : 'hide'">
      <!-- 第一版收起按钮 -->
      <!-- <div class="etl-manager-palette-toggle" @click="customPaletteToggle">
        <i></i>
      </div> -->
      <div class="palette-resize-bar"></div>

      <div class="etl-manager-palette-container">
        <template v-for="(group, index) in customPaletteList">
          <div :key="index" class="etl-manager-palette-group">
            <div
              class="etl-manager-palette-group-title"
              v-if="group[0] !== 'Default'"
            >
              <i
                class="iconfont icon-shouqisanjiaoxia"
                @click="controlPalette(index)"
              ></i>
              {{ group[0] }} ({{ group[1] }})
            </div>
            <div
              class="etl-manager-palette-group-wrapper"
              :style="{ height: computeHeight(group[1]) }"
            >
              <div
                v-for="(config, index) in extendedCustomPaletteMap.get(
                  group[0]
                )"
                :key="index"
                class="etl-manager-palette-group-btn"
                @mousedown="customPaletteBtnClick(config.className)"
                @click="customPaletteBtnClick(config.className)"
              >
                <span
                  class="custom-palette-group-icon"
                  :class="config.className"
                ></span>
                <span class="custom-palette-group-label">{{
                  config.label
                }}</span>
              </div>
            </div>
          </div>
        </template>
        <div class="occupy-space-div"></div>
      </div>
    </div>
    <div class="etl-manager-right-toolbar">
      <a href="javascript:" title="放大(CTRL+滚轮向上)" @click="zoomin"
        ><span class="icon r-btn zoomin"></span
      ></a>
      <a href="javascript:" title="缩小(CTRL+滚轮向下)" @click="zoomout"
        ><span class="icon r-btn zoomout"></span
      ></a>
    </div>
    <!-- etl 工具条 最顶上那条 -->
    <div class="etl-manager-toolbar">
      <div style="margin-right: auto; margin-left: 12px">
        <h2 style="height: 50%; margin: 0">
          {{ this.basicInfo.scheduleName }}
        </h2>
        <h5 style="height: 50%; margin: 0; margin-top: -8px">
          {{ this.basicInfo.scheduleDesc }}
        </h5>
      </div>
      <a
        :class="{
          'etl-manager-toolbar-btn': true,
          disabled: etlMode === 'view',
        }"
        href="javascript:"
        @click="saveEtlTask"
        title="保存"
      >
        <span
          class="icon myicon myicon-save iconfont icon-daohang_baocun"
        ></span>
        <span class="etl-manager-toolbar-text">保存</span>
      </a>

      <!-- <a
        :class="{
          'etl-manager-toolbar-btn': true,
          disabled: etlMode === 'view',
        }"
        href="javascript:"
        @click="validateEtlTask"
        title="校验"
        ><span
          class="icon myicon myicon-yanzheng iconfont icon-daohang_xiaoyan"
        ></span>
        <span class="etl-manager-toolbar-text">校验</span></a
      > -->

      <a
        :class="{
          'etl-manager-toolbar-btn': true,
          disabled: etlMode === 'view',
        }"
        href="javascript:"
        @click="debugEtlTask"
        title="调试"
        ><span
          class="
            icon
            myicon
            myicon-ico_yunhang_xuanzhong
            iconfont
            icon-icon-tiaoshi
          "
        ></span>
        <span class="etl-manager-toolbar-text">调试</span></a
      >
      <!-- <a
        :class="{
          'etl-manager-toolbar-btn': true,
          disabled: etlMode === 'view',
        }"
        href="javascript:"
        @click="endRunningTask"
        title="终止运行"
        ><span
          class="
            icon
            myicon
            myicon-ico_yunhang_xuanzhong
            iconfont
            icon-daohang_tingzhiyunhang
          "
        ></span>
        <span class="etl-manager-toolbar-text">终止运行</span></a -->
      <!-- > -->
      <!-- <span href="javascript:" class="etl-manager-split"></span> -->

      <!-- <a
        class="etl-manager-toolbar-btn disable"
        href="javascript:"
        ref="saveSvg"
        @click="undo"
        title="撤销"
        ><span class="icon myicon myicon-chexiao"></span>
        <span class="etl-manager-toolbar-text">撤销</span></a
      >

      <a
        class="etl-manager-toolbar-btn disable"
        href="javascript:"
        ref="saveSvg"
        @click="redo"
        title="重做"
        ><span class="icon myicon myicon-arrow-redo-outline"></span>
        <span class="etl-manager-toolbar-text">重做</span></a
      > -->

      <!-- <span href="javascript:" class="etl-manager-split"></span> -->

      <!-- <a
        class="etl-manager-toolbar-btn"
        href="javascript:"
        @click="$refs.refFile.click()"
        title="加载本地BPMN文件"
        ><span class="icon myicon myicon-shangchuan"></span>
        <span class="etl-manager-toolbar-text">加载文件</span>
      </a>
      <input
        type="file"
        id="files"
        ref="refFile"
        style="display: none"
        @change="uploadFile"
      />

      <a
        class="etl-manager-toolbar-btn"
        href="javascript:"
        @click="saveFile('bpmn')"
        title="保存为BPMN文件"
        ><span class="icon myicon myicon-download-1-copy"></span>
        <span class="etl-manager-toolbar-text">保存BPMN</span>
      </a>

      <a
        class="etl-manager-toolbar-btn"
        href="javascript:"
        @click="saveFile('xml')"
        title="保存为XML文件"
        ><span class="icon myicon myicon-XMLbaowen"></span>
        <span class="etl-manager-toolbar-text">保存XML</span>
      </a>

      <a
        class="etl-manager-toolbar-btn"
        href="javascript:"
        ref="saveSvg"
        @click="saveSvg"
        title="保存为SVG图片"
        ><span class="icon myicon myicon-SVG"></span>
        <span class="etl-manager-toolbar-text">保存SVG</span>
      </a> -->
    </div>
    <!-- etl 蒙版 没和属性面板放一起是因为怕未来可能会独立展示 -->
    <div
      class="etl-manager-mask"
      :class="isShowMask ? 'show' : ''"
      @click="hideAttrPanel"
    ></div>
    <!-- etl 属性面板 -->
    <div
      class="attr-panel-container"
      :class="isShowAttibutePanel ? 'show' : ''"
    >
      <!-- etl 属性面板 顶部按钮区域 -->
      <div class="attribute-resize-bar"></div>
      <div class="attr-panel-btn-container">
        <div
          class="
            attr-panel-btn attr-panel-toggle-btn
            iconfont
            icon-shouqisanjiaoxia
          "
          title="收起属性面板"
          @click="hideAttrPanel"
        >
          &nbsp;
        </div>
        <template v-for="key in extendedAttrPanelMap.keys()">
          <div
            v-show="
              extendedAttrPanelMap.get(key)['config'] &&
              (extendedAttrPanelMap.get(key)['config']['isLocked'] == true ||
                extendedAttrPanelMap.get(key)['config']['isShow'] == true)
            "
            :name="key"
            :key="key"
            :title="
              extendedAttrPanelMap.get(key)['config']['desc'] ||
              extendedAttrPanelMap.get(key)['config']['label']
            "
            class="attr-panel-btn"
            :class="
              isShowAttibutePanel && currentAttributePanelKey === key
                ? 'selected'
                : ''
            "
            @click="clickAttrPanel(key)"
          >
            {{ extendedAttrPanelMap.get(key)["config"]["label"] }}
          </div>
        </template>
      </div>
      <!-- etl 属性面板 底部面板区域 -->
      <div class="attr-panel">
        <template v-for="key in extendedAttrPanelMap.keys()">
          <div
            v-if="extendedAttrPanelMap.get(key)['config']['isStatic']"
            v-show="currentAttributePanelKey === key"
            :key="key"
            :is="key"
            :etl-manager="getThis()"
            :bpmn-id="currentBpmnElementId"
            :business-instance="businessInstanceMap[currentBpmnElementId]"
          ></div>
        </template>
        <div
          v-if="!currentAttributePanelTypeIsStatic"
          :is="currentAttributePanelName"
          :etl-manager="getThis()"
          :bpmn-id="currentBpmnElementId"
          :business-instance="businessInstanceMap[currentBpmnElementId]"
        ></div>
      </div>
    </div>

    <!-- 注册箭头样式  START -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <marker
          id="sequenceflow-arrow-end"
          viewBox="0 0 20 20"
          refX="11"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path
            d="M 1 5 L 11 10 L 1 15 Z"
            style="
              fill: black;
              stroke-width: 1px;
              stroke-linecap: round;
              stroke-dasharray: 10000, 1;
              stroke: black;
            "
          ></path>
        </marker>
      </defs>
    </svg>
    <!-- 注册箭头样式  END -->
  </div>
</template>

<script>
import Vue from "vue";
// BpmnManager
import { FusionBpmnBasicEditor, FusionBpmnPureEditor } from "framework-bpmn";
// BpmnManger Plugin style
import "diagram-js-minimap/assets/diagram-js-minimap.css";
// BpmnManger Plugin
import minimapModule from "diagram-js-minimap";

// ETLManger Blank Attribute Panel
import BlankPanel from "./../base/attrubitePanel/BlankPanel";

// ETLManager default registered Attribute panel
import {
  MappingTaskAttributePanel,
  TableSinkTaskAttributePanel,
  TableSourceTaskAttributePanel,
  UnionTaskAttributePanel,
  UnitConvertTaskAttributePanel,
} from "./../base/attrubitePanel";

// BusinessInstance
import ServiceTaskInstance from "./../base/businessInstance/ServiceTaskInstance";

// API
import {
  saveEtlTask,
  loadEtlTask,
  executeEtlTask,
  endEtlTask,
  queryEtlTaskById,
} from "./../base/Req";

import { ColorPicker } from "fusion-ui";

import { ELEMENT_STATE } from "../base/static";

import KeyEvent from "../base/util/KeyEvent";

// BpmnType to BusinessInstance Map
const BPMN_TYPE_TO_BUSINESS_INSTANCE = {
  "bpmn:ServiceTask": ServiceTaskInstance,
};

// 支持多状态的bpmn类型，用来改色的
const MULTI_STATE_BPMN_TYPE = [
  "bpmn:ServiceTask",
  "bpmn:StartEvent",
  "bpmn:EndEvent",
];
// 基础款bpmnManager控制器默认上面的palette按钮
const DEFAULT_PALETTE_LIST = [
  {
    label: "移动",
    className: "iconfont bpmn-icon-hand-tool",
  },
  {
    label: "框选",
    className: "iconfont bpmn-icon-lasso-tool",
  },
  {
    label: "连线",
    className: "iconfont bpmn-icon-connection-multi",
  },
];
// // 基础款bpmnManager控制器默认添加的palette按钮
// const BASIC_BPMN_MANAGER_PALETTE_LIST = [
//   {
//     label: "开始",
//     className: "fusion-bpmn-start-event",
//   },
//   {
//     label: "结束",
//     className: "fusion-bpmn-end-event",
//   },
//   "line",
//   {
//     label: "表输入",
//     className: "fusion-bpmn-table-source-task",
//   },
//   {
//     label: "单位转换",
//     className: "fusion-bpmn-unit-convert-task",
//   },
//   {
//     label: "上下拼接",
//     className: "fusion-bpmn-union-task",
//   },
//   {
//     label: "映射",
//     className: "fusion-bpmn-mapping-task",
//   },
//   {
//     label: "表输出",
//     className: "fusion-bpmn-table-sink-task",
//   },
//   "line",
//   {
//     label: "并行网关",
//     className: "bpmn-icon-gateway-parallel",
//   },
//   {
//     label: "唯一网关",
//     className: "bpmn-icon-gateway-xor",
//   },
//   {
//     label: "包含网关",
//     className: "bpmn-icon-gateway-or",
//   },
// ]

// 右击“常规组件”时：连线、编辑、复制、粘贴（不可用）、删除、运行到、输出预览、备注
// 右击“连线”时：仅删除可用，其他不可用（灰色）
// 右击“画布空白区”时：仅粘贴可用，其他不可用
// 右击“开始”时：仅备注可用，其他不可用
// 右击“结束”时：仅删除、运行到、备注 可用，其他不可用
// 右击“网关”时：仅连线、复制、删除、备注可用，其他不可用
const contextmenuRule = {
  "bpmn:Process": ["ctx-paste"],
  "bpmn:ServiceTask": [
    "ctx-connect",
    "ctx-annotation",
    "ctx-edit",
    "ctx-copy",
    "ctx-delete",
    // "ctx-runto",
    "ctx-output",
  ],
  "bpmn:StartEvent": [
    "ctx-connect",
    "ctx-annotation",
    "ctx-copy",
    "ctx-delete",
  ],
  "bpmn:EndEvent": [
    "ctx-annotation",
    "ctx-copy",
    "ctx-delete",
    // "ctx-runto",
  ],
  "bpmn:SequenceFlow": ["ctx-edit", "ctx-delete"],
  "bpmn:ParallelGateway": [
    "ctx-connect",
    "ctx-annotation",
    "ctx-edit",
    "ctx-copy",
    "ctx-delete",
  ],
  "bpmn:ExclusiveGateway": [
    "ctx-connect",
    "ctx-annotation",
    "ctx-edit",
    "ctx-copy",
    "ctx-delete",
  ],
  "bpmn:InclusiveGateway": [
    "ctx-connect",
    "ctx-annotation",
    "ctx-edit",
    "ctx-copy",
    "ctx-delete",
  ],
  "bpmn:TextAnnotation": ["ctx-copy", "ctx-delete"],
};

const createBusinessId = (businessType) => {
  return (
    businessType +
    "_" +
    parseInt(Math.random() * 10000)
      .toString()
      .padStart(5, "0")
  );
};

export default {
  name: "EtlManager",
  components: {
    BlankPanel,
    FuColorPicker: ColorPicker,
  },
  mounted() {
    this.init();
    this.initResizeEvent();
  },
  created() {
    //获取路由参数
    this.etlMode = this.$route.query.mode || "design";
    console.log(this.etlMode);
    this.queryBasicInfo();
  },
  data() {
    return {
      // bpmnManager
      bpmnModeler: null,
      // 属性面板当时的key
      currentAttributePanelKey: null,
      // 当前选中bpmn组件Id
      currentBpmnElementId: null,
      //当前运行进行的id
      currentRunEtlProcessId: null,
      //最新运行进行job的日志id
      // currentTaskLogIds: [],
      // 所有扩展的bpmn组件列表
      extendedModeler: [],
      // 所有扩展的属性面板列表
      //XXX:属性面板列表因为遍历顺序的原因  换成了map结构，现在没有响应式的问题，因为value是可以响应式的，如果单纯改变key值等操作可能会有响应式的问题。
      extendedAttrPanelMap: new Map(),
      // 扩展属性校验
      extendedValidatorMap: {},
      // 当前etl所有businessInstance列表
      businessInstanceMap: {},
      // 是否加载中
      isLoading: false,
      // 是否显示蒙板
      // TODO. 要看看是否应和 isLoadding 合并
      isShowMask: false,
      // 是否展示自定义控制器面板
      isShowCustomPalette: true,
      // 是否展示属性栏
      isShowAttibutePanel: false,
      // 自定义控制器列表，[groupName,group的数量]
      customPaletteList: [],
      // 自定义控制器map列表 groupName:下面的按钮组
      extendedCustomPaletteMap: new Map(),
      // 左侧弹块宽度
      paletteWidth: "161px",
      // 右键面板配置项
      contextmenuConfig: {
        // 是否展示
        isShow: false,
        // top
        top: 0,
        // left
        left: 0,
        // 右击元素
        element: null,
        // 右击元素Id
        elementId: null,
      },
      // 下面属性面板高度
      attrPanelHeight: "500px",
      // 主色调
      mainThemeColor: "#142334", //"#10ad73",
      tooltipTextColor: "#333", //工具栏文本颜色
      panelBorderColor: "#1d96f3", //面板页签边框颜色
      panelTextColorDefault: "#1d96f3", //面板文本颜色-默认
      panelBackgroundDefault: "#ffffff", //面板背景颜色-默认
      panelTextColorSelected: "#ffffff", //面板文本颜色-选中
      panelBackgroundSelected: "#1d96f3", //面板背景颜色-选中

      //etl的基本信息
      basicInfo: {},

      //etl模式--设计design/预览view，默认为预览模式
      etlMode: "design",
    };
  },
  props: {
    // etl唯一标识id
    etlId: {
      type: String,
      // 还可以是prue prue的话 没有任何插件
      default: "prcess_1",
    },
    // 是否使用自定义控制面板
    isOpenCustomPalette: {
      type: Boolean,
      // 还可以是prue prue的话 没有任何插件
      default: true,
    },
    // eltManager模式，区分是否预加载部分组件
    mode: {
      type: String,
      // 还可以是prue prue的话 没有任何插件
      default: "default",
    },
    // 扩展组件列表
    extendedPlugins: {
      type: Array,
      default: () => {
        return [];
      },
    },
    // 预设bpmn数据
    xmlStr: {
      type: String,
      default: `<?xml version="1.0" encoding="UTF-8"?><definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://www.flowable.org/processdef"><process id="$PROCESS_ID$" name="$PROCESS_NAME$" isExecutable="true"></process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="$PROCESS_ID$"></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></definitions>`,
    },
    // bpmn content pad 背景色
    contentPadBackgroundColor: {
      type: String,
      default: "#ffffff",
    },
    // bpmn content pad 边框颜色
    contentPadBorderColor: {
      type: String,
      default: "#142334",
    },
    // bpmn content pad svg颜色
    contentPadSvgColor: {
      type: String,
      default: "#142334",
    },
    // bpmn content pad 按钮选中 边框颜色
    contentPadHoverBorderColor: {
      type: String,
      default: "#142334",
    },
    // bpmn content pad svg颜色
    contentPadgHoverBackroundColor: {
      type: String,
      default: "#ffffff",
    },
  },
  computed: {
    //左侧面板平移距离
    paletteLeft() {
      return "-" + this.paletteWidth;
    },
    //左侧面板上面控制收缩按钮定位left值
    toggleLeft() {
      return parseInt(this.paletteWidth) - 2 + "px";
    },
    //左侧面板上面resize-bar div线定位left值
    paletteResizeLeft() {
      return parseInt(this.paletteWidth) - 5 + "px";
    },
    currentAttributePanelTypeIsStatic() {
      return this.currentAttributePanelKey
        ? this.extendedAttrPanelMap.get(this.currentAttributePanelKey).config
            .isStatic
        : true;
    },
    currentAttributePanelName() {
      return this.isShowAttibutePanel
        ? this.currentAttributePanelKey
        : BlankPanel.name;
    },
    FusionBpmnEditor() {
      return this.mode === "prue"
        ? FusionBpmnPureEditor
        : FusionBpmnBasicEditor;
    },
  },
  methods: {
    getThis() {
      return this;
    },
    /**
     * @description 根据etlId查询etl基本信息
     */
    async queryBasicInfo(id) {
      let res = await queryEtlTaskById(this.etlId);
      this.basicInfo = res.data[0].data;
    },
    /**
     * @description 计算左侧面板里面分类高度的函数
     */
    computeHeight(number) {
      return number * 36 + "px";
    },
    /**
     * @description 收起/打开左侧面板分类的回调
     */
    controlPalette(index) {
      let paletteWrapper = document.querySelectorAll(
        ".etl-manager-palette-group"
      )[index];
      if (paletteWrapper.classList.contains("hide")) {
        paletteWrapper.classList.remove("hide");
      } else {
        paletteWrapper.classList.add("hide");
      }
    },
    initResizeEvent() {
      // 实现拖拽改变宽度

      let paletteResize = document.querySelector(".palette-resize-bar");
      let attributeResize = document.querySelector(".attribute-resize-bar");

      //左边侧边栏的拖动事件
      paletteResize.onmousedown = (e) => {
        let startX = e.clientX;
        paletteResize.left = paletteResize.offsetLeft;

        document.onmousemove = (e) => {
          let endX = e.clientX;
          //移动的长度
          let moveLen = paletteResize.left + (endX - startX);

          if (moveLen < 161) moveLen = 161;
          if (moveLen > 844) moveLen = 844;

          paletteResize.style.left = moveLen - 5 + "px";
          this.paletteWidth = moveLen + "px";
        };
        document.onmouseup = function (evt) {
          evt.stopPropagation();
          document.onmousemove = null;
          document.onmouseup = null;
          paletteResize.releaseCapture && paletteResize.releaseCapture();
        };
        paletteResize.setCapture && paletteResize.setCapture();
        return false;
      };
      //下边属性栏的拖动事件
      attributeResize.onmousedown = (e) => {
        let startY = e.clientY;
        let attrPanelHeight = this.attrPanelHeight;
        document.onmousemove = (e) => {
          let endY = e.clientY;
          //移动的长度
          let moveLen = parseInt(attrPanelHeight) + (startY - endY);

          if (moveLen < 400) moveLen = 400;
          if (moveLen > 800) moveLen = 800;

          this.attrPanelHeight = moveLen + "px";
        };
        document.onmouseup = function (evt) {
          evt.stopPropagation();
          document.onmousemove = null;
          document.onmouseup = null;
          attributeResize.releaseCapture && attributeResize.releaseCapture();
        };
        attributeResize.setCapture && attributeResize.setCapture();
        return false;
      };
    },
    async init() {
      /**
       * ================================
       * 初始化检查
       * ================================
       */

      if (/\d/g.test(this.etlId.charAt(0))) {
        this.$message({
          type: "error",
          showClose: true,
          message: `etlId [${this.etlId}] 首字符禁止使用数字`,
        });
        return;
      }

      /**
       * ================================
       * 初始化默认面板和自定义插件+面板
       * ================================
       */

      let bpmnConfig = this.registerExtendedPlugin();

      console.log(`[EtlManager]<init> Manager Mode ==> ${this.mode}`);
      window.editor = this.editor = new this.FusionBpmnEditor(bpmnConfig);

      this.editor.zoom(1.2);

      /**
       * ================================
       * 初始化事件
       * ================================
       */

      this.initListener();

      /**
       * ================================
       * 载入初始数据
       * ================================
       */

      // 清洗 替换默认 xml 数据
      const xml = this.xmlStr
        .replace(/\$PROCESS_ID\$/g, this.etlId)
        .replace(/\$PROCESS_NAME\$/g, this.etlId);

      // creteNewDiagram 为异步方法 需要 await 强制同步
      await this.editor.createNewDiagram(xml);
      this.emit("etl.bpmn.loaded");

      /**
       * ================================
       * 初始化eltManager下部分组件默认状态和属性
       * ================================
       */

      // 打开小地图
      this.editor.modeler.get("minimap").open();

      // 加载 etlId 对应的数据
      this.loadEtlTask();
    },
    registerExtendedPlugin() {
      // 选择渲染对象
      const canvas = this.$refs.cvs;
      // 扩展bpmn组件
      this.extendedModeler = [];
      // 扩展属性面板
      this.extendedAttrPanelMap = new Map();
      // 扩展属性校验
      this.extendedValidatorMap = {};

      let extendedPlugins = [];

      if (this.mode == "prue") {
        extendedPlugins = this.extendedPlugins;
      } else {
        // 创建 默认属性面板 对应默认5个组件
        extendedPlugins = extendedPlugins.concat(this.extendedPlugins, [
          {
            pluginName: "mappingTask",
            attributePanel: MappingTaskAttributePanel,
          },
          {
            pluginName: "tableSinkTask",
            attributePanel: TableSinkTaskAttributePanel,
          },
          {
            pluginName: "tableSourceTask",
            attributePanel: TableSourceTaskAttributePanel,
          },
          {
            pluginName: "unionTask",
            attributePanel: UnionTaskAttributePanel,
          },
          {
            pluginName: "unitConvertTask",
            attributePanel: UnitConvertTaskAttributePanel,
          },
        ]);
      }

      // 之所以用map 没直接拼接数组 是为了可以把同一个分组的按钮按组件配制顺序放在一组 不同分组的加上 line 分隔
      let extendedCustomPaletteMap = new Map();
      //将移动、框选、连线的默认palette按钮加上
      extendedCustomPaletteMap.set("Default", DEFAULT_PALETTE_LIST);
      // 检测 扩展插件信息
      extendedPlugins.forEach(
        ({
          pluginName,
          bpmnPlugin,
          bpmnModeler,
          attributePanel,
          customPalette,
        }) => {
          // XXX. bpmnModeler 可以是 bpmnModeler 也可以是 CustomPluginBuilder 生成的对象 目前没有发现区别
          // 检查bpmn插件信息
          if (bpmnModeler) {
            this.extendedModeler.push(bpmnModeler);
          }
          // 检查bpmn插件信息
          if (bpmnPlugin) {
            this.extendedModeler.push(bpmnPlugin);
          }
          // 检查属性面板信息
          if (attributePanel) {
            if (attributePanel.panel) {
              if (pluginName !== attributePanel.panel.name) {
                console.warn(
                  `[EtlManager]<init> 属性面板name与组件唯一标识不一致 attributePanel.panel.name(${attributePanel.panel.name}) !== pluginName(${pluginName})`
                );
              }
              console.log(
                `[EtlManager]<init> 属性面板${pluginName}注册加载完成`
              );
              Vue.component(pluginName, attributePanel.panel);
              // this.extendedAttrPanelMap[pluginName] = attributePanel;

              // 检查属性校验信息
              if (attributePanel.validator) {
                this.extendedValidatorMap[pluginName] =
                  attributePanel.validator;
              }

              // 补全 config 按钮
              if (attributePanel.config === undefined) {
                attributePanel.config = {
                  label: "属性面板",
                  isLocked: false,
                  isShow: false,
                };
              }

              if (bpmnPlugin || bpmnModeler) {
                // 如果该插件同时拥有 bpmn 配置信息 和 属性面板配置信息， 则自动将该面板定义为 bpmn属性面板
                attributePanel.config.isBpmn = true;
              }

              // 记录
              // this.$set(this.extendedAttrPanelMap, pluginName, attributePanel)
              this.extendedAttrPanelMap.set(pluginName, attributePanel);
            } else {
              console.error(
                `[EtlManager]<init> 属性面板组件不存在 attributePanel.panel is not defined. ${attributePanel}`
              );
            }
          }

          // 自定义控制器
          if (customPalette) {
            customPalette.group = customPalette.group || "其他";
            if (!extendedCustomPaletteMap.get(customPalette.group)) {
              extendedCustomPaletteMap.set(customPalette.group, []);
            }
            let groupArr = extendedCustomPaletteMap.get(customPalette.group);
            groupArr.push(customPalette);
          }
        }
      );
      // console.log("extendedAttrPanelMap", this.extendedAttrPanelMap)
      for (let groupName of extendedCustomPaletteMap.keys()) {
        // 更新
        this.customPaletteList = this.customPaletteList.concat([
          [groupName, extendedCustomPaletteMap.get(groupName).length],
        ]);
      }
      this.extendedCustomPaletteMap = extendedCustomPaletteMap;
      // bpmn 配置信息
      let bpmnConfig = {
        container: canvas,
        additionalModules: [minimapModule],
        // keyboard: {
        //   bindTo: this.$refs.cvs,
        // },
      };

      if (this.extendedModeler.length) {
        bpmnConfig.additionalModules = bpmnConfig.additionalModules.concat(
          this.extendedModeler
        );
      }

      return bpmnConfig;
    },
    initListener() {
      // 键盘监听事件
      let keyupEvent = new KeyEvent("keyup");

      this.keyupEventer = keyupEvent;
      this.keydownEventer = new KeyEvent("keydown");

      keyupEvent.on("CTRL+C", (e) => {
        let tagName = e.target.tagName.toUpperCase();
        if (tagName == "INPUT" || tagName == "TEXTAREA") {
          return;
        }
        this.ctxmenuCopy();
      });

      keyupEvent.on("CTRL+V", (e) => {
        let tagName = e.target.tagName.toUpperCase();
        if (tagName == "INPUT" || tagName == "TEXTAREA") {
          return;
        }
        this.ctxmenuPaste();
      });

      keyupEvent.on("DELETE", (e) => {
        let tagName = e.target.tagName.toUpperCase();
        if (tagName == "INPUT" || tagName == "TEXTAREA") {
          return;
        }
        this.ctxmenuDelete();
      });

      // const self = this
      // 编辑事件
      // this.editor.on("contentPad.edit.click", (event, { element }) => {
      //   // console.log("custom.contentPad.edit.click", element.id, element.type)
      //   let currentAttributePanelKey = element.id.split("_")[0]
      //   注意 这个方法【showAttributePanel】已经改动了
      //   this.showAttributePanel(currentAttributePanelKey, {
      //     bpmnElementId: element.id,
      //     bpmnElementType: element.type,
      //   })
      // })

      // 代理右键点击事件
      document.body.addEventListener("contextmenu", (event) => {
        let target = event.target;
        while (target != document && !target.getAttribute("data-element-id")) {
          target = target.parentNode;
        }
        if (target != document) {
          let elementId = target.getAttribute("data-element-id");
          let element = this.getBpmnElement(elementId);
          // TODO. 右键未来要改成可配置的
          if (contextmenuRule[element.type]) {
            this.$refs.contextmenu.querySelectorAll("div").forEach((el) => {
              el.classList.remove("disable");
              if (!contextmenuRule[element.type].includes(el.className)) {
                el.classList.add("disable");
              }
            });
            this.contextmenuConfig.isShow = true;
            this.contextmenuConfig.elementId = elementId;
            this.contextmenuConfig.element = element;
            this.contextmenuConfig.left = event.pageX;
            this.contextmenuConfig.top = event.pageY;
            this.editor.modeler.get("selection").select(element);
          }
        }
        event.preventDefault();
      });

      // 点击隐藏右键面板
      document.body.addEventListener("click", () => {
        this.contextmenuConfig.isShow = false;
      });

      // bpmn 复制元素 复制的对象包括 元素和与元素相连接的线
      // this.editor.on("copyPaste.copyElement", (event, element) => {
      //   console.log("copyPaste.copyElement", event, element)
      // })

      // bpmn 粘贴元素
      this.editor.on("copyPaste.pasteElement", (event, element) => {
        // console.log("copyPaste.pasteElement", event, element)
        // XXX. 由于设计的要求同一个bpmntype下面要有好多二级分类
        // 二级分类只能通过 id去控制 所有复制粘贴的时候需要强制同步修改id 保证类型可以渲染正确
        // FIXME. 此处etl和bpmn耦合太重了
        // 修复 id
        let copyId = element.descriptor.id;
        // 通过 copyId 获得被复制的元素的 bussinessObject 信息，主要用于获得里面的 attr属性
        // 粘贴的时候 attr属性会丢失
        let copyElement = this.editor.elementRegistry.get(copyId);
        let copyElementAttrs = copyElement.businessObject.$attrs;
        // 修复粘贴的 bussinessObject 信息
        let businessType = copyId.split("_")[0];
        let pasteId = createBusinessId(businessType);
        // 修复 id 用于 通过 id 渲染正确的组件样式
        element.descriptor.businessObject.set("id", pasteId);
        // 修复 attr
        for (var key in copyElementAttrs) {
          element.descriptor.businessObject.set(key, copyElementAttrs[key]);
        }

        // 复制 业务实例对象
        if (BPMN_TYPE_TO_BUSINESS_INSTANCE[element.descriptor.type]) {
          let copyBusinessInstanceMap = this.businessInstanceMap[copyId];
          let copyConfig =
            copyBusinessInstanceMap && copyBusinessInstanceMap.getConfig()
              ? JSON.parse(JSON.stringify(copyBusinessInstanceMap.getConfig()))
              : undefined;
          let businessInstance = new BPMN_TYPE_TO_BUSINESS_INSTANCE[
            element.descriptor.type
          ](pasteId, businessType, this.etlId, copyConfig);
          this.businessInstanceMap[pasteId] = businessInstance;
          businessInstance.updateLabel(copyBusinessInstanceMap.jobDesc);
        }
      });

      // bpmn 元素点击事件
      this.editor.on("element.click", (event, element) => {
        // console.log("element.click", element.id, event, element)
        // XXX. 被 选中事件 替换
        // element = element.element
        // this.updateSelectedBpmnElement(element)
        // 广播事件
        this.emit("bpmn.element.click", event, element);
      });

      // bpmn 元素选中事件
      this.editor.on("selection.changed", (event, selection) => {
        // console.log("selection.changed", selection.newSelection)
        if (selection && selection.newSelection.length) {
          this.updateSelectedBpmnElement(
            selection.newSelection[selection.newSelection.length - 1]
          );
        } else {
          this.updateSelectedBpmnElement(this.getBpmnElement(this.etlId));
        }
        // // 广播事件
        this.emit("bpmn.selection.changed", event, selection);
      });

      // 元素操作后触发，导入时未触发
      // this.editor.on("elements.changed",  (event, element) => {
      //   console.log("element.changed", element.element.id, event, element)
      // })
      this.editor.on("shape.changed", (event, element) => {
        // console.log("shape.changed", element.element.id, event, element)
        element = element.element;
        let taskId = element.id;
        if (this.businessInstanceMap[taskId]) {
          let name = element.businessObject.get("name");
          this.businessInstanceMap[taskId].updateLabel(name);
        }
      });

      // bpmn 元素创建事件 导入时触发
      this.editor.on("shape.added", (event, element) => {
        // console.log("shape.added", element.element.id, event, element)
        element = element.element;
        let taskId = element.id;
        let bpmnType = element.type;
        // XXX. 此处注意 ETL加载完成后同样会触发 shape.added事件
        // 但是 this.businessInstanceMap[taskId] 已经在加载的时候添加完成 所以不会进入以下if逻辑中
        if (!BPMN_TYPE_TO_BUSINESS_INSTANCE[bpmnType]) {
          console.log(
            `[EtlManager]<shape.added> 该组件 ${bpmnType}[${taskId}] 未找到对应的业务实例类 `
          );
        } else if (!this.businessInstanceMap[taskId]) {
          // 如果没有对应的业务实例 肯定就是拖拽出一个新的组件
          this.initBusinessInstance(bpmnType, taskId);
        } else {
          // 如果有的话就不要广播add事件
          return;
        }
        // 添加后自动出发了选中事件，不用再手动处理该逻辑
        // this.updateSelectedBpmnElement(element)
        this.emit("bpmn.shape.added", event, element);
      });

      // bpmn 元素删除事件
      this.editor.on("shape.removed", (event, element) => {
        // console.log("shape.removed", element.element.id, event, element)
        element = element.element;
        let taskId = element.id;
        if (this.businessInstanceMap[taskId]) {
          // 解绑事件
          this.businessInstanceMap[taskId].off("config.update");
          delete this.businessInstanceMap[taskId];
          let businessType = element.id.split("_")[0];
          console.log(
            `[EtlManager]<shape.removed> 该组件 ${businessType}[${taskId}] 业务实例已被删除`
          );
        }
        this.emit("bpmn.shape.removed", event, element);
      });

      // this.editor.on("import.parse.complete", (event, element) => {
      //   console.log("import.parse.complete", arguments)
      // })

      // this.editor.on("custom.renderer.shape", (event, element) => {
      //   console.log("custom.renderer.shape", event, element)
      // })
    },
    /**
     * 重置 EtlManager 数据状态
     */
    resetStatus() {
      this.businessInstanceMap = {};
      this.currentAttributePanelKey = null;
      this.currentBpmnElementId = null;
    },
    /**
     * 显示 全局 loading
     */
    showLoading() {
      this.isLoading = true;
    },
    /**
     * 隐藏 全局 loading
     */
    hideLoading() {
      this.isLoading = false;
    },
    /**
     * 加载 Etl
     */
    loadEtlTask() {
      this.showLoading();
      // this.clear()
      loadEtlTask(this.etlId)
        .then(async (res) => {
          let bpmnXml, tasks;
          res.data.forEach(({ data, name }) => {
            if (name === "tasks") {
              tasks = data.rows;
            } else if (name === "bpmnXml") {
              bpmnXml = decodeURIComponent(data);
            }
          });

          if (bpmnXml === "") {
            // 空文本的话使用默认的xml数据
            const xml = this.xmlStr
              .replace(/\$PROCESS_ID\$/g, this.etlId)
              .replace(/\$PROCESS_NAME\$/g, this.etlId);
            // 更新 bpmnManager
            await this.editor.createNewDiagram(xml);
            this.emit("etl.bpmn.loaded");
            this.resetStatus();
            console.warn(
              `[EtlManager]<loadEtlTask> 所加载的 ETL 数据中 bpmnXml 内容为空`
            );
            return;
          } else {
            // 先更新 businessInstanceMap ，防止 加载 xml 时 element.add 没有找到对应的业务实例
            tasks.forEach(
              ({
                bpmnType = "bpmn:ServiceTask",
                taskId,
                taskType,
                etlId,
                config,
              }) => {
                config = config ? JSON.parse(config) : null;
                if (etlId !== this.etlId) {
                  console.warn(
                    `[EtlManager]<loadEtlTask> 组件(${taskId})的eltId(${etlId})与当前ETL任务(${this.etlId})不一致`
                  );
                }
                if (BPMN_TYPE_TO_BUSINESS_INSTANCE[bpmnType]) {
                  this.initBusinessInstance(bpmnType, taskId, config);
                  console.warn(
                    `[EtlManager]<loadEtlTask> 组件(${taskId})成功初始化对应的 BusinessInstance 业务实例`
                  );
                } else {
                  console.warn(
                    `[EtlManager]<loadEtlTask> 组件(${taskId})的bpmnType(${bpmnType})未匹配到对应的 BusinessInstance 业务实例`
                  );
                }
              }
            );
            // 更新 bpmnManager
            await this.editor.createNewDiagram(bpmnXml);
            this.emit("etl.bpmn.loaded");
            this.$message({
              type: "success",
              showClose: true,
              message: `进程加载完成`,
            });
          }
          this.cleanEtlTaskConfig();
          console.log(`[EtlManager]<loadEtlTask> 加载 ETL 数据完成！`);

          //回显状态
          if (this.etlMode === "view") {
            this.reviewState();
          }
        })
        .catch((error) => {
          console.error(`[EtlManager]<loadEtlTask> 加载 ETL 数据报错,`, error);
          this.$message({
            type: "error",
            showClose: true,
            message: `进程加载失败(${this.etlId})`,
          });
        })
        .finally(() => {
          this.hideLoading();
        });
    },
    /**
     * @description 预览模式下回显各job的状态
     */
    //TODO
    reviewState() {
      // 执行运行
      executeEtlTask(this.etlId).then((res) => {
        let executionId = res.data.filter(
          (item) => item.name === "executionId"
        )[0].data;

        // let executionMsg = res.data.filter(
        //   (item) => item.name === "executionMsg"
        // )[0].data
        //执行后还可执行，因为后台是多线程的，跟etl不一样
        // if (executionMsg === "OK") {
        //记录运行id,给日志面板用 TODO
        this.currentRunEtlProcessId = executionId;
        //通知其他组件运行接口开始运行了
        this.emit("etl.service.procssId.update", {
          processId: this.currentRunEtlProcessId,
        });
        //; 这边有个回头要对接个 运行id
        this.$message({
          type: "info",
          showClose: true,
          message: `已启动运行[${executionId}]`,
        });
        //; } else {
        //   this.$message({
        //     type: "warning",
        //     showClose: true,
        //     message: `该进程正在运行中，请稍后再试`,
        //   })
        // }
      });
    },
    /**
     * 清洗 ETL json
     * 由于热键 ctrl+v 导致的问题 json 和 xml 节点可能不对称 所以 增加清洗 json 的逻辑
     */
    cleanEtlTaskConfig() {
      for (let taskId in this.businessInstanceMap) {
        if (!this.getBpmnElement(taskId)) {
          delete this.businessInstanceMap[taskId];
          console.log(
            `[EtlManager]<cleanEtlTaskConfig> 发现错误生成的 EtlTaskConfig(${taskId})，已被删除`
          );
        }
      }
    },
    /**
     * 验证 ETL
     */
    validateEtlTaskConfig() {
      this.cleanEtlTaskConfig();
      return Object.values(this.businessInstanceMap).every(
        // TODO. 可以预想的未来再加入一个新的业务类型，如果他的id不是taskId，taskxxx那这边的逻辑肯定有很多改动，但是后台说了，以后肯定不会有新的业务类型扩展；简直了
        (businessInstance) => {
          let taskType = businessInstance.taskType;
          if (this.extendedValidatorMap[taskType]) {
            let _result = this.extendedValidatorMap[taskType](
              businessInstance.getConfig()
            );
            if (_result.result === undefined) {
              this.$message({
                type: "warning",
                showClose: true,
                message: `该类型组件 [${taskType}] 校验方法返回值格式非法`,
              });
            } else if (_result.result === false) {
              this.$message({
                type: "error",
                showClose: true,
                message: `组件[${businessInstance.jobDesc}]<${
                  businessInstance.taskId
                }> 配置项未通过校验, 无法保存; ${_result.message || ""}`,
              });
              this.setBpmnElementVerification(
                businessInstance.taskId,
                ELEMENT_STATE.ERROR
              );
              return false;
            }
          }
          return true;
        }
      );
    },
    /**
     * 保存 Etl
     */
    saveEtlTask() {
      //仅浏览模式不能保存和调试
      if (this.etlMode === "view") {
        return;
      }
      this.cleanEtlTaskConfig();
      return new Promise((resolve, reject) => {
        this.showLoading();
        // 检测 etlId 是否同步
        this.editor.elementRegistry.getAll().some((element) => {
          if (element.type === "bpmn:Process") {
            if (element.businessObject.get("id") !== this.etlId) {
              console.warn(
                `[EtlManager]<saveEtlTask> 检测到当前 Bpmn 的进程Id(${element.businessObject.get(
                  "id"
                )})与 EtlManager 的 eltId(${this.etlId}) 不一致，已自动修复`
              );
              element.businessObject.set("id", this.etlId);
            }
            return true;
          }
          return false;
        });
        // 校验config
        let tasks = Object.values(this.businessInstanceMap).map(
          // TODO. 可以预想的未来再加入一个新的业务类型，如果他的id不是taskId，taskxxx那这边的逻辑肯定有很多改动，但是后台说了，以后肯定不会有新的业务类型扩展；简直了
          (businessInstance) => {
            return businessInstance.getValue();
          }
        );

        this.getBpmnXML().then(({ xml }) => {
          console.log(`[EtlManager]<saveEtlTask> 开始保存 ETL 数据！`);
          saveEtlTask(this.etlId, encodeURIComponent(xml), tasks)
            .then(() => {
              console.log(`[EtlManager]<saveEtlTask> 保存 ETL 数据成功！`);
              this.$message({
                type: "success",
                showClose: true,
                message: `保存成功`,
              });
              resolve(true);
            })
            .catch((error) => {
              console.error(
                `[EtlManager]<saveEtlTask> 保存 ETL 数据报错,`,
                error
              );
              this.$message({
                type: "error",
                showClose: true,
                message: `保存失败`,
              });
              reject(error);
            })
            .finally(() => {
              this.hideLoading();
            });
        });
      });
    },
    /**
     * 校验 Etl
     */
    async validateEtlTask() {
      //3、点击校验、调试的时候，不用出现弹窗提示是否保存，默认直接保存
      // this.$confirm("此操作需要执行保存, 是否继续?", "警告", {
      //   confirmButtonText: "保存并校验",
      //   cancelButtonText: "取消",
      //   type: "warning",
      // })
      //   .then(async () => {
      // 保存和校验需要直接task 校验逻辑
      if (!this.validateEtlTaskConfig()) {
        return;
      }

      // 执行保存
      let result = await this.saveEtlTask();
      console.log(result);
      if (result === false) {
        console.log(
          `[EtlManager]<validateEtlTask> ETL保存失败, 校验进程未启动`
        );
        this.$message({
          type: "warning",
          showClose: true,
          message: "保存失败, 校验进程未启动",
        });
        return;
      }
      // 执行校验
      executeEtlTask(this.etlId, "validate").then((res) => {
        let executionId = res.data.filter(
          (item) => item.name === "executionId"
        )[0].data;
        let executionMsg = res.data.filter(
          (item) => item.name === "executionMsg"
        )[0].data;
        if (executionMsg === "OK") {
          //记录运行id,给日志面板用 TODO
          this.currentRunEtlProcessId = executionId;
          this.emit("etl.service.procssId.update", {
            processId: this.currentRunEtlProcessId,
          });
          // 这边有个回头要对接个 运行id
          this.$message({
            type: "info",
            showClose: true,
            message: `已启动校验[${executionId}]`,
          });
        } else {
          this.$message({
            type: "warning",
            showClose: true,
            message: `该进程正在校验中, 请稍后再试`,
          });
        }
      });
      // })
      // .catch((error) => {
      //   console.log(`[EtlManager]<validateEtlTask> ERROR,`, error)
      //   this.$message({
      //     type: "info",
      //     showClose: true,
      //     message: "已取消校验",
      //   })
      // })
    },
    /**
     * @description 终止运行
     */
    async endRunningTask() {
      try {
        let res = await endEtlTask(this.etlId);
        if (res) {
          this.$message({
            type: "success",
            showClose: true,
            message: "停止运行成功！",
          });
        }
      } catch (e) {
        this.$message({
          type: "error",
          showClose: true,
          message: "停止运行失败！",
        });
      }
    },
    /**
     * 运行 Etl
     */
    async debugEtlTask() {
      //仅浏览模式不能保存和调试
      if (this.etlMode === "view") {
        return;
      }
      //3、点击校验、调试的时候，不用出现弹窗提示是否保存，默认直接保存
      // this.$confirm("此操作需要执行保存, 是否继续?", "警告", {
      //   confirmButtonText: "保存并运行",
      //   cancelButtonText: "取消",
      //   type: "warning",
      // })
      //   .then(async () => {
      // 保存和校验需要直接task 校验逻辑
      if (!this.validateEtlTaskConfig()) {
        return;
      }

      // 执行保存
      let result = await this.saveEtlTask();
      if (result === false) {
        console.log(
          `[EtlManager]<validateEtlTask> ETL保存失败, 校验进程未启动`
        );
        this.$message({
          type: "warning",
          showClose: true,
          message: "ETL保存失败, 运行进程未启动",
        });
        return;
      }
      //工作流没有运行条数
      // let nums =
      //   (await this.$prompt("请确认运行条数", "", {
      //     inputValue: -1,
      //     inputPlaceholder: "-1 指抽取全部数据",
      //     inputPattern: /(^[1-9]\d*$)|(^(-1)$)|(^0$)/,
      //     closeOnClickModal: false,
      //   })) || -1
      // 执行运行
      executeEtlTask(this.etlId).then((res) => {
        let executionId = res.data.filter(
          (item) => item.name === "executionId"
        )[0].data;

        // let executionMsg = res.data.filter(
        //   (item) => item.name === "executionMsg"
        // )[0].data
        //执行后还可执行，因为后台是多线程的，跟etl不一样
        // if (executionMsg === "OK") {
        //记录运行id,给日志面板用 TODO
        this.currentRunEtlProcessId = executionId;
        //通知其他组件运行接口开始运行了
        this.emit("etl.service.procssId.update", {
          processId: this.currentRunEtlProcessId,
        });
        //; 这边有个回头要对接个 运行id
        this.$message({
          type: "info",
          showClose: true,
          message: `已启动运行[${executionId}]`,
        });
        //; } else {
        //   this.$message({
        //     type: "warning",
        //     showClose: true,
        //     message: `该进程正在运行中，请稍后再试`,
        //   })
        // }
      });
      //; })
      // .catch(() => {
      //   this.$message({
      //     type: "info",
      //     showClose: true,
      //     message: "已取消运行",
      //   })
      // })
    },
    uploadFile() {
      this.editor.importFile(this.$refs.refFile.files[0]);
    },
    saveFile(type) {
      switch (type) {
        case "bpmn":
          this.editor.exportBpmnFile();
          break;
        case "xml":
          this.editor.exportXmlFile();
          break;
      }
    },
    saveSvg() {
      this.editor.exportSvgFile();
    },
    undo() {
      this.editor.undo();
    },
    redo() {
      this.editor.redo();
    },
    zoom(scale) {
      return this.editor.zoom(scale);
    },
    zoomin() {
      this.zoom(this.zoom() + 0.2);
    },
    zoomout() {
      this.zoom(this.zoom() - 0.2);
    },
    hideAttrPanel() {
      // 隐藏属性面板的时候清空属性面板容器
      this.isShowAttibutePanel = false;
      this.currentAttributePanelKey = null;
    },
    clickAttrPanel(key) {
      if (this.currentAttributePanelKey === key && this.isShowAttibutePanel) {
        // 同一tab点击两次 等于 关闭
        this.isShowAttibutePanel = false;
        this.currentAttributePanelKey = null;
      } else {
        this.currentAttributePanelKey = key;
        this.isShowAttibutePanel = true;
      }
    },
    clear() {
      this.editor.clear();
    },
    customPaletteToggle() {
      this.isShowCustomPalette = !this.isShowCustomPalette;
    },
    customPaletteBtnClick(className) {
      // let bpmnPaletteBtn = this.$refs.cvs.querySelector(
      //   `.djs-palette .${className.replaceAll(" ", ".")}`
      // )
      // FIXME. 如果不强制隐藏属性面板的话，用户选择属性面板页签的时候，会拖不出来东西
      this.hideAttributePanel();
      //去掉iconfont类;
      let bpmnPaletteBtn = this.$refs.cvs.querySelector(
        `.djs-palette .${className.split(" ")[1]}`
      );
      if (bpmnPaletteBtn) {
        bpmnPaletteBtn.click();
      } else {
        this.$message({
          type: "error",
          showClose: true,
          message: "未找到具体组件的实现类",
        });
      }
    },
    hideCtxmenu() {
      this.contextmenuConfig.isShow = false;
    },
    ctxmenuConnection() {
      this.editor.bpmnModeler
        .get("connect")
        .start(null, this.contextmenuConfig.element);
      this.hideCtxmenu();
    },
    ctxmenuAnnotation() {
      let autoPlace = this.editor.bpmnModeler.get("autoPlace");
      let shape = this.editor.elementFactory.createShape({
        type: "bpmn:TextAnnotation",
      });
      autoPlace.append(this.contextmenuConfig.element, shape);
      this.hideCtxmenu();
    },
    ctxmenuEdit() {
      let businessType = this.contextmenuConfig.elementId.split("_")[0];
      this.setAttributePanelType(businessType, {
        bpmnElementId: this.currentBpmnElementId,
      });
      this.showAttributePanel();
      this.hideCtxmenu();
    },
    ctxmenuCopy() {
      let selection = this.editor.modeler.get("selection").get();
      if (selection.length > 0) {
        this.editor.bpmnModeler.get("copyPaste").copy(selection);
      }
      this.hideCtxmenu();
    },
    ctxmenuPaste() {
      // FIXME. 如果不强制隐藏属性面板的话，用户选择属性面板页签的时候，会拖不出来东西
      this.hideAttributePanel();
      this.editor.bpmnModeler.g;
      et("copyPaste").paste();
      this.hideCtxmenu();
    },
    ctxmenuDelete() {
      let selection = this.editor.modeler.get("selection").get();
      if (selection.length > 0) {
        this.editor.modeling.removeElements(selection);
      }
      this.hideCtxmenu();
    },
    ctxmenuRunto() {
      this.hideCtxmenu();
    },
    ctxmenuOutput() {
      this.emit("etl.ctxmenu.output");
      this.hideCtxmenu();
    },
    updateSelectedBpmnElement(element) {
      let {
        extendedAttrPanelMap,
        businessInstanceMap,
        extendedValidatorMap,
        isShowAttibutePanel,
      } = this;
      if (!element && !this.currentBpmnElementId) {
        // 没传入对象则清空全部
        this.currentAttributePanelKey = "";
        this.currentBpmnElementId = "";
        // 清空不必要的bpmn属性按钮;
        for (let name of extendedAttrPanelMap.keys()) {
          if (extendedAttrPanelMap.get(name).config.isBpmn) {
            this.hideAttributePanelButton(name);
          }
        }
        // 如果展示属性面板中，则默认选中第一个面板
        if (isShowAttibutePanel) {
          this.setAttributePanelTypeToFirst();
        }
        return;
      }
      let currentAttributePanelKey = element.id.split("_")[0];
      // 1. 之前选中过元素 且 本次选中的和上次的不一样就需要做校验;
      if (
        this.currentBpmnElementId &&
        element.id !== this.currentBpmnElementId
      ) {
        let lastBusinessType = this.currentAttributePanelKey;
        let businessInstance = businessInstanceMap[this.currentBpmnElementId];
        // 校验的前提是要配置了对应业务类型的校验方法和拥有具体的业务对象才行;
        if (extendedValidatorMap[lastBusinessType] && businessInstance) {
          // 校验
          let _result = extendedValidatorMap[lastBusinessType](
            businessInstance.getConfig()
          );
          if (_result.result === undefined) {
            this.$message({
              type: "warning",
              showClose: true,
              message: `该类型组件 [${lastBusinessType}] 校验方法返回值格式非法`,
            });
          } else if (_result.result === false) {
            this.$message({
              type: "error",
              showClose: true,
              message: `组件[${businessInstance.jobDesc}]<${
                businessInstance.taskId
              }> 配置项未通过校验; ${_result.message || ""}`,
            });
            setTimeout(() => {
              // 设置默认状态未未执行
              // 因为广播的时间节点过早，modeling对象还没有持有该对象，直接设置会报错
              this.setBpmnElementVerification(
                businessInstance.taskId,
                ELEMENT_STATE.ERROR
              );
            }, 0);
          } else {
            setTimeout(() => {
              // 设置默认状态未未执行
              // 因为广播的时间节点过早，modeling对象还没有持有该对象，直接设置会报错
              this.setBpmnElementVerification(businessInstance.taskId);
            }, 0);
          }
        } // if
      }

      // 2. 控制bpmn属性面板是否显示对应的tab块
      let isMatchAttrPanel = false;
      for (let name of extendedAttrPanelMap.keys()) {
        if (extendedAttrPanelMap.get(name).config.isBpmn) {
          if (name === currentAttributePanelKey) {
            this.showAttributePanelButton(name);
            // isMatchAttrPanel = true;
          } else {
            this.hideAttributePanelButton(name);
          }
        }
      }

      // // 3. 仅当显示属性面板的时候更新属性面板key
      // if (isShowAttibutePanel) {
      //   if (isMatchAttrPanel) {
      //     // 找到了适配的属性面板才去显示对应的面板
      //     this.setAttributePanelType(currentAttributePanelKey, {
      //       bpmnElementId: element.id,
      //       bpmnElementType: element.type,
      //     })
      //   } else {
      //     // 没有找到的话需要联动显示默认的第一个属性面板
      //     this.setAttributePanelTypeToFirst()
      //   }
      // }

      // 4. 更新选中的bpmnId
      this.currentBpmnElementId = element.id;
    },
    initBusinessInstance(bpmnType, taskId, config) {
      let businessType = taskId.split("_")[0];
      let businessInstance = new BPMN_TYPE_TO_BUSINESS_INSTANCE[bpmnType](
        taskId,
        businessType,
        this.etlId,
        config
      );
      this.businessInstanceMap[taskId] = businessInstance;

      // 针对属性面板改动label绑定事件
      businessInstance.on("config.update", () => {
        let bpmnElement = this.editor.elementRegistry.get(
          businessInstance.taskId
        );
        this.editor.modeling.updateProperties(bpmnElement, {
          name: businessInstance.jobDesc,
        });
      });

      console.log(
        `[EtlManager]<shape.added> 该组件 ${businessType}[${taskId}] 业务实例初始化完成 `
      );

      return businessInstance;
    },
    /**
     * =====================================
     * 高级 API 主要属性面板使用
     * =====================================
     */
    setAttributePanelTypeToFirst() {
      for (let name of this.extendedAttrPanelMap.keys()) {
        if (this.extendedAttrPanelMap.get(name).config.isShow !== false) {
          this.currentAttributePanelKey = name;
          return;
        }
      }
      // 如果都没找到则强制隐藏属性面板
      this.currentAttributePanelKey = "";
      this.isShowAttibutePanel = false;
    },
    on() {
      this.$on.apply(this, arguments);
    },
    off() {
      this.$off.apply(this, arguments);
    },
    emit() {
      this.$emit.apply(this, arguments);
    },
    setBpmnElementVerification(elementId, state) {
      const bpmnElement = this.getBpmnElement(elementId);
      if (state) {
        state = state.toUpperCase();
        bpmnElement.businessObject.verification = state;
      } else {
        delete bpmnElement.businessObject.verification;
      }
      this.redrawBpmnElement(bpmnElement);
    },
    setBpmnElementState(elementId, state) {
      state = state.toUpperCase();
      const bpmnElement = this.getBpmnElement(elementId);
      bpmnElement.businessObject.state = state;
      this.redrawBpmnElement(bpmnElement);
    },
    redrawBpmnElement(id) {
      console.log("redrawBpmnElement", id);
      if (typeof id === "string") {
        this.editor.modeling.setColor(this.getBpmnElement(id));
      } else {
        this.editor.modeling.setColor(id);
      }
    },
    redrawBpmn() {
      this.getAllBpmnElement().forEach((element) => {
        let bpmnType = element.businessObject.$type;
        if (MULTI_STATE_BPMN_TYPE.includes(bpmnType)) {
          this.editor.modeling.setColor(element);
        }
      });
    },
    getBpmnElement(elementId) {
      return this.editor.elementRegistry.get(elementId);
    },
    getAllBpmnElement() {
      return this.editor.elementRegistry.getAll();
    },
    // 获得bpmn元素来源元素数组列表
    getSourceBpmnElement(elementId) {
      return this.editor.getSourceBpmnElement(elementId);
    },
    // 获得bpmn元素来源元素ID数组列表
    getSourceBpmnElementId(elementId) {
      return this.editor.getSourceElementId(elementId);
    },
    // 获得bpmn元素去向元素数组列表
    getTargetBpmnElement(elementId) {
      return this.editor.getTargetBpmnElement(elementId);
    },
    // 获得bpmn元素去向元素ID数组列表
    getTargetBpmnElementId(elementId) {
      return this.editor.getTargetElementId(elementId);
    },
    getKeyupEventer() {
      return this.keyupEventer;
    },
    getKeydownEventer() {
      return this.keydownEventer;
    },
    getBpmnManager() {
      return this.editor;
    },
    getEtlId() {
      return this.etlId;
    },
    //获取本步骤的基本信息
    getBasicInfo() {
      return this.basicInfo;
    },
    //获取最新运行executionId
    getRunEtlProcessId() {
      return this.currentRunEtlProcessId;
    },
    //获取最新运行日志id集合
    // getTaskLogIds() {
    //   return this.currentTaskLogIds;
    // },
    getBusinessInstanceMap() {
      return this.businessInstanceMap;
    },
    getBpmnXML(format = false, preamble = true) {
      return this.editor.bpmnModeler.saveXML({ format, preamble });
    },
    showAttributePanelButton(attrName) {
      if (this.extendedAttrPanelMap.get(attrName)) {
        this.$set(
          this.extendedAttrPanelMap.get(attrName).config,
          "isShow",
          true
        );
      }
    },
    hideAttributePanelButton(attrName) {
      if (this.extendedAttrPanelMap.get(attrName)) {
        this.$set(
          this.extendedAttrPanelMap.get(attrName).config,
          "isShow",
          false
        );
        // 额外检查，当隐藏标签按钮的时候，如果当前展示的属性面板就是该标签，则切换默认展示第一个属性标签
        if (
          this.isShowAttibutePanel &&
          this.currentAttributePanelKey === attrName
        ) {
          this.setAttributePanelTypeToFirst();
        }
      }
    },
    setAttributePanelType(attributePanelName, config = {}) {
      const { bpmnElementId, bpmnElementType } = config;
      if (this.extendedAttrPanelMap.get(attributePanelName)) {
        this.currentAttributePanelKey = attributePanelName;
        this.currentBpmnElementId = bpmnElementId;
      } else {
        // 原有逻辑是如果要求展示的属性面板不存在，则隐藏属性面板+清空属性面板；
        // 后来要求不隐藏属性面板，所以对应的清空属性面板逻辑也必须下掉，否则未隐藏的属性面板展示的就是空
        // this.currentAttributePanelKey = ""
        // this.currentBpmnElementId = ""
        console.warn(
          `[EtlManager]<custom.contentPad.edit.click> 该组件 [${attributePanelName}<${bpmnElementType}>] 未注册属性面板`
        );
        // 提示有点多
        this.$notify.warning({
          title: "警告",
          position: "bottom-right",
          duration: 2000,
          message: `该组件 [${attributePanelName}<${bpmnElementType}>] 未注册属性面板`,
        });
      }
    },
    // 选中属性面板逻辑
    showAttributePanel() {
      this.isShowAttibutePanel = true;
    },
    hideAttributePanel() {
      this.isShowAttibutePanel = false;
      this.currentAttributePanelKey = "";
      this.currentBpmnElementId = "";
    },
  },
};
</script>
<style lang="less" scoped>
.etl-manager-container {
  width: 100%;
  height: 100%;
  /* 背景网格 START */
  // background: white;
  // overflow: auto;
  // background-image: linear-gradient(90deg, #dcdcdc3d 6%, transparent 0),
  //   linear-gradient(#dcdcdc3d 6%, transparent 0);
  // background-size: 12px 12px;
  // -webkit-tap-highlight-color: rgba(255, 255, 255, 0.856);
  /* 背景网格 END */

  background: #eaedf0;

  .etl-manager-canvas {
    position: absolute;
    top: 50px;
    left: var(--canvasLeft);
    width: calc(100% - var(--canvasLeft));
    height: calc(100% - 50px - 42px - var(--attrPanelVisableHeight));
    transition: all 0.3s;
  }

  .etl-manager-contextmenu {
    position: absolute;
    z-index: 2000;
    border: 1px solid #c0c0c0;
    border-radius: 3px;
    background: #fff;
    width: 230px;
    padding: 5px 0px;
    box-shadow: 5px 5px 2px -3px #c0c0c0;

    div {
      padding: 5px 20px 5px 25px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;

      span {
        color: #c0c0c0;
      }
    }

    div:hover {
      background: #f0f0f0;
    }

    div.disable {
      color: #c0c0c0;
    }

    div.disable:hover {
      background: #fff;
    }

    hr {
      margin: 5px;
    }
  }

  .etl-manager-toolbar {
    display: flex;
    justify-content: flex-end;
    position: absolute;
    left: 0;
    top: 0;
    height: 64px;
    width: 100%;
    background: #ffffff;
    border-bottom: 1px solid #dddddd;
    margin: 0;
    line-height: 50px;

    .etl-manager-toolbar-btn:last-child {
      margin-right: 20px;
    }

    .etl-manager-toolbar-btn {
      color: #409eff;
      background: #ffffff;
      cursor: pointer;
      padding: 5px 10px;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      margin: 0 5px;
      line-height: 64px;
      .icon {
        text-align: center;
        font-size: 24px;
        line-height: 40px;
      }

      .etl-manager-toolbar-text {
        // padding-left: 5px;
        text-align: center;
        font-size: 12px;
        line-height: 14px;
        font-family: "Microsoft YaHei";
        color: #333333;
      }
    }

    .etl-manager-toolbar-btn.disabled {
      color: #a0a0a0;
      cursor: not-allowed;
      .myicon {
        color: #a0a0a0;
      }
      .etl-manager-toolbar-text {
        color: #a0a0a0;
      }
    }
    // .disabled {
    //   pointer-events: none;
    //   .etl-manager-toolbar-text,
    //   span {
    //     color: #eee;
    //   }
    // }

    .etl-manager-split {
      font-size: 16px;
      border-left: 2px solid #a0a0a0;
      margin: 0 10px;
    }
  }

  .etl-manager-right-toolbar {
    position: absolute;
    right: 10px;
    top: 74px;
    background: transparent;

    a:hover {
      color: var(--mainThemeColor);
      border-color: var(--mainThemeColor);
      font-size: 18px;
    }
    a {
      color: #a0a0a0;
      background: transparent;
      height: 26px;
      width: 26px;
      line-height: 29px;
      cursor: pointer;
      border-radius: 5px;
      border: 2px solid #a0a0a0;
      text-decoration: none;
      display: block;
      text-align: center;
      margin-bottom: 5px;
      font-size: 15px;
      transition: font-size 0.3s;
      // padding: 5px;
      // margin: 0 5px;

      .r-btn {
        font-family: "myicon" !important;
        font-style: normal;
        -webkit-font-smoothing: antialiased;
      }

      .zoomin:before {
        content: "\e6fc";
      }
      .zoomout:before {
        content: "\e78c";
      }
    }
  }

  .etl-manager-palette {
    width: var(--paletteWidth);
    height: calc(100% - 64px);
    position: absolute;
    top: 64px;
    left: 0px;
    transition: left 0.3s;
    background: #ffffff;
    box-sizing: border-box;
    border-right: 0px solid var(--mainThemeColor);
    display: var(--isHideCustomPalette);
    color: var(--mainThemeColor);

    .palette-resize-bar {
      width: 8px;
      height: 100%;
      cursor: ew-resize;
      resize: horizontal;
      position: absolute;
      left: var(--paletteResizeLeft);
      top: 0;
      opacity: 0;
      // background: red;
    }

    .etl-manager-palette-container {
      width: 100%;
      height: 100%;
      overflow: auto;
      .etl-manager-palette-group {
        margin: 8px 8% 0px 8%;
        width: 83%;
        font-size: 14px;
        // border: 1px solid black;
        .etl-manager-palette-group-title {
          margin: 4px 0;
          width: 100%;
          height: 32px;
          line-height: 32px;
          i {
            width: 15px;
            height: 100%;
            cursor: pointer;
            display: inline-block;
            transition: all 0.3s;
            transform: rotate(0deg);
          }
        }
        .etl-manager-palette-group-wrapper {
          width: 100%;
          transition: all 0.3s;
          overflow: hidden;
          .etl-manager-palette-group-btn {
            margin: 4px 0;
            background: #f8f9f9;
            width: 100%;
            height: 32px;
            line-height: 32px;
            cursor: pointer;
            .custom-palette-group-icon {
              flex: none;
              font-size: 17px;
              color: #409eff;
              margin-left: 5px;
              display: inline-block;
              width: 24px;
              height: 32px;
              line-height: 32px;
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
            }
            .custom-palette-group-label {
              flex: none;
              margin-left: 8px;
              height: 32px;
              line-height: 32px;
              vertical-align: top;
            }
          }
        }
      }
      //收起效果
      .etl-manager-palette-group.hide {
        .etl-manager-palette-group-wrapper {
          height: 0 !important;
        }
        .etl-manager-palette-group-title i {
          transform: rotate(-90deg);
        }
      }
      //占位用的div
      .occupy-space-div {
        width: 100%;
        height: 30px;
      }
    }
  }

  .etl-manager-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: var(--mainThemeColor);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s;
  }

  .etl-manager-mask.show {
    opacity: 0.5;
    pointer-events: all;
  }

  .attr-panel-container {
    position: fixed;
    left: var(--canvasLeft);
    height: var(--attrPanelHeight);
    width: calc(100% - var(--canvasLeft));
    bottom: calc(-1 * var(--attrPanelHeight));
    background: #ffffff;
    transition: bottom 0.3s;
    transition: all 0.3s;
    .attribute-resize-bar {
      width: 100%;
      height: 8px;
      cursor: n-resize;
      resize: vertical;
      position: absolute;
      left: 0;
      top: -46px;
      opacity: 0;
      z-index: 3;
      // background: red;
    }
    .attr-panel-btn-container {
      color: var(--mainThemeColor);
      position: absolute;
      height: 42px;
      width: 100%;
      left: 0;
      top: -42px;
      background: #ffffff;
      // border-top: 1px solid #666;
      pointer-events: none;
      box-sizing: border-box;

      .attr-panel-btn {
        display: inline-block;
        cursor: pointer;
        height: 32px;
        width: 121px;
        text-align: center;
        line-height: 30px;
        pointer-events: all;
        border-radius: 2px 2px 0px 0px;
        padding: 0 10px;
        background: var(--panelBackgroundDefault);
        color: var(--panelTextColorDefault);
        margin: 10px 4px 0px 4px;
        transition: all 0.3s;
        box-sizing: border-box;
        font-size: 14px;
        font-family: "Microsoft YaHei";
        border: 1px solid var(--panelBorderColor);
      }

      .attr-panel-btn.selected {
        background: var(--panelBackgroundSelected);
        color: var(--panelTextColorSelected);
        // font-weight: 700;
      }

      .attr-panel-toggle-btn {
        // background-size: 20px 20px;
        // background-repeat: no-repeat;
        // background-position: center;
        // background-image: url("/bpmn/hide.svg");
        font-size: 20px;
        color: #999999;
        width: 0px;
        border: none;
        padding: 0;
        float: right;
      }
    }
    .attr-panel {
      width: 100%;
      height: 100%;
      border-top: 2px solid #409eff;
      background-color: var(--mainThemeColor);
      box-sizing: border-box;
    }
  }

  .attr-panel-container.show {
    .attr-panel-toggle-btn {
      width: 30px;
      float: right;
      // border: 2px solid var(--mainThemeColor);
    }
  }
  .attr-panel-container.show {
    bottom: 0;
  }
}
</style>
<style lang="less">
.el-notification__content {
  white-space: break-spaces;
  word-break: break-all;
  max-height: 130px;
  overflow: auto;
}
.djs-connection {
  path {
    marker-end: url(#sequenceflow-arrow-end) !important;
  }
}
.djs-minimap {
  border-radius: 5px;
  border: 2px solid #a0a0a0;
  bottom: 35px !important;
  top: unset;
}

.djs-minimap {
  width: 160px;
  height: 90px;
  transition: all 0.3s;
}

.djs-minimap:hover {
  width: 320px;
  height: 180px;
  border-color: var(--mainThemeColor);
}

.djs-minimap .map {
  width: 100%;
  height: 100%;
}

.djs-minimap.open .toggle,
.djs-minimap:not(.open) .toggle {
  display: none;
}
/* app.css */
.icon-custom {
  /* 定义一个公共的类名 */
  border-radius: 50%;
  background-size: 65%;
  background-repeat: no-repeat;
  background-position: center;
}

.fusion-bpmn-start-event {
  background-image: url("/bpmn/startEvent.svg") !important;
}
.fusion-bpmn-end-event {
  background-image: url("/bpmn/endEvent.svg") !important;
}
.fusion-bpmn-mapping-task {
  background-image: url("/bpmn/mappingTask.svg") !important;
}
.fusion-bpmn-table-sink-task {
  background-image: url("/bpmn/tableSinkTask.svg") !important;
}
.fusion-bpmn-table-source-task {
  background-image: url("/bpmn/tableSourceTask.svg") !important;
}
.fusion-bpmn-unit-convert-task {
  background-image: url("/bpmn/unitConvertTask.svg") !important;
}
.fusion-bpmn-union-task {
  background-image: url("/bpmn/unionTask.svg") !important;
}

.icon-custom-edit {
  background-image: url("https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/edit.png") !important;
}

.icon-custom-delete {
  background-image: url("https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/delete.png") !important;
}

/** ----------- bpmn context pad 样式覆盖 START ----------- **/

.djs-overlay-context-pad {
  display: none !important;
}

// .djs-context-pad .entry {
//   box-sizing: border-box;
//   margin: 0;
//   border-radius: 0px;
//   font-size: 19px;
//   line-height: 21px;
// }

// .djs-context-pad .entry:hover {
//   background-color: var(--contentPadgHoverBackroundColor);
//   border: 1px solid var(--contentPadHoverBorderColor);
// }

// .djs-context-pad .icon-custom.entry {
//   background-size: 94%;
//   transition: all 0.3s;
//   background-size: cover !important;
// }

// .djs-context-pad.open {
//   display: block;
//   background: var(--contentPadBackgroundColor);
//   border: 1px solid var(--contentPadBorderColor);
//   color: var(--contentPadSvgColor);
//   box-sizing: border-box;
//   padding: 2px;
//   border-radius: 5px;
// }

// .bpmn-icon-text-annotation:before {
//   top: -4px;
//   position: relative;
// }

/** ----------- bpmn context pad 样式覆盖 END ----------- **/

.bjs-powered-by {
  opacity: 0.5;
  pointer-events: none;
  bottom: 5px !important;
  right: 5px !important;
}

.djs-palette {
  display: var(--isHideBpmnPalette);
}
/** ----------- 滚动条start ----------- **/
::-webkit-scrollbar {
  /* background-color: rgba(27, 27, 27, 0.4); */
  border-radius: 10px;
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgb(209, 209, 210);
}
::-webkit-scrollbar-track {
  background: rgb(244, 244, 244);
}
/** ----------- 滚动条end ----------- **/
</style>
