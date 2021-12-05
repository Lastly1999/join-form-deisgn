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
      props.conf.__config__.defaultValue = val
      emit('update:conf')
    }

    return {
      change,
      props
    }
  },
  render() {
    const { props, change } = this
    const inputType = props.conf['show-password'] ? 'passWord' : 'text'
    const isShowWordLimit = props.conf["show-word-limit"]
    const isReadonly = props.conf["readonly"]
    const isDisabled = props.conf["disabled"]

    return (
      <ElInput
        style={{ width: props.conf.style.width }}
        readonly={isReadonly}
        type={inputType}
        disabled={isDisabled}
        placeholder={props.conf.placeholder}
        modelValue={props.conf.__config__.defaultValue}
        show-word-limit={isShowWordLimit}
        clearable={props.conf.clearable}
        onInput={change}
      ></ElInput>
    )
  }
})

export default elInput