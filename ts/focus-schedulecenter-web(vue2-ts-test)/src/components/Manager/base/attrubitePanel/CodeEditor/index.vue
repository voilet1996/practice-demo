/** 一个编辑器组件 */
<template>
  <div style="height: 100%; overflow: hidden">
    <textarea ref="textarea"></textarea>
    <div class="toggle">
      <div ref="xml" class="xml btn cur" @click="showXML">XML</div>
      <div ref="json" class="json btn" @click="showJSON">BI</div>
    </div>
  </div>
</template>

<script>
// 引入全局实例
import _CodeMirror from "codemirror"

// 核心样式
import "codemirror/lib/codemirror.css"
// 引入主题后还需要在 options 中指定主题才会生效
import "codemirror/theme/cobalt.css"

// 需要引入具体的语法高亮库才会有对应的语法高亮效果
// codemirror 官方其实支持通过 /addon/mode/loadmode.js 和 /mode/meta.js 来实现动态加载对应语法高亮库
// 但 vue 貌似没有无法在实例初始化后再动态加载对应 JS ，所以此处才把对应的 JS 提前引入
import "codemirror/mode/javascript/javascript.js"
import "codemirror/mode/css/css.js"
import "codemirror/mode/xml/xml.js"
// 尝试获取全局实例
const CodeMirror = window.CodeMirror || _CodeMirror

export default {
  name: "CodeEditor",
  props: {
    // 外部传入的内容，用于实现双向绑定
    value: {
      type: String,
      default: "",
    },
    // 外部传入的语法类型
    language: {
      type: String,
      default: "javascript",
    },
    etlManager: {
      type: Object,
      require: true,
      default: () => {},
    },
  },
  data() {
    return {
      // 内部真实的内容
      code: "",
      // 默认的语法类型
      mode: "javascript",
      // 编辑器实例
      coder: null,
      // 默认配置
      options: {
        // 缩进格式
        tabSize: 2,
        // 主题，对应主题库 JS 需要提前引入
        theme: "cobalt",
        // 括号匹配
        matchBrackets: true,
        // 显示行号
        lineNumbers: true,
        // 是否使用模式提供的上下文相关缩进（或者只是缩进与之前的行相同）。默认为true。
        line: true,
        smartIndent: true,
        // 高亮选中行
        styleActiveLine: true,
        // 当匹配只有一项的时候是否自动补全
        hintOptions: {
          completeSingle: true,
        },
        lineWrapping: true,
        readOnly: true, //只读
      },
      // 支持切换的语法高亮类型，对应 JS 已经提前引入
      // 使用的是 MIME-TYPE ，不过作为前缀的 text/ 在后面指定时写死了
      modes: [
        {
          value: "css",
          label: "CSS",
        },
        {
          value: "javascript",
          label: "Javascript",
        },
        {
          value: "html",
          label: "XML/HTML",
        },
      ],
    }
  },
  created() {},
  mounted() {
    // 初始化
    this._initialize()
    this.showXML()
  },
  watch: {
    value(val) {
      // 编辑器赋值
      this.coder.setValue(val)
    },
    code(val) {
      // 编辑器赋值
      this.coder.setValue(val)
    },
  },
  methods: {
    // 初始化
    _initialize() {
      // 初始化编辑器实例，传入需要被实例化的文本域对象和默认配置
      this.coder = CodeMirror.fromTextArea(this.$refs.textarea, this.options)
      // 编辑器赋值
      this.coder.setValue(this.value || this.code)

      // 支持双向绑定
      this.coder.on("change", (coder) => {
        this.code = coder.getValue()
        if (this.$emit) {
          this.$emit("input", this.code)
        }
      })

      // 尝试从父容器获取语法类型
      if (this.language) {
        // 获取具体的语法类型对象
        let modeObj = this._getLanguage(this.language)

        // 判断父容器传入的语法是否被支持
        if (modeObj) {
          this.mode = modeObj.label
        }
      }
    },
    // 获取当前语法类型
    _getLanguage(language) {
      // 在支持的语法类型列表中寻找传入的语法类型
      return this.modes.find((mode) => {
        // 所有的值都忽略大小写，方便比较
        let currentLanguage = language.toLowerCase()
        let currentLabel = mode.label.toLowerCase()
        let currentValue = mode.value.toLowerCase()

        // 由于真实值可能不规范，例如 java 的真实值是 x-java ，所以讲 value 和 label 同时和传入语法进行比较
        return (
          currentLabel === currentLanguage || currentValue === currentLanguage
        )
      })
    },
    async showXML() {
      this.$refs.xml.classList.add("cur")
      this.$refs.json.classList.remove("cur")
      let { xml } = await this.etlManager.getBpmnXML(true, false)
      this.code = xml
    },
    showJSON() {
      this.$refs.json.classList.add("cur")
      this.$refs.xml.classList.remove("cur")
      let instances = this.etlManager.getBusinessInstanceMap()
      let result = {}
      for (var key in instances) {
        result[key] = instances[key].getValue()
      }
      this.code = JSON.stringify(result, null, 2)
    },
  },
}
</script>

<style lang="less">
.in-coder-panel {
  text-align: left;
}
.CodeMirror,
.el-drawer__body {
  height: 100%;
  width: 100%;
}
// .cm-s-cobalt.CodeMirror {
//   background-color: #ffffff;
// }

.toggle {
  position: absolute;
  right: 35px;
  top: 20px;
  z-index: 200;

  .btn {
    border: 2px solid #fafafa;
    padding: 5px;
    color: #fafafa;
    background: #142334;
    display: inline-block;
    min-width: 30px;
    font-size: 13px;
    text-align: center;
    cursor: pointer;
  }

  .xml {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  .json {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    border-left: none;
  }

  .btn.cur {
    color: #142334;
    background: #fafafa;
    font-weight: 700;
  }
}
</style>
