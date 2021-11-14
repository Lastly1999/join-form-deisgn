const DRAWING_ID = 'idGlobal'
const FORM_CONF = 'formConf'


// 获取全局变量
export function getIdGlobal() {
  const str = localStorage.getItem(DRAWING_ID)
  if (str) return parseInt(str, 10)
  return 100
}


// 存储全局数据
export function saveIdGlobal(id: string | number) {
  localStorage.setItem(DRAWING_ID, `${id}`)
}

export function saveFormConf(obj: any) {
  localStorage.setItem(FORM_CONF, JSON.stringify(obj))
}