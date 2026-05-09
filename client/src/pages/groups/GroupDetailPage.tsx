import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { groupApi, studentApi, paymentApi, attendanceApi } from '@/api/services'
import type { Group, Student } from '@/types'
import { Button, Modal, Badge, PageHeader, Table, ConfirmModal } from '@/components/shared'
import {
  ArrowLeft, UserPlus, CheckSquare, Square, Calendar,
  CreditCard, Users, AlertTriangle, Phone, Clock, BookOpen,
} from 'lucide-react'
import './GroupDetailPage.css'

const today = () => new Date().toISOString().split('T')[0]

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)

  // Attendance state
  const [attDate, setAttDate] = useState(today())
  const [attMap, setAttMap] = useState<Record<number, 'present' | 'absent' | 'late'>>({})
  const [savingAtt, setSavingAtt] = useState(false)
  const [attSaved, setAttSaved] = useState(false)

  // Payment modal
  const [payModal, setPayModal] = useState(false)
  const [payStudentId, setPayStudentId] = useState<number | ''>('')
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payMonth, setPayMonth] = useState(new Date().toISOString().slice(0, 7))
  const [payDesc, setPayDesc] = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')

  // Add student modal
  const [addStudentModal, setAddStudentModal] = useState(false)
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [addSearch, setAddSearch] = useState('')
  const [addingId, setAddingId] = useState<number | null>(null)

  // Monthly debtors
  const [debtors, setDebtors] = useState<Student[]>([])
  const [removeStudentId, setRemoveStudentId] = useState<number | null>(null)

  const load = useCallback(() => {
    if (!id) return
    setLoading(true)
    groupApi.getOne(+id)
      .then((r) => {
        setGroup(r.data)
        // init attendance map
        const map: Record<number, 'present' | 'absent' | 'late'> = {}
        r.data.students?.forEach((s) => { map[s.id] = 'present' })
        setAttMap(map)
        // calc debtors (students with balance < monthly_fee)
        const fee = Number(r.data.monthly_fee)
        setDebtors((r.data.students || []).filter((s) => Number(s.balance) < fee))
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  // Load existing attendance for selected date
  useEffect(() => {
    if (!id || !group) return
    attendanceApi.getByGroup(+id, attDate).then((r) => {
      const map: Record<number, 'present' | 'absent' | 'late'> = {}
      group.students?.forEach((s) => { map[s.id] = 'present' })
      r.data.forEach((a: any) => { map[a.student_id || a.student?.id] = a.status })
      setAttMap(map)
    }).catch(() => {})
  }, [id, attDate, group])

  const toggleStatus = (sid: number) => {
    setAttMap((prev) => {
      const cur = prev[sid] || 'present'
      const next = cur === 'present' ? 'absent' : cur === 'absent' ? 'late' : 'present'
      return { ...prev, [sid]: next }
    })
  }

  const saveAttendance = async () => {
    if (!group) return
    setSavingAtt(true)
    try {
      await attendanceApi.bulkCreate({
        group_id: group.id,
        date: attDate,
        records: (group.students || []).map((s) => ({
          student_id: s.id,
          status: attMap[s.id] || 'present',
        })),
      })
      setAttSaved(true)
      setTimeout(() => setAttSaved(false), 2000)
    } finally { setSavingAtt(false) }
  }

  const openPayModal = (sid?: number) => {
    setPayStudentId(sid ?? '')
    setPayAmount('')
    setPayMethod('cash')
    setPayMonth(new Date().toISOString().slice(0, 7))
    setPayDesc('')
    setPayError('')
    setPayModal(true)
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payStudentId) return
    setPayLoading(true); setPayError('')
    try {
      await paymentApi.deposit({ student_id: +payStudentId, amount: +payAmount, method: payMethod as any, month: payMonth, description: payDesc })
      setPayModal(false); load()
    } catch (err: any) {
      setPayError(err.response?.data?.message || "Xatolik")
    } finally { setPayLoading(false) }
  }

  const openAddStudent = async () => {
    const r = await studentApi.getAll()
    const existing = new Set(group?.students?.map((s) => s.id) || [])
    setAllStudents(r.data.filter((s: Student) => !existing.has(s.id)))
    setAddSearch(''); setAddStudentModal(true)
  }

  const handleAddStudent = async (sid: number) => {
    if (!id) return
    setAddingId(sid)
    await groupApi.addStudent(+id, sid)
    setAddingId(null); setAddStudentModal(false); load()
  }

  const handleRemoveStudent = async () => {
    if (!id || !removeStudentId) return
    await groupApi.removeStudent(+id, removeStudentId)
    setRemoveStudentId(null); load()
  }

  if (loading) return <div className="page-loading"><div className="loading-spinner-lg"/></div>
  if (!group) return <div className="page"><p>Guruh topilmadi</p></div>

  const students = group.students || []
  const paidCount = students.filter((s) => Number(s.balance) >= Number(group.monthly_fee)).length

  return (
    <div className="group-detail">
      {/* Page header */}
      <div className="gd-topbar">
        <button className="btn-back-nav" onClick={() => navigate('/groups')}>
          <ArrowLeft size={18}/> Guruhlar
        </button>
        <div className="gd-topbar-actions">
          <Button size="sm" variant="secondary" icon={<UserPlus size={14}/>} onClick={openAddStudent}>
            O'quvchi qo'shish
          </Button>
          <Button size="sm" icon={<CreditCard size={14}/>} onClick={() => openPayModal()}>
            To'lov qabul qilish
          </Button>
        </div>
      </div>

      <div className="gd-layout">
        {/* LEFT: group info + debtors */}
        <div className="gd-left">
          {/* Group info card */}
          <div className="gd-info-card">
            <h2 className="gd-group-name">{group.name}</h2>
            {group.teacher && (
              <div className="gd-teacher-row">
                <div className="gd-teacher-avatar">
                  {group.teacher.image
                    ? <img src={group.teacher.image} alt={group.teacher.name}/>
                    : group.teacher.name[0]}
                </div>
                <div>
                  <div className="gd-info-label">O'qituvchi:</div>
                  <div className="gd-teacher-name">{group.teacher.name}</div>
                  <div className="gd-teacher-phone"><Phone size={12}/> {group.teacher.phone}</div>
                </div>
              </div>
            )}
            <div className="gd-meta-rows">
              <div className="gd-meta-row">
                <span className="gd-meta-label">Dars kunlari:</span>
                <span className="gd-meta-val">{group.week_days === 'odd' ? 'Du-Chor-Ju' : 'Se-Pay-Sha'}</span>
              </div>
              <div className="gd-meta-row">
                <span className="gd-meta-label">Dars vaqti:</span>
                <span className="gd-meta-val"><Clock size={13}/> {group.lesson_time}</span>
              </div>
              <div className="gd-meta-row">
                <span className="gd-meta-label">O'quvchilar soni:</span>
                <span className="gd-meta-val"><Users size={13}/> {students.length} ta</span>
              </div>
              <div className="gd-meta-row">
                <span className="gd-meta-label">To'lov qilganlar:</span>
                <span className="gd-meta-val gd-val-green">{paidCount} ta</span>
              </div>
              <div className="gd-meta-row">
                <span className="gd-meta-label">Oylik to'lov:</span>
                <span className="gd-meta-val gd-val-green">{Number(group.monthly_fee).toLocaleString()} so'm</span>
              </div>
            </div>
          </div>

          {/* Debtors */}
          {debtors.length > 0 && (
            <div className="gd-debtors-card">
              <h3 className="gd-debtors-title">
                <AlertTriangle size={16} color="var(--accent-warning)"/>
                Shu oy to'lov qilmaganlar
              </h3>
              <ol className="gd-debtors-list">
                {debtors.map((s, i) => (
                  <li key={s.id} className="gd-debtor-item">
                    <span className="gd-debtor-num">{i + 1}.</span>
                    <span className="gd-debtor-name">{s.name}</span>
                    <span className="gd-debtor-debt" style={{color:'var(--accent-danger)',fontSize:'var(--text-xs)',marginLeft:'auto'}}>
                      {Math.max(0, Number(group.monthly_fee) - Number(s.balance)).toLocaleString()} so'm
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* RIGHT: students payment table + attendance */}
        <div className="gd-right">
          {/* Attendance date picker */}
          <div className="gd-att-bar">
            <h3 className="gd-section-title">
              <BookOpen size={16}/> Davomat belgilash
            </h3>
            <div className="gd-att-controls">
              <input type="date" className="input-field" value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                style={{width:'auto',padding:'6px 10px'}}/>
              <Button size="sm" loading={savingAtt} variant={attSaved ? 'success' : 'primary'}
                onClick={saveAttendance}>
                {attSaved ? '✓ Saqlandi' : 'Saqlash'}
              </Button>
            </div>
          </div>

          {/* Students + payment table */}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width:44}}>№</th>
                  <th>O'quvchi ismi</th>
                  <th style={{width:110}}>To'lov</th>
                  <th style={{width:110, textAlign:'center'}}>Davomat</th>
                  <th style={{width:80}}></th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={5} className="table-empty">O'quvchilar yo'q</td></tr>
                ) : students.map((s, i) => {
                  const paid = Number(s.balance) >= Number(group.monthly_fee)
                  const status = attMap[s.id] || 'present'
                  return (
                    <tr key={s.id} className={i % 2 === 0 ? 'row-odd' : 'row-even'}>
                      <td><span style={{color:'var(--text-muted)',fontWeight:600}}>{i + 1}</span></td>
                      <td>
                        <div style={{fontWeight:600}}>{s.name}</div>
                        <div style={{fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{s.phone}</div>
                      </td>
                      <td>
                        <button
                          className={`pay-check ${paid ? 'pay-check--paid' : 'pay-check--unpaid'}`}
                          onClick={() => openPayModal(s.id)}
                          title={paid ? "To'lagan" : "To'lov qabul qilish"}
                        >
                          {paid ? <CheckSquare size={18}/> : <Square size={18}/>}
                        </button>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <button
                          className={`att-btn att-btn--${status}`}
                          onClick={() => toggleStatus(s.id)}
                          title={status === 'present' ? 'Kelgan' : status === 'absent' ? 'Kelmagan' : 'Kech kelgan'}
                        >
                          {status === 'present' ? '✓' : status === 'absent' ? '✗' : '~'}
                        </button>
                      </td>
                      <td style={{textAlign:'right'}}>
                        <button className="icon-btn icon-btn--danger"
                          onClick={() => setRemoveStudentId(s.id)} title="Guruhdan chiqarish">
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)} title="To'lov qabul qilish" size="sm">
        <form onSubmit={handlePay} className="modal-form">
          {payError && <div className="form-error">{payError}</div>}
          <div className="input-group">
            <label className="input-label">O'quvchi</label>
            <select className="input-field" value={payStudentId}
              onChange={(e) => setPayStudentId(e.target.value ? +e.target.value : '')} required>
              <option value="">Tanlang</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Summa (so'm)</label>
            <input className="input-field" type="number" placeholder={String(group.monthly_fee)}
              value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required min={1}/>
          </div>
          <div className="input-group">
            <label className="input-label">To'lov usuli</label>
            <select className="input-field" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option value="cash">Naqd</option>
              <option value="card">Karta</option>
              <option value="transfer">O'tkazma</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Oy</label>
            <input className="input-field" type="month" value={payMonth}
              onChange={(e) => setPayMonth(e.target.value)} required/>
          </div>
          <div className="input-group">
            <label className="input-label">Izoh (ixtiyoriy)</label>
            <input className="input-field" placeholder="Izoh..." value={payDesc}
              onChange={(e) => setPayDesc(e.target.value)}/>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={() => setPayModal(false)}>Bekor</Button>
            <Button type="submit" loading={payLoading}>Saqlash</Button>
          </div>
        </form>
      </Modal>

      {/* Add student modal */}
      <Modal open={addStudentModal} onClose={() => setAddStudentModal(false)}
        title="O'quvchi qo'shish" size="md">
        <input className="input-field" style={{marginBottom:'1rem'}}
          placeholder="Qidirish..."
          value={addSearch} onChange={(e) => setAddSearch(e.target.value)}/>
        <div style={{maxHeight:360, overflowY:'auto'}}>
          {allStudents
            .filter((s) => s.name.toLowerCase().includes(addSearch.toLowerCase()) || s.phone.includes(addSearch))
            .map((s) => (
              <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border-color)'}}>
                <div>
                  <div style={{fontWeight:600,color:'var(--text-primary)'}}>{s.name}</div>
                  <div style={{fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{s.phone}</div>
                </div>
                <Button size="sm" loading={addingId === s.id} onClick={() => handleAddStudent(s.id)}>
                  Qo'shish
                </Button>
              </div>
            ))}
        </div>
      </Modal>

      <ConfirmModal open={!!removeStudentId} onClose={() => setRemoveStudentId(null)}
        onConfirm={handleRemoveStudent}
        message="O'quvchi guruhdan chiqariladi va davomati o'chiriladi. Balans saqlanadi." />
    </div>
  )
}
