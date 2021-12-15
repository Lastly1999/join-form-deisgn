import { defineComponent } from "vue"
import { ElSelect, ElOption } from "element-plus"


export type SelectItemOptions = {
  label: string;
  value: string;
}

const Select = defineComponent({
  props: {
    conf: {
      type: Object,
      default: {}
    }
  },
  setup(props, { emit }) {

    const change = (event: number | number[]) => {
      props.conf.__config__.defaultValue = event
    }

    return {
      change,
      props
    }
  },
  render() {
    const { change } = this
    const { conf } = this.props
    // 组件配置
    const { disabled, clearable, filterable, multiple, placeholder, style } = conf
    const { defaultValue } = conf.__config__

    return (
      <ElSelect
        style={{ width: style.width }}
        modelValue={defaultValue}
        disabled={disabled}
        placeholder={placeholder}
        clearable={clearable}
        filterable={filterable}
        multiple={multiple}
        onChange={change}
      >
        {
          conf.__slot__.options && conf.__slot__.options.map((item: SelectItemOptions) => {
            return <ElOption key={item.value} label={item.label} value={item.value} />
          })
        }
      </ElSelect>
    )
  }
})

export default Select