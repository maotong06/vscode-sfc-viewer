export function templateRender(originStr: string, obj: { [k: string]: any }) {
  return originStr.replace(/{{(.*?)}}/g, (match, key) => obj[key.trim()])
}