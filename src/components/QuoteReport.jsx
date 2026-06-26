import { useMemo, useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import { PRODUCT_NAMES, getProduct, getSizesForName } from '../data/products'
import { formatVND } from '../utils/format'
import './QuoteReport.css'

const EMPTY_ROW = { name: '', size: '', quantity: '' }

const SAMPLE_ROWS = [
  { name: 'Túi xách', size: 'BT', quantity: 2 },
  { name: 'Hộp gọng', size: 'BT', quantity: 24 },
  { name: 'Túi xách', size: 'Lớn', quantity: 2 },
  { name: 'Hộp gọng', size: 'Lớn', quantity: 24 },
]

function createRowId() {
  return crypto.randomUUID()
}

function buildInitialRows() {
  return SAMPLE_ROWS.map((row) => ({ ...row, id: createRowId() }))
}

export default function QuoteReport() {
  const reportRef = useRef(null)
  const [recipient, setRecipient] = useState()
  const [rows, setRows] = useState(buildInitialRows)
  const [deliveryDay, setDeliveryDay] = useState()
  const [deliveryMonth, setDeliveryMonth] = useState()
  const [deliveryYear, setDeliveryYear] = useState()
  const [deliverer, setDeliverer] = useState()
  const [exporting, setExporting] = useState(false)

  const lineItems = useMemo(
    () =>
      rows.map((row) => {
        const product = getProduct(row.name, row.size)
        const quantity = Number(row.quantity) || 0
        const unitPrice = product?.price ?? 0
        const availableSizes = getSizesForName(row.name)
        return {
          ...row,
          unitPrice,
          quantity,
          lineTotal: unitPrice * quantity,
          availableSizes,
        }
      }),
    [rows],
  )

  const grandTotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [lineItems],
  )

  function updateRow(id, field, value) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row

        if (field === 'name') {
          const sizes = getSizesForName(value)
          const size = sizes.includes(row.size) ? row.size : ''
          return { ...row, name: value, size }
        }

        return { ...row, [field]: value }
      }),
    )
  }

  function addRow() {
    setRows((current) => [...current, { ...EMPTY_ROW, id: createRowId() }])
  }

  function removeRow(id) {
    setRows((current) =>
      current.length > 1 ? current.filter((row) => row.id !== id) : current,
    )
  }

  async function exportPdf() {
    const element = reportRef.current
    if (!element) return

    setExporting(true)
    element.classList.add('pdf-export')

    try {
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `bang-bao-gia-${deliveryDay}-${deliveryMonth}-${deliveryYear}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()
    } finally {
      element.classList.remove('pdf-export')
      setExporting(false)
    }
  }

  return (
    <div className="quote-page">
      <div className="toolbar no-print">
        <button type="button" onClick={addRow}>
          + Thêm dòng
        </button>
        <button type="button" onClick={exportPdf} disabled={exporting}>
          {exporting ? 'Đang tạo PDF…' : 'In / Xuất PDF'}
        </button>
      </div>

      <article ref={reportRef} className="quote-report">
        <header className="quote-header">
          <div className="logo-box" aria-hidden="true">
            <span className="logo-t">T</span>
            <span className="logo-n">N</span>
          </div>
          <div className="company-info">
            <h1>Hộp Kính TUẤN NGUYÊN</h1>
            <p>61/12/17/41 TX33, P. Thới An, Tp. Hồ Chí Minh.</p>
            <p>SĐT: 0937 550 775 - 0903 311 427</p>
          </div>
        </header>

        <div className="recipient-line">
          <span>Gửi đến:</span>
          <span className="print-value">{recipient}</span>
          <input
            className="screen-only"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Tên khách hàng"
          />
        </div>

        <h2 className="quote-title">BẢNG BÁO GIÁ</h2>

        <table className="quote-table">
          <thead>
            <tr>
              <th>TÊN</th>
              <th>SIZE</th>
              <th>ĐƠN GIÁ</th>
              <th>SL</th>
              <th>THÀNH TIỀN</th>
              <th className="screen-only col-actions" aria-label="Thao tác" />
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id}>
                <td className="col-name">
                  <span className="print-value">{item.name}</span>
                  <select
                    className="screen-only"
                    value={item.name}
                    onChange={(e) => updateRow(item.id, 'name', e.target.value)}
                  >
                    <option value="">-- Chọn --</option>
                    {PRODUCT_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="col-size">
                  <span className="print-value">{item.size}</span>
                  <select
                    className="screen-only"
                    value={item.size}
                    disabled={!item.name}
                    onChange={(e) => updateRow(item.id, 'size', e.target.value)}
                  >
                    <option value="">--</option>
                    {item.availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="col-price">{formatVND(item.unitPrice)}</td>
                <td className="col-qty">
                  <span className="print-value">{item.quantity || ''}</span>
                  <input
                    className="screen-only"
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateRow(item.id, 'quantity', e.target.value)}
                  />
                </td>
                <td className="col-total">{formatVND(item.lineTotal)}</td>
                <td className="screen-only col-actions">
                  <button type="button" className="remove-row" onClick={() => removeRow(item.id)}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td />
              <td />
              <td className="total-label">TC:</td>
              <td />
              <td className="col-total grand-total">{formatVND(grandTotal)}</td>
              <td className="screen-only" />
            </tr>
          </tfoot>
        </table>

        <footer className="quote-footer">
          <div className="footer-field">
            <span>GIAO NGÀY:</span>
            <span className="print-value">
              {deliveryDay} / {deliveryMonth} / {deliveryYear}
            </span>
            <span className="screen-only date-inputs">
              <input
                type="text"
                value={deliveryDay}
                onChange={(e) => setDeliveryDay(e.target.value)}
                aria-label="Ngày giao"
                placeholder="Ngày"
              />
              /
              <input
                type="text"
                value={deliveryMonth}
                onChange={(e) => setDeliveryMonth(e.target.value)}
                aria-label="Tháng giao"
                placeholder="Tháng"
              />
              /
              <input
                type="text"
                value={deliveryYear}
                onChange={(e) => setDeliveryYear(e.target.value)}
                aria-label="Năm giao"
                placeholder="Năm"
              />
            </span>
          </div>
          <div className="footer-field">
            <span>NGƯỜI GIAO:</span>
            <span className="print-value">{deliverer}</span>
            <input
              className="screen-only"
              type="text"
              value={deliverer}
              onChange={(e) => setDeliverer(e.target.value)}
            />
          </div>
          <p className="footer-note">
            Lưu ý: Xin thanh toán hóa đơn không quá 7 ngày kể từ khi giao hàng.
          </p>
        </footer>
      </article>
    </div>
  )
}
