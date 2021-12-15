import { exportDefault, titleCase, deepClone, vueImportStgr } from "../../utils/index";
import ruleTrigger from "./rule";

const units = {
  KB: "1024",
  MB: "1024 / 1024",
  GB: "1024 / 1024 / 1024",
};
let confGlobal: any;
// const inheritAttrs = {
//   file: '',
//   dialog: 'inheritAttrs: false,'
// }

/**
 * 组装js 【入口函数】
 * @param {Object} formConfig 整个表单配置
 * @param {String} type 生成类型，文件或弹窗等
 */
export function makeUpJs(formConfig: { fields: any[] }, type: any) {
  confGlobal = formConfig = deepClone(formConfig);
  const dataList: any[] = [];
  const ruleList: any[] = [];
  const optionsList: any[] = [];
  const propsList: any[] = [];
  const methodList = mixinMethod(type);
  const uploadVarList: any[] = [];
  const created: any[] = [];
  console.log(formConfig);
  formConfig.fields.forEach((el: any) => {
    buildAttributes(el, dataList, ruleList, optionsList, methodList, propsList, uploadVarList, created);
  });
  const script = buildexport(
    formConfig as any,
    type,
    dataList.join("\n"),
    ruleList.join("\n"),
    optionsList.join("\n"),
    uploadVarList.join("\n"),
    propsList.join("\n"),
    methodList.join("\n"),
    created.join("\n")
  );
  confGlobal = null;
  return script;
}

// 构建组件属性
function buildAttributes(
  scheme: { [x: string]: any; __config__: any; __slot__: any; options: any; __vModel__: any; props: { props: any }; action: any },
  dataList: any[],
  ruleList: any[],
  optionsList: any[],
  methodList: any[],
  propsList: any[],
  uploadVarList: any[],
  created: any[]
) {
  const config = scheme.__config__;
  const slot = scheme.__slot__;
  buildData(scheme, dataList);
  buildRules(scheme as any, ruleList);

  // 特殊处理options属性
  if (scheme.options || (slot && slot.options && slot.options.length)) {
    buildOptions(scheme, optionsList);
    if (config.dataType === "dynamic") {
      const model = `${scheme.__vModel__}Options`;
      const options = titleCase(model);
      const methodName = `get${options}`;
      // buildOptionMethod(methodName, model, methodList, scheme)
      callInCreated(methodName, created);
    }
  }

  // 处理props
  if (scheme.props && scheme.props.props) {
    buildProps(scheme, propsList);
  }

  // 处理el-upload的action
  if (scheme.action && config.tag === "el-upload") {
    uploadVarList.push(
      `${scheme.__vModel__}Action: '${scheme.action}',
      ${scheme.__vModel__}fileList: [],`
    );
    methodList.push(buildBeforeUpload(scheme as any));
    // 非自动上传时，生成手动上传的函数
    if (!scheme["auto-upload"]) {
      methodList.push(buildSubmitUpload(scheme));
    }
  }

  // 构建子级组件属性
  if (config.children) {
    config.children.forEach((item: any) => {
      buildAttributes(item, dataList, ruleList, optionsList, methodList, propsList, uploadVarList, created);
    });
  }
}

// 在Created调用函数
function callInCreated(methodName: string, created: string[]) {
  created.push(`this.${methodName}()`);
}

// 混入处理函数
function mixinMethod(type: string | number) {
  const list: any[] = [];
  const minxins = {
    file: confGlobal.formBtns
      ? {
          submitForm: `submitForm() {
        this.$refs['${confGlobal.formRef}'].validate(valid => {
          if(!valid) return
          // TODO 提交表单
        })
      },`,
          resetForm: `resetForm() {
        this.$refs['${confGlobal.formRef}'].resetFields()
      },`,
        }
      : null,
    dialog: {
      onOpen: "onOpen() {},",
      onClose: `onClose() {
        this.$refs['${confGlobal.formRef}'].resetFields()
      },`,
      close: `close() {
        this.$emit('update:visible', false)
      },`,
      handelConfirm: `handelConfirm() {
        this.$refs['${confGlobal.formRef}'].validate(valid => {
          if(!valid) return
          this.close()
        })
      },`,
    },
  };

  const methods = (minxins as any)[type];
  if (methods) {
    Object.keys(methods).forEach((key) => {
      list.push(methods[key]);
    });
  }

  return list;
}

// 构建data
function buildData(scheme: { __config__: any; __vModel__: undefined }, dataList: string[]) {
  const config = scheme.__config__;
  if (scheme.__vModel__ === undefined) return;
  const defaultValue = JSON.stringify(config.defaultValue);
  dataList.push(`${scheme.__vModel__}: ${defaultValue},`);
}

