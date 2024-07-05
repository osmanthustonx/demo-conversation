export function isNormalName(address: string) {
  const regex = /^[\d\sA-Za-z\u4E00-\u9FA5]{1,20}$/;
  return !!regex.test(address);
}
