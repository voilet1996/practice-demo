<!--参数说明 
1、树渲染相关
  1.1、treeReq 树数据请求
    {
      url: "",//后台请求url
      params: [],//树请求参数
    }
  1.2、treeId 树id
  1.3、defaultProps 默认的props
    默认为{
      children: "children",
      name: "name",
      id: "id",
    }

2、树拖拽
  2.1、isDragable:false//是否开始拖拽，默认为false 
  2.2、isSameLevelDragable:false//是否开启同级拖拽，默认为false
  2.3、isNotEmptyDragable:true//是否允许非空拖拽，默认为true
  2.4、saveDragReq 树开启拖拽后的保存请求
      {
        url: ""//保存请求url
      }
3、树节点图标
  3.1、nodeImage:"nodeImage"//节点图标名称，默认为"",则代表不适用额外图标，当此参数指定的图片名字之后，需要在同级目录images中把对应图片拷贝进去
  3.2、nodeLabelPattern:'`${node.text}${node.variablename?"("+node.variablename+")":""}`'//树节点要展示的内容，不传则默认用defaultProps指定的name字段作为树的label，否则指定一个规则，如上述的例子是把 text(variablename) 作为树节点的name去展示，而且当variablename没有时只展示text，在树数据请求回来之后会进行pattern的处理，注意的是一定要用node去代表节点

4、树搜字段
  searchText:""//如果树允许搜索，则需要把当前的搜索字段传递进来进行实时搜索

5、右键操作 TODO待补充
  rightClickList
-->
<template>
  <div class="treeContainer" :id="treeId">
    <fu-tree
      :ref="treeId"
      :fu-id="treeId"
      :fu-request="treeReq"
      :fu-callback="fuCallback"
      :slotScope="true"
      :props="defaultProps"
      :node-key="defaultProps.id"
      :filter-node-method="filterNode"
      :draggable="isDragable"
      v-loading="loading"
      v-bind="$attrs"
      v-on="$listeners"
      highlight-current
      :allow-drop="allowDrop"
      :default-expanded-keys="expandNodes"
      @node-drop="handleDrop"
      @node-contextmenu="rightClick"
      @request-completed="completed"
    >
      <span class="custom-tree-node" slot-scope="{ data }">
        <span>
          <img v-if="nodeImage" :src="getImage()" width="16px" height="14px" />
          &nbsp;
          <span :class="[data.status === '1' ? 'highlight' : '']">{{
            data[defaultProps.name]
          }}</span>
        </span>
      </span>
    </fu-tree>
    <div
      id="menu"
      class="menu"
      v-show="menuStyle.isShow"
      :style="{ top: menuStyle.top + 'px', left: menuStyle.left + 'px' }"
    >
      <ul>
        <li
          class="menu__item"
          v-for="item in rightClickList"
          :key="item.id"
          @click="menuClick(item.callBack)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Tree, Message } from "fusion-ui"
