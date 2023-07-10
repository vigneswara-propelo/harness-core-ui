export const parseJSON = (str: string): object => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return {}
  }
}
