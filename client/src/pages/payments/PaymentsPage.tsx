import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { paymentApi, studentApi } from '@/api/services'
import type { Payment, PaymentReportItem, Student } from '@/types'
import { Button, Modal, PageHeader, Table, Badge } from '@/components/shared'
import { Plus, FileText } from 'lucide-react'
import './PaymentsPage.css'

type TabKey = 'list' | 'report'

export default function PaymentsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabKey>('list')
  const [payments, setPayments] = useState<Payment[]>([])
  const [report, setReport] = useState<PaymentReportItem[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7))

  // Payment modal
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ student_id: '', amount: '', method: 'cash', month: new Date().toISOString().slice(0, 7), description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadPayments = () => {
    setLoading(true)
    paymentApi.getAll()
      .then((r) => setPayments(r.data))
      .finally(() => setLoading(false))
  }

  const loadReport = () => {
    setLoading(true)
    paymentApi.getMonthlyReport(reportMonth)
      .then((r) => setReport(r.data.report || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { studentApi.getAll().then((r) => setStudents(r.data)) }, [])
  useEffect(() => { if (tab === 'list') loadPayments(); else loadReport() }, [tab])
  useEffect(() => { if (tab === 'report') loadReport() }, [reportMonth])

  const filteredPayments = payments.filter((p) =>
    p.student?.name.toLowerCase().includes(search.toLowerCase()) ||
    p.month.includes(search)
  )

  const filteredReport = report.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  )

  const openModal = () => {
    setForm({ student_id: '', amount: '', method: 'cash', month: new Date().toISOString().slice(0, 7), description: '' })
    setError(''); setModal(true)
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await paymentApi.deposit({ ...form, student_id: +form.student_id, amount: +form.amount } as any)
      setModal(false); loadPayments()
    } catch (err: any) {
      setError(err.response?.data?.message || "Xatolik")
    } finally { setSaving(false) }
  }

  const methodLabel: Record<string, string> = { cash: 'Naqd', card: 'Karta', transfer: "O'tkazma" }
  const typeLabel: Record<string, { label: string; variant: any }> = {
    deposit: { label: "Kirim",    variant: 'green'  },
    charge:  { label: "Avtomatik", variant: 'gray' },
    refund:  { label: "Qaytarildi", variant: 'yellow' },
  }

  const payColumns = [
    { key: 'num', title: '№', width: '50px', render: (_: any, i: number) => <span style={{color:'var(--text-muted)',fontWeight:600}}>{i+1}</span> },
    { key: 'student', title: "O'quvchi", render: (p: Payment) => (
      <div>
        <div style={{fontWeight:600}}>{p.student?.name}</div>
        <div style={{fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{p.student?.phone}</div>
      </div>
    )},
    { key: 'amount', title: "Summa", render: (p: Payment) => (
      <span style={{fontWeight:700,color:'var(--accent-success)'}}>{Number(p.amount).toLocaleString()} so'm</span>
    )},
    { key: 'method', title: "Usul", render: (p: Payment) => <Badge variant="blue">{methodLabel[p.method] || p.method}</Badge> },
    { key: 'type', title: "Tur", render: (p: Payment) => {
      const t = typeLabel[p.type] || { label: p.type, variant: 'gray' }
      return <Badge variant={t.variant}>{t.label}</Badge>
    }},
    { key: 'month', title: "Oy", render: (p: Payment) => (
      <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)'}}>{p.month}</span>
    )},
    { key: 'admin', title: "Admin", render: (p: Payment) => p.admin?.name || <span style={{color:'var(--text-muted)'}}>Auto</span> },
    { key: 'date', title: "Sana", render: (p: Payment) => new Date(p.createdAt).toLocaleDateString('uz-UZ') },
  ]

  const reportColumns = [
    { key: 'num', title: '№', width: '50px', render: (_: any, i: number) => <span style={{color:'var(--text-muted)',fontWeight:600}}>{i+1}</span> },
    { key: 'name', title: "O'quvchi", render: (r: PaymentReportItem) => (
      <div>
        <div style={{fontWeight:600}}>{r.name}</div>
        <div style={{fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{r.phone}</div>
      </div>
    )},
    { key: 'totalFee', title: "Oylik to'lov", render: (r: PaymentReportItem) => (
      <span style={{fontWeight:600}}>{Number(r.totalFee).toLocaleString()} so'm</span>
    )},
    { key: 'balance', title: "Balans", render: (r: PaymentReportItem) => {
      const n = Number(r.balance)
      const cls = n >= 0 ? 'pos' : 'neg'
      return <span className={`balance-chip balance-chip--${cls}`}>{n.toLocaleString()} so'm</span>
    }},
    { key: 'debt', title: "Qarzdorlik", render: (r: PaymentReportItem) => (
      r.debt > 0
        ? <span style={{color:'var(--accent-danger)',fontWeight:700}}>{Number(r.debt).toLocaleString()} so'm</span>
        : <span style={{color:'var(--accent-success)',fontWeight:600}}>—</span>
    )},
    { key: 'status', title: "Holat", render: (r: PaymentReportItem) => (
      <Badge variant={r.status === 'paid' ? 'green' : 'red'}>
        {r.status === 'paid' ? "To'lagan ✓" : "Qarzdor ✗"}
      </Badge>
    )},
  ]

  const paidCount = report.filter((r) => r.status === 'paid').length
  const debtCount = report.filter((r) => r.status === 'debt').length
  const totalDebt = report.reduce((s, r) => s + r.debt, 0)

  return (
    <div className="page">
      <PageHeader
        title={t('payments')}
        search={search}
        onSearch={setSearch}
        action={<Button icon={<Plus size={16}/>} onClick={openModal}>To'lov qabul qilish</Button>}
      />

      {/* Tabs */}
      <div className="pay-tabs">
        <button className={`pay-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          <FileText size={15}/> Barcha to'lovlar
        </button>
        <button className={`pay-tab ${tab === 'report' ? 'active' : ''}`} onClick={() => setTab('report')}>
          <FileText size={15}/> Oylik hisobot
        </button>
      </div>

      {tab === 'report' && (
        <>
          <div className="report-controls">
            <div className="input-group" style={{flexDirection:'row',alignItems:'center',gap:10}}>
              <label className="input-label" style={{margin:0,whiteSpace:'nowrap'}}>Oy:</label>
              <input type="month" className="input-field" value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)} style={{width:'auto'}}/>
            </div>
            <div className="report-summary">
              <span className="summary-chip summary-chip--green">✓ To'lagan: {paidCount}</span>
              <span className="summary-chip summary-chip--red">✗ Qarzdor: {debtCount}</span>
              <span className="summary-chip summary-chip--red">Jami qarzdorlik: {totalDebt.toLocaleString()} so'm</span>
            </div>
          </div>
        </>
      )}

      <Table
        columns={tab === 'list' ? payColumns : reportColumns}
        data={tab === 'list' ? filteredPayments : filteredReport}
        rowKey={(r: any) => r.id || r.student_id}
        loading={loading}
        emptyMessage={tab === 'list' ? "To'lovlar mavjud emas" : "Hisobot ma'lumotlari yo'q"}
      />

      <Modal open={modal} onClose={() => setModal(false)} title="To'lov qabul qilish" size="sm">
        <form onSubmit={handlePay} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="input-group">
            <label className="input-label">O'quvchi</label>
            <select className="input-field" value={form.student_id}
              onChange={(e) => setForm({...form, student_id: e.target.value})} required>
              <option value="">Tanlang</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.phone}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Summa (so'm)</label>
            <input className="input-field" type="number" placeholder="500000"
              value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required min={1}/>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">To'lov usuli</label>
              <select className="input-field" value={form.method} onChange={(e) => setForm({...form, method: e.target.value})}>
                <option value="cash">Naqd</option>
                <option value="card">Karta</option>
                <option value="transfer">O'tkazma</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Oy</label>
              <input className="input-field" type="month" value={form.month}
                onChange={(e) => setForm({...form, month: e.target.value})} required/>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Izoh (ixtiyoriy)</label>
            <input className="input-field" placeholder="Izoh..." value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}/>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Bekor</Button>
            <Button type="submit" loading={saving}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