import { postJSON } from "@/utils/post.js"
export default {
  name: "componentTree",
  components: {
    FuTree: Tree,
  },
  props: {
    //树节点显示规则
    nodeLabelPattern: {
      type: String,
      default: "",
    },
    //节点图标图片名，默认为"",即不显示图标
    nodeImage: {
      type: String,
      default: "",
    },
    //数据请求url
    treeReq: {
      type: Object,
      default: () => {
        return {
          url: "",
          params: [],
        }
      },
    },
    saveDragReq: {
      type: Object,
      default: () => {
        return {
          url: "",
          params: [],
        }
      },
    },
    //树id
    treeId: {
      type: String,
      default: "",
      required: true,
    },
    //搜索字段
    searchText: {
      type: String,
      default: "",
    },
    //是否开启拖拽
    isDragable: {
      type: Boolean,
      default: false,
    },
    //是否是同级拖拽
    isSameLevelDragable: {
      type: Boolean,
      default: false,
    },
    //是否允许非空拖拽
    isNotEmptyDragable: {
      type: Boolean,
      default: true,
    },
    //右键操作
    rightClickList: {
      type: Array,
      default: () => {
        return []
      },
    },
    //展开指定树节点
    expandNodes: {
      type: Array,
      default: () => {
        return []
      },
    },
    defaultProps: {
      type: Object,
      default: () => {
        return {
          children: "children",
          name: "name",
          id: "id",
        }
      },
    },
  },
  data() {
    return {
      expandIds: [],
      menuStyle: {
        left: 0,
        top: 0,
        isShow: false,
      },
      currentNode: null,
      loading: false, //树loading
    }
  },
  computed: {
    //tree请求拿出来的数据
    fuTreeData() {
      return this.$store.state.reqData[this.treeId] || []
    },
  },
  watch: {
    searchText(val) {
      // this.loading = true
      this.$refs[this.treeId].$refs.el.filter(val)
    },
    treeReq: {
      handler() {
        this.loading = true
      },
      deep: true,
    },
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getImage() {
      return require(`./images/${this.nodeImage}.png`)
    },
    /**
     * @description 节点过滤方法
     * @param {String} value 过滤字符串
     * @param {TreeNode} node 节点
     */
    filterNode(value, node) {
      if (!value) return true
      return node[this.defaultProps.name].indexOf(value) !== -1
    },
    /**
     * @description 树节点拖拽限制
     * @param {TreeNode} draggingNode 被拖拽节点对应的 Node
     * @param {TreeNode} dropNode 结束拖拽时最后进入的节点（可能为空）
     * @param {String} dropType 被拖拽节点的放置位置(before/after/inner)
     */
    allowDrop(draggingNode, dropNode, dropType) {
      // let isShouldDrag = true;
      //拖拽模式是否同级拖拽,如果不是同级拖拽，则进行判断
      if (this.isSameLevelDragable) {
        const isSameLevel = this.isSameLevel(draggingNode, dropNode, dropType)
        if (!isSameLevel) {
          return false
        }
      }
      //是否允许非空拖拽,如果不允许非空节点拖拽
      if (!this.isNotEmptyDragable) {
        const isNotEmptyNode = this.isNotEmptyNode(draggingNode)
        if (isNotEmptyNode) {
          return false
        }
      }
      // 其他限制
      let isShouldDrag = true
      let hasOtherCondition = false
      this.$emit(
        "allow-drop",
        {
          draggingNode,
          dropNode,
          dropType,
        },
        (data) => {
          //允许拖动，调用保存接口
          isShouldDrag = data
          hasOtherCondition = true
        }
      )
      if (hasOtherCondition && !isShouldDrag) return false
      else return true
    },
    /**
     * @description 判断节点是否为同级节点
     * @param {TreeNode} draggingNode 被拖拽节点对应的 Node
     * @param {TreeNode} dropNode 结束拖拽时最后进入的节点（可能为空）
     * @param {String} dropType 被拖拽节点的放置位置(before/after/inner)
     * @param {event} ev 拖拽事件
     */
    isSameLevel(draggingNode, dropNode, dropType) {
      if (dropType === "prev" || dropType === "next") {
        if (draggingNode.data.pId === dropNode.data.pId) {
          return true
        } else {
          return false
        }
      } else if (dropType === "inner") {
        return false
      }
    },
    /**
     * @description 判断节点是否为非空节点
     * @param {TreeNode} node 节点对应的 Node
     */
    isNotEmptyNode(node) {
      if (node.data.children === undefined || node.data.children.length === 0) {
        return false
      } else {
        return true
      }
    },
    /**
     * @description 拖拽成功事件
     * @param {TreeNode} draggingNode 被拖拽节点对应的 Node
     * @param {TreeNode} dropNode 结束拖拽时最后进入的节点（可能为空）
     * @param {String} dropType 被拖拽节点的放置位置(before/after/inner)
     * @param {String} ev 鼠标事件
     */
    handleDrop(draggingNode, dropNode, dropType, ev) {
      let data = this.getSaveDragNode(draggingNode, dropNode, dropType)
      this.saveDrag(data)
    },
    getSaveDragNode(draggingNode, dropNode, dropType) {
      // if (dropType === "inner") {
      //   return [dropNode.data];
      // } else {
      //   let pId = dropNode.data.pId;
      //   let data = this.$refs[this.treeId].$refs.el.getNode(pId);
      //   return data.data.children;
      // }
      //当节点没有移动或目标节点为空时，不做任何移动
      if (dropType === "none" || dropNode === null) {
        return
      }
      let targetPId = "",
        resultTreeData = null
      if (dropType === "inner") {
        //当前节点为父节点
        resultTreeData = dropNode.data.children
        targetPId = dropNode.data.id
      } else {
        //当前节点的父节点为父节点
        let dropParentNode = dropNode.parent.data
        //如果目标节点是根节点，则根节点的parent是根节点的所有节点数据，是个数组
        resultTreeData = Array.isArray(dropParentNode)
          ? dropParentNode
          : dropParentNode.children

        targetPId = dropNode.data.pId
      }
      resultTreeData.forEach((item) => {
        item.pId = targetPId
      })
      return resultTreeData
    },
    /**
     * @description 树拖拽保存
     */
    saveDrag(data) {
      if (this.isDragable && this.saveDragReq.url !== "") {
        postJSON(this.saveDragReq.url, {
          postData: JSON.stringify({
            data: [
              {
                vtype: "attr",
                name: "tree",
                data: data,
              },
            ],
          }),
        }).then((res) => {
          if (res.data[0].data.status && res.data[0].data.status === "error") {
            Message.error(`保存失败，${res.data[0].data.msg}`)
            this.$refs.tree.queryData()
          } else {
            Message.success("拖拽成功！")
          }
        })
      }
    },
    // /**
    //  * @description 树节点点击事件
    //  * @param {TreeNode} node 树节点
    //  */
    // handleNodeClick(node) {
    //   this.$emit("set-current-node", node);
    //   this.$emit("node-click", node);
    // },
    /**
     * @description 鼠标右键显示操作
     * @param {event} MouseEvent 鼠标事件
     * @param {TreeNode} node 右键的节点
     */
    rightClick(MouseEvent, node) {
      if (this.rightClickList.length === 0) {
        return
      }
      this.menuStyle.isShow = true
      //树dom相对浏览器的坐标
      let { x: containerX, y: containerY } = document
        .querySelector(`#${this.treeId}`)
        .getBoundingClientRect()
      this.menuStyle.left = MouseEvent.clientX - containerX
      this.menuStyle.top = MouseEvent.clientY - containerY
      let nodeId = node.id
      this.$refs[this.treeId].$refs.el.setCurrentKey(nodeId)
      document.addEventListener("click", () => {
        this.menuStyle.isShow = false
        document.removeEventListener("click", this.foo)
      })
    },
    /**
     * @description 节点鼠标右键操作点击事件
     * @param {String} callback 右键操作名称
     */
    menuClick(callback) {
      let currentKey = this.$refs[this.treeId].$refs.el.getCurrentKey()
      let currentNode =
        this.$refs[this.treeId].$refs.el.getCurrentNode(currentKey)
      this.$emit(callback, currentNode)
    },
    /**
     * @description 重新刷新数据
     * @param {TreeNode} node 选中节点
     */
    queryData() {
      this.$refs[this.treeId].queryData()
    },
    completed() {
      this.loading = false
      let that = this
      this.$nextTick().then(() => {
        if (that.searchText === "") {
          //只在单纯请求树的接口时，才默认展开根节点
          let curr = that.currentNode
          if (!that.currentNode) {
            curr = document.querySelector(`#${this.treeId} .el-tree-node`) //根节点
            try {
              curr.click()
            } catch (error) {}
          } else {
            // that.$refs.tree.$refs.el.setCurrentKey(curr)
            this.$refs[this.treeId].$refs.el.setCurrentKey(curr)
            this.$emit("node-click", node.data)
            // let node = this.$refs[this.treeId].$refs.el.getNode(curr);
            // this.handleNodeClick(node.data);
            // this.expandIds = [node.data.pId];
          }
        }
      })
    },
    /**
     * @description 数据处理函数，按照nodeLabelPattern对节点数据进行处理
     */
    fuCallback(data) {
      // this.loading = false
      if (data) {
        if (this.nodeLabelPattern !== "") {
          //按照nodeLabelPattern对节点数据进行处理
          this.resetTreeData(data)
        }
      }
      return data
    },
    /**
     * @description 递归处理树数据
     */
    resetTreeData(data) {
      data.forEach((node) => {
        node[this.defaultProps.name] = eval(this.nodeLabelPattern)
        if (node.children && node.children.length > 0) {
          this.resetTreeData(node.children)
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.treeContainer {
  position: relative; //改变右键menu定位的参照物
  height: 100%;

  // overflow: auto;//下面的div已经有滚动条了
  // padding: 8px;
  /deep/.el-tree {
    position: relative; //改变右键menu定位的参照物
    width: 100%;
    height: 100%;
    overflow: auto;
    display: inline-block;
    min-width: 100%;
    /**高亮样式 */
    background-color: unset;
    .highlight {
      color: orange;
    }
    .el-tree-node > .el-tree-node__children {
      overflow: visible;
    }
  }
  .menu {
    position: absolute;
    border: 1px solid #999999;
    background-color: #f4f4f4;
    ul {
      margin-left: -40px;
      margin-top: 0px;
      width: 50px;
      margin-bottom: 0px;
    }
    .menu__item {
      display: block;
      line-height: 20px;
      text-align: center;
      margin: 2px 0px;
      cursor: pointer;
    }
    .menu__item:hover {
      background-color: #1790ff;
      color: white;
    }
  }
}
</style>
