import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { teacherApi } from '@/api/services'
import type { Teacher } from '@/types'
import { Button, Input, Select, Modal, ConfirmModal, EmptyState, PageHeader, Table } from '@/components/shared'
import { Plus, Pencil, Trash2, Phone, BookOpen } from 'lucide-react'
import './TeachersPage.css'

const DIRECTION_OPTIONS = [
  { value: 'Matematika', label: 'Matematika' },
  { value: 'Ingliz tili', label: 'Ingliz tili' },
  { value: 'Rus tili', label: 'Rus tili' },
  { value: 'Informatika', label: 'Informatika' },
  { value: 'Fizika', label: 'Fizika' },
  { value: 'Kimyo', label: 'Kimyo' },
  { value: 'Ona tili', label: 'Ona tili' },
  { value: 'Tarix', label: 'Tarix' },
  { value: 'Biologiya', label: 'Biologiya' },
]

const DEFAULT_FORM = { name: '', phone: '', direction: '', image: '' }

export default function TeachersPage() {
  const { t } = useTranslation()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    teacherApi.getAll()
      .then((r) => setTeachers(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.phone.includes(search) ||
    t.direction.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditing(null); setForm(DEFAULT_FORM); setError(''); setModalOpen(true) }
  const openEdit = (teacher: Teacher) => {
    setEditing(teacher)
    setForm({ name: teacher.name, phone: teacher.phone, direction: teacher.direction, image: teacher.image || '' })
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await teacherApi.update(editing.id, form)
      } else {
        await teacherApi.create(form as any)
      }
      setModalOpen(false)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message || "Xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    await teacherApi.remove(confirmId)
    setConfirmId(null)
    load()
  }

  return (
    <div className="page">
      <PageHeader
        title={t('teachers')}
        count={teachers.length}
        search={search}
        onSearch={setSearch}
        action={<Button icon={<Plus size={16}/>} onClick={openAdd}>{t('addTeacher')}</Button>}
      />

      {loading ? (
        <div className="page-loading"><div className="loading-spinner-lg"/></div>
      ) : filtered.length === 0 ? (
        <EmptyState message={search ? "Qidiruv bo'yicha natija topilmadi" : "O'qituvchilar mavjud emas"} />
      ) : (
        <div className="teacher-grid">
          {filtered.map((teacher) => (
            <div key={teacher.id} className="teacher-card">
              <div className="teacher-card__avatar">
                {teacher.image ? (
                  <img src={teacher.image} alt={teacher.name} />
                ) : (
                  <span>{teacher.name[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="teacher-card__info">
                <h3 className="teacher-card__name">{teacher.name}</h3>
                <span className="teacher-card__direction">
                  <BookOpen size={13}/> {teacher.direction}
                </span>
                <span className="teacher-card__phone">
                  <Phone size={13}/> {teacher.phone}
                </span>
                <span className="teacher-card__groups">
                  {teacher.groups?.length || 0} ta guruh
                </span>
              </div>
              <div className="teacher-card__actions">
                <button className="icon-btn icon-btn--edit" onClick={() => openEdit(teacher)} title="Tahrirlash">
                  <Pencil size={15}/>
                </button>
                <button className="icon-btn icon-btn--danger" onClick={() => setConfirmId(teacher.id)} title="O'chirish">
                  <Trash2 size={15}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "O'qituvchini tahrirlash" : t('addTeacher')}>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <Input label={t('teacherName')} placeholder="Ism Familiya"
            value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          <Input label={t('teacherPhone')} placeholder="+998901234567"
            value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
          <div className="input-group">
            <label className="input-label">{t('direction')}</label>
            <select className="input-field" value={form.direction}
              onChange={(e) => setForm({...form, direction: e.target.value})} required>
              <option value="">Yo'nalishni tanlang</option>
              {DIRECTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <Input label="Rasm URL (ixtiyoriy)" placeholder="https://..."
            value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} />
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" loading={saving}>{editing ? t('save') : t('add')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={handleDelete} message={t('confirmDelete')} />
    </div>
  )
}
