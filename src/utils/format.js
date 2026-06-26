export function formatVND(amount) {
  if (!amount && amount !== 0) return ''
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`
}
