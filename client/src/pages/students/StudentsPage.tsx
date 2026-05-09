import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { studentApi } from '@/api/services'
import type { Student } from '@/types'
import { Button, Input, Modal, ConfirmModal, EmptyState, PageHeader, Table, Badge } from '@/components/shared'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import './StudentsPage.css'

const DEFAULT_FORM = { name: '', phone: '', parent_name: '', parent_phone: '' }

export default function StudentsPage() {
  const { t } = useTranslation()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    studentApi.getAll()
      .then((r) => setStudents(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.parent_name.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditing(null); setForm(DEFAULT_FORM); setError(''); setModalOpen(true) }
  const openEdit = (s: Student) => {
    setEditing(s)
    setForm({ name: s.name, phone: s.phone, parent_name: s.parent_name, parent_phone: s.parent_phone })
    setError(''); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) await studentApi.update(editing.id, form)
      else await studentApi.create(form)
      setModalOpen(false); load()
    } catch (err: any) {
      setError(err.response?.data?.message || "Xatolik yuz berdi")
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    await studentApi.remove(confirmId)
    setConfirmId(null); load()
  }

  const formatBalance = (b: number) => {
    const n = Number(b)
    const cls = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero'
    return <span className={`balance-chip balance-chip--${cls}`}>{n.toLocaleString()} so'm</span>
  }

  const columns = [
    { key: 'num', title: '№', width: '50px', render: (_: any, i: number) => <span className="row-num">{i + 1}</span> },
    { key: 'name', title: t('studentName'), render: (s: Student) => (
      <div className="student-name-cell">
        <span className="student-avatar">{s.name[0]}</span>
        <div>
          <div className="student-name">{s.name}</div>
          <div className="student-phone">{s.phone}</div>
        </div>
      </div>
    )},
    { key: 'parent', title: t('parentName'), render: (s: Student) => (
      <div>
        <div>{s.parent_name}</div>
        <div className="student-phone">{s.parent_phone}</div>
      </div>
    )},
    { key: 'groups', title: "Guruhlar", render: (s: Student) => (
      <div className="group-badges">
        {s.groups?.length ? s.groups.map((g) => (
          <Badge key={g.id} variant="blue">{g.name}</Badge>
        )) : <span className="text-muted">—</span>}
      </div>
    )},
    { key: 'balance', title: t('balance'), render: (s: Student) => formatBalance(s.balance) },
    { key: 'actions', title: '', width: '80px', align: 'right' as const, render: (s: Student) => (
      <div className="row-actions">
        <button className="icon-btn icon-btn--edit" onClick={() => openEdit(s)} title="Tahrirlash"><Pencil size={14}/></button>
        <button className="icon-btn icon-btn--danger" onClick={() => setConfirmId(s.id)} title="O'chirish"><Trash2 size={14}/></button>
      </div>
    )},
  ]

  return (
    <div className="page">
      <PageHeader
        title={t('students')}
        count={students.length}
        search={search}
        onSearch={setSearch}
        action={<Button icon={<Plus size={16}/>} onClick={openAdd}>{t('addStudent')}</Button>}
      />

      <Table columns={columns} data={filtered} rowKey={(s) => s.id} loading={loading}
        emptyMessage={search ? "Qidiruv bo'yicha natija topilmadi" : "O'quvchilar mavjud emas"} />

      <div className="table-footer">
        Jami: <strong>{filtered.length} ta</strong>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "O'quvchini tahrirlash" : t('addStudent')}>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-grid">
            <Input label={t('studentName')} placeholder="Ism Familiya"
              value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <Input label={t('phone')} placeholder="+998901234567"
              value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
            <Input label={t('parentName')} placeholder="Ota-onasi ismi"
              value={form.parent_name} onChange={(e) => setForm({...form, parent_name: e.target.value})} required />
            <Input label="Ota-ona telefoni" placeholder="+998901234567"
              value={form.parent_phone} onChange={(e) => setForm({...form, parent_phone: e.target.value})} required />
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" loading={saving}>{editing ? t('save') : t('add')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        message="O'quvchi o'chirilib, guruhlardan chiqariladi. Balansidagi pul saqlanadi." />
    </div>
  )
}
