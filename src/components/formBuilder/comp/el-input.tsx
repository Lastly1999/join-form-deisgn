import { defineComponent } from "vue"
import { ElInput } from "element-plus"


const elInput = defineComponent({
  props: {
    conf: {
      type: Object,
      default: {}
    }
  },
  setup(props, { emit }) {

    const change = (val: string) => {
      props.conf.defaultValue = val
      emit('update:conf')
    }

    return {
      change,
      props
    }
  },
  render() {
    const { props, change } = this
    const isPassWord = props.conf['show-password'] ? 'passWord' : ''
    return (
      <ElInput
        style={{ width: props.conf.style.width }}
        type={isPassWord}
        placeholder={props.conf.placeholder}
        modelValue={props.conf.defaultValue}
        clearable={props.conf.clearable}
        onInput={change}
      ></ElInput>
    )
  }
})

export default elInput