import { defineComponent } from "vue"
import { ElInputNumber } from "element-plus"

export default defineComponent({
  props: {
    conf: {
      type: Object,
      default: {}
    }
  },
  setup(props, _) {
    return {
      props
    }
  },
  render() {
    const { conf } = this.props
    return (
      <ElInputNumber modelValue={conf.defaultVal} placeholder={conf.placeholder} />
    )
  }
})