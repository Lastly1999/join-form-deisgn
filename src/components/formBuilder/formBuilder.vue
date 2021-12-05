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
      <ElInputNumber v-if="item.__config__.tag === 'el-input-number'" :modelValue="item.__config__.defaultValue" :conf="item" />
    </el-col>
  </el-form-item>
</template>