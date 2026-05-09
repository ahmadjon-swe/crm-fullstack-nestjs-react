import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { groupApi, teacherApi } from '@/api/services'
import type { Group, Teacher } from '@/types'
import { Button, Input, Modal, ConfirmModal, PageHeader, Table, Badge } from '@/components/shared'
import { Plus, Pencil, Trash2, ChevronRight, Users, Clock } from 'lucide-react'
import './GroupsPage.css'

const WEEK_DAYS_OPTIONS = [
  { value: 'odd',  label: "Toq (Du-Chor-Ju)" },
  { value: 'even', label: "Juft (Se-Pay-Sha)" },
]
const LESSON_TIME_OPTIONS = [
  { value: '10:00-12:00', label: '10:00-12:00' },
  { value: '14:30-16:30', label: '14:30-16:30' },
  { value: '17:00-19:00', label: '17:00-19:00' },
]
const DEFAULT_FORM = { name: '', direction: '', week_days: '', lesson_time: '', monthly_fee: '', teacher_id: '' }

export default function GroupsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Group | null>(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([groupApi.getAll(), teacherApi.getAll()])
      .then(([g, t]) => { setGroups(g.data); setTeachers(t.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.direction.toLowerCase().includes(search.toLowerCase()) ||
    g.teacher?.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditing(null); setForm(DEFAULT_FORM); setError(''); setModalOpen(true) }
  const openEdit = (g: Group) => {
    setEditing(g)
    setForm({
      name: g.name, direction: g.direction,
      week_days: g.week_days, lesson_time: g.lesson_time,
      monthly_fee: String(g.monthly_fee),
      teacher_id: String(g.teacher?.id || ''),
    })
    setError(''); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...form, monthly_fee: Number(form.monthly_fee), teacher_id: Number(form.teacher_id) }
      if (editing) await groupApi.update(editing.id, payload as any)
      else await groupApi.create(payload as any)
      setModalOpen(false); load()
    } catch (err: any) {
      setError(err.response?.data?.message || "Xatolik yuz berdi")
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    await groupApi.remove(confirmId)
    setConfirmId(null); load()
  }

  const f = (v: string) => setForm((p) => ({ ...p, ...JSON.parse(v) }))

  return (
    <div className="page">
      <PageHeader
        title={t('groups')}
        count={groups.length}
        search={search}
        onSearch={setSearch}
        action={<Button icon={<Plus size={16}/>} onClick={openAdd}>{t('addGroup')}</Button>}
      />

      {loading ? <div className="page-loading"><div className="loading-spinner-lg"/></div> : (
        <div className="group-grid">
          {filtered.length === 0 ? (
            <div style={{gridColumn:'1/-1'}}><div className="empty-state"><div className="empty-state__icon">📚</div><p className="empty-state__msg">Guruhlar mavjud emas</p></div></div>
          ) : filtered.map((g) => (
            <div key={g.id} className="group-card" onClick={() => navigate(`/groups/${g.id}`)}>
              <div className="group-card__top">
                <div>
                  <h3 className="group-card__name">{g.name}</h3>
                  <Badge variant="purple">{g.direction}</Badge>
                </div>
                <div className="group-card__actions" onClick={(e) => e.stopPropagation()}>
                  <button className="icon-btn icon-btn--edit" onClick={() => openEdit(g)}><Pencil size={14}/></button>
                  <button className="icon-btn icon-btn--danger" onClick={() => setConfirmId(g.id)}><Trash2 size={14}/></button>
                </div>
              </div>

              {g.teacher && (
                <div className="group-card__teacher">
                  <div className="teacher-mini-avatar">{g.teacher.name[0]}</div>
                  <div>
                    <div className="teacher-mini-name">{g.teacher.name}</div>
                    <div className="teacher-mini-phone">{g.teacher.phone}</div>
                  </div>
                </div>
              )}

              <div className="group-card__meta">
                <span className="meta-chip">
                  {g.week_days === 'odd' ? 'Du-Chor-Ju' : 'Se-Pay-Sha'}
                </span>
                <span className="meta-chip">
                  <Clock size={12}/> {g.lesson_time}
                </span>
              </div>

              <div className="group-card__footer">
                <span className="group-stat">
                  <Users size={14}/> {g.students?.length || 0} ta o'quvchi
                </span>
                <span className="group-fee">
                  {Number(g.monthly_fee).toLocaleString()} so'm/oy
                </span>
                <ChevronRight size={16} className="group-arrow"/>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "Guruhni tahrirlash" : t('addGroup')}>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-grid">
            <Input label="Guruh nomi" placeholder="Matematika-1"
              value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <Input label={t('direction')} placeholder="Matematika"
              value={form.direction} onChange={(e) => setForm({...form, direction: e.target.value})} required />
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">{t('weekDays')}</label>
              <select className="input-field" value={form.week_days}
                onChange={(e) => setForm({...form, week_days: e.target.value})} required>
                <option value="">Tanlang</option>
                {WEEK_DAYS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">{t('lessonTime')}</label>
              <select className="input-field" value={form.lesson_time}
                onChange={(e) => setForm({...form, lesson_time: e.target.value})} required>
                <option value="">Tanlang</option>
                {LESSON_TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <Input label="Oylik to'lov (so'm)" placeholder="500000" type="number"
              value={form.monthly_fee} onChange={(e) => setForm({...form, monthly_fee: e.target.value})} required />
            <div className="input-group">
              <label className="input-label">{t('teacher')}</label>
              <select className="input-field" value={form.teacher_id}
                onChange={(e) => setForm({...form, teacher_id: e.target.value})} required>
                <option value="">O'qituvchini tanlang</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.direction}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" loading={saving}>{editing ? t('save') : t('add')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={handleDelete} message="Guruhni o'chirishni tasdiqlaysizmi?" />
    </div>
  )
}
