<script lang="ts" setup>
import ElInput from "./comp/el-input"
import ElInputNum from "./comp/el-input-number"
import ElSelect from "./comp/el-select"

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
  <el-form-item
    v-for="(item,index) in options"
    :key="index"
    class="drawing-item active-from-item"
    :label="item.__config__.label"
    :label-width="item.__config__.labelWidth"
    :rules="[{
      required: item.__config__.required,
      message: 'Please input email address',
      trigger: 'blur',
    },]"
    @click="currentItem(item)"
  >
    <el-col :span="item.__config__.span">
      <ElInput v-if="item.__config__.tag === 'el-input'" :conf="item" />
      <ElInputNum v-if="item.__config__.tag === 'el-input-number'" :conf="item" />
      <ElSelect v-if="item.__config__.tag === 'el-select'" :conf="item" />
    </el-col>
  </el-form-item>
</template>