// 构建校验规则
function buildRules(scheme: { __config__: any; __vModel__: undefined; placeholder: any }, ruleList: string[]) {
  const config = scheme.__config__;
  if (scheme.__vModel__ === undefined) return;
  const rules = [];
  if ((ruleTrigger as any)[config.tag]) {
    if (config.required) {
      const type = Array.isArray(config.defaultValue) ? "type: 'array'," : "";
      let message = Array.isArray(config.defaultValue) ? `请至少选择一个${config.label}` : scheme.placeholder;
      if (message === undefined) message = `${config.label}不能为空`;
      rules.push(`{ required: true, ${type} message: '${message}', trigger: '${(ruleTrigger as any)[config.tag]}' }`);
    }
    if (config.regList && Array.isArray(config.regList)) {
      config.regList.forEach((item: { pattern: string; message: any }) => {
        if (item.pattern) {
          rules.push(`{ pattern: ${eval(item.pattern)}, message: '${item.message}', trigger: '${(ruleTrigger as any)[config.tag]}' }`);
        }
      });
    }
    ruleList.push(`${scheme.__vModel__}: [${rules.join(",")}],`);
  }
}

// 构建options
function buildOptions(scheme: { options?: any }, optionsList: string[]) {
  if ((scheme as any).__vModel__ === undefined) return;
  // el-cascader直接有options属性，其他组件都是定义在slot中，所以有两处判断
  let { options } = scheme;
  if (!options) options = (scheme as any).__slot__.options;
  if ((scheme as any).__config__.dataType === "dynamic") {
    options = [];
  }
  const str = `${(scheme as any).__vModel__}Options: ${JSON.stringify(options)},`;
  console.log(optionsList);
  optionsList.push(str);
}

function buildProps(scheme: { __vModel__: any; props: { props: any } }, propsList: string[]) {
  const str = `${scheme.__vModel__}Props: ${JSON.stringify(scheme.props.props)},`;
  propsList.push(str);
}

// el-upload的BeforeUpload
function buildBeforeUpload(scheme: { __config__: any; accept: any; __vModel__: any }) {
  const config = scheme.__config__;
  const unitNum = (units as any)[config.sizeUnit];
  let rightSizeCode = "";
  let acceptCode = "";
  const returnList = [];
  if (config.fileSize) {
    rightSizeCode = `let isRightSize = file.size / ${unitNum} < ${config.fileSize}
    if(!isRightSize){
      this.$message.error('文件大小超过 ${config.fileSize}${config.sizeUnit}')
    }`;
    returnList.push("isRightSize");
  }
  if (scheme.accept) {
    acceptCode = `let isAccept = new RegExp('${scheme.accept}').test(file.type)
    if(!isAccept){
      this.$message.error('应该选择${scheme.accept}类型的文件')
    }`;
    returnList.push("isAccept");
  }
  const str = `${scheme.__vModel__}BeforeUpload(file) {
    ${rightSizeCode}
    ${acceptCode}
    return ${returnList.join("&&")}
  },`;
  return returnList.length ? str : "";
}

// el-upload的submit
function buildSubmitUpload(scheme: { __vModel__: any }) {
  const str = `submitUpload() {
    this.$refs['${scheme.__vModel__}'].submit()
  },`;
  return str;
}

// function buildOptionMethod(methodName: string, model: string, methodList: string[], scheme: { __config__: any }) {
//   const config = scheme.__config__;
//   const str = `${methodName}() {
//     // 注意：this.$axios是通过Vue.prototype.$axios = axios挂载产生的
//     this.$axios({
//       method: '${config.method}',
//       url: '${config.url}'
//     }).then(resp => {
//       var { data } = resp
//       this.${model} = data.${config.dataPath}
//     })
//   },`;
//   methodList.push(str);
// }

// js整体拼接
function buildexport(
  conf: { formRef: string; formModel: any; formRules: any },
  type: string | number,
  data: string,
  rules: string,
  selectOptions: string,
  uploadVar: string,
  props: string,
  methods: string,
  created: string
) {
  const str1 = `${vueImportStgr}
  ${exportDefault}{
  setup () {

    const ${conf.formRef} = ref(null)
    \n
    const ${conf.formModel} = ref({
      ${data}
    })
    \n
    const ${conf.formRules} = ref({
      ${rules}
    })
    \n
    ${
      selectOptions &&
      `const ${selectOptions.split(":")[0]} = ref(
      ${selectOptions.split("Options:")[1]}
    )`
    }
    \n
    return {
      ${conf.formRules},
      ${conf.formModel},
      ${selectOptions.split(":")[0]},
      ${uploadVar}
      ${props}
    }
  }
}`;
  return str1;
}
