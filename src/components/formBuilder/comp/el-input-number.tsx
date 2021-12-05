import { defineComponent } from "vue"
import { ElInputNumber } from "element-plus"

export default defineComponent({
  props: {
    conf: {
      type: Object,
      default: {}
    }
  },
  setup(props, { emit }) {

    const change = (val: number) => {
      props.conf.__config__.defaultValue = val
      emit('update:conf')
    }

    return {
      change,
      props
    }
  },
  render() {
    const { conf } = this.props
    const { change } = this
    const isDisabled = conf["disabled"]

    return (
      <ElInputNumber modelValue={conf.defaultVal} disabled={isDisabled} placeholder={conf.placeholder} onChange={change} />
    )
  }
})