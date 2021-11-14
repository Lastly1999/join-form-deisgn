<script lang="ts" setup>
import ElInput from "./comp/el-input"
import ElInputNumber from "./comp/el-input-number"

defineProps({
  options: {
    type: Array as unknown as any[],
    default: []
  }
})

const emit = defineEmits(['currentItem'])

const currentItem = (item: any) => {
  emit('currentItem', item)
}


</script>
<template>
  <el-col v-for="item in options" :span="item.__config__.span">
    <el-form-item :label="item.__config__.label" label-width="100px" @click="currentItem(item)">
      <ElInput v-if="item.__config__.tag === 'el-input'" :conf="item" />
      <ElInputNumber :modelValue="item.defaultVal" v-if="item.__config__.tag === 'el-input-number'" :conf="item" />
    </el-form-item>
  </el-col>
</template>