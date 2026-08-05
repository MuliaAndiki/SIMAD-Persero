export function camelCaseToWords(str: string) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}

export function kebabCaseToWords(str: string) {
  return str.replace(/[-/]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
