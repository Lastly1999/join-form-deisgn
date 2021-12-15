<script lang="ts" setup>
import { watch } from "vue"
import ElInput from "./comp/el-input"
import ElInputNum from "./comp/el-input-number"
import ElSelect from "./comp/el-select"

const props = defineProps({
  options: {
    type: Array as unknown as any[],
    default: []
  },
  activeId: {
    type: [String, Number]
  }
})

const emit = defineEmits(['currentItem'])

const currentItem = (item: any) => {
  emit('currentItem', item)
}

watch(() => props.activeId, (v) => { console.log(v, props.options) }, { deep: true })

</script>
<template>
  <el-form-item
    v-for="(item,index) in options"
    :key="index"
    :class="activeId === item.__config__.formId
    ? 'drawing-row-item active-from-item'
    : 'drawing-row-item'"
    :label="item.__config__.label"
    :label-width="item.__config__.labelWidth"
    :rules="[{
      required: item.__config__.required,
      trigger: 'blur',
    },]"
    @click.native="currentItem(item)"
  >
    <el-col class="form-item-col" :span="item.__config__.span">
      <ElInput v-if="item.__config__.tag === 'el-input'" :conf="item" />
      <ElInputNum v-if="item.__config__.tag === 'el-input-number'" :conf="item" />
      <ElSelect v-if="item.__config__.tag === 'el-select'" :conf="item" />
    </el-col>
  </el-form-item>
</template>
<style lang="scss">
@import "../../assets/style/home.scss";
</style>