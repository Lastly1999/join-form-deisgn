<script lang="ts" setup>
import { reactive, ref, watch, nextTick, onMounted } from "vue"
import { getIdGlobal, saveIdGlobal } from "../../utils/db"

import RightPanel from "./components/RightPanel.vue"

let idGlobal = getIdGlobal()

// 生成器
import FormBuilder from "../../components/formBuilder/formBuilder.vue"

// 工具类
import { saveAs } from "file-saver"
import { deepClone, beautifierConf } from "../../utils"
import { debounce } from 'throttle-debounce'

// 一些生成 js css template的一些工具方法
import {
  makeUpHtml, vueTemplate, vueScript, cssStyle
} from '../../components/generator/html'
import { makeUpJs } from '../../components/generator/makeJs'
import { makeUpCss } from '../../components/generator/makeCss'
import loadBeautifier from '../../utils/loadBeautifier'

// 供拉拽生成的组件
import { inputComponents, selectComponents, formConf } from "../../components/generator/formConfig"

// 默认值
// import darwDefault from "../../components/generator/darwDefault"

const leftComponents = [
  {
    title: '输入型组件',
    list: inputComponents
  },
  {
    title: '选择型组件',
    list: selectComponents
  }
  // ,
  // {
  //   title: '布局型组件',
  //   list: layoutComponents
  // }
]

const drawingList: any[] = reactive([])

const activeId = ref('')

const activeData = ref([])


const onEnd = (obj: any) => {
  if (obj.to !== obj.form) {
    console.log(true)
  }
}

const cloneComponent = (data: any) => {
  activeData.value = data
  const copyData = deepClone(data)
  createIdAndKey(copyData)
  return copyData
}

const activeFormItem = (currentItem: any) => {
  activeData.value = currentItem
  console.log(currentItem)
  activeId.value = currentItem.__config__.formId
  console.log(activeId.value)
  console.log(currentItem)
}

const drawingItemCopy = (item: any, list: any) => {
  let clone = deepClone(item)
  clone = createIdAndKey(clone)
  list.push(clone)
  activeFormItem(clone)
}

const saveIdGlobalDebounce = debounce(340, saveIdGlobal)

watch(() => activeId.value, val => {
  console.log(val)
  saveIdGlobalDebounce(val)
}, { deep: true })

/**
 * 创建formId 并强制更新组件
 */
const createIdAndKey = (item: any) => {
  const config = item.__config__
  config.formId = ++idGlobal
  config.renderKey = `${config.formId}${+new Date()}` // 改变renderKey后可以实现强制更新组件
  if (config.layout === 'colFormItem') {
    item.__vModel__ = `field${idGlobal}`
  } else if (config.layout === 'rowFormItem') {
    config.componentName = `row${idGlobal}`
    !Array.isArray(config.children) && (config.children = [])
    delete config.label // rowFormItem无需配置label属性
  }
  if (Array.isArray(config.children)) {
    config.children = config.children.map((childItem: any) => createIdAndKey(childItem))
  }
  return item
}

/**
 * 删除预览的某一个拖拽组件
 */

const drawingItemDelete = (index: any, list: any[]) => {
  list.splice(index, 1)
  nextTick(() => {
    const len = drawingList.length
    if (len) {
      activeFormItem(drawingList[len - 1])
    }
  })
}

const dialogVisible = ref(false)
const showFileName = ref(false)
const operationType = ref<string>('')

// 导出vue文件
const download = () => {
  dialogVisible.value = true
  showFileName.value = true
  operationType.value = 'download'
  const codeStr = generateCode()
  const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, new Date().getTime() + '.vue')
}

const generateConf = ref<any>(null)

const formData = ref({})

const formConfig = ref(formConf)

const AssembleFormData = () => {
  formData.value = {
    fields: deepClone(drawingList),
    ...formConfig.value
  }
}

onMounted(() => {
  loadBeautifier((btf: any) => {
    beautifier = btf
  })
})

let beautifier: any

// 生成代码
const generateCode = () => {
  const { type } = generateConf
  AssembleFormData()
  const script = vueScript(makeUpJs(formData.value as any, type))
  const html = vueTemplate(makeUpHtml(formData.value, type))
  const css = cssStyle(makeUpCss(formData.value))
  return beautifier.html(html + script + css, beautifierConf.html)
}

</script>

<template>
  <div class="container">
    <!-- 左侧控件拖动 -->
    <div class="left-board">
      <div class="logo-wrapper">
        <div class="logo"></div>
      </div>
      <el-scrollbar class="left-scrollbar">
        <div class="components-list">
          <div v-for="(item, listIndex) in leftComponents" :key="listIndex">
            <div class="components-title">{{ item.title }}</div>
            <Draggable
              item-key="listIndex"
              class="components-draggable"
              :list="item.list"
              :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
              :clone="cloneComponent"
              draggable=".components-item"
              :sort="false"
              @end="onEnd"
            >
              <div v-for="(element, index) in item.list" :key="index" class="components-item">
                <div class="components-body">{{ element.__config__.label }}</div>
              </div>
            </Draggable>
          </div>
        </div>
        <div></div>
      </el-scrollbar>
    </div>
    <!-- 中间表单设计区域 -->
    <div class="center-board">
      <div class="action-bar">
        <el-button icon="el-icon-download" type="text" @click="download">导出vue文件</el-button>
        <!-- <el-button icon="el-icon-video-play" type="text" @click="run">运行</el-button>
        <el-button icon="el-icon-view" type="text" @click="showJson">查看json</el-button>
        <el-button class="copy-btn-main" icon="el-icon-document-copy" type="text" @click="copy">复制代码</el-button>
        <el-button class="delete-btn" icon="el-icon-delete" type="text" @click="empty">清空</el-button>-->
      </div>
      <el-scrollbar class="center-scrollbar">
        <el-form :label-position="formConfig.labelPosition" :size="(formConfig as any).size" :gutter="formConfig.gutter" :disabled="formConfig.disabled" :label-width="formConfig.labelWidth + 'px'">
          <Draggable class="drawing-board" :list="drawingList" :animation="340" group="componentsGroup" item-key="index">
            <!-- 渲染器 -->
            <FormBuilder :options="drawingList" :formId="formConfig" :activeId="activeId" @currentItem="activeFormItem" />
          </Draggable>
          <div v-if="drawingList.length == 0" class="empty-info">从左侧拖入或点选组件进行表单设计</div>
        </el-form>
      </el-scrollbar>
    </div>
    <!-- 左侧设置编辑区域 -->
    <RightPanel :active-data="activeData" :form-conf="formConfig" :show-field="!!drawingList.length"></RightPanel>
  </div>
</template>

<style lang="scss">
@import "../../assets/style/home.scss";
</style>
