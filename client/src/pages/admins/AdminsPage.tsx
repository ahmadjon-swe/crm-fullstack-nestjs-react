import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api/services'
import type { Admin } from '@/types'
import { Button, Input, Modal, ConfirmModal, PageHeader, Table, Badge } from '@/components/shared'
import { Plus, Pencil, Trash2, RotateCcw, Shield, ShieldCheck } from 'lucide-react'
import './AdminsPage.css'

const DEFAULT_FORM = { username: '', name: '', email: '', password: '', role: 'admin' }

type TabKey = 'active' | 'deleted'

export default function AdminsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabKey>('active')
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [restoreId, setRestoreId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Admin | null>(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    const fn = tab === 'active' ? authApi.getAll() : authApi.getDeleted()
    fn.then((r) => setAdmins(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab])

  const filtered = admins.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.username.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditing(null); setForm(DEFAULT_FORM); setError(''); setModal(true) }
  const openEdit = (a: Admin) => {
    setEditing(a)
    setForm({ username: a.username, name: a.name, email: a.email, password: '', role: a.role })
    setError(''); setModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...form, ...(editing && !form.password ? { password: undefined } : {}) }
      if (!payload.password) delete (payload as any).password
      if (editing) await authApi.update(editing.id, payload)
      else await authApi.create(payload as any)
      setModal(false); load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    await authApi.remove(confirmId)
    setConfirmId(null); load()
  }

  const handleRestore = async () => {
    if (!restoreId) return
    await authApi.restore(restoreId)
    setRestoreId(null); load()
  }

  const roleConfig: Record<string, { label: string; variant: any; Icon: any }> = {
    superadmin: { label: 'Superadmin', variant: 'purple', Icon: ShieldCheck },
    admin:      { label: 'Admin',      variant: 'blue',   Icon: Shield },
  }

  const columns = [
    { key: 'num', title: '№', width: '50px',
      render: (_: any, i: number) => <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</span> },
    { key: 'name', title: "Ism", render: (a: Admin) => (
      <div className="admin-name-cell">
        <div className="admin-avatar">{a.name[0]?.toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: 600 }}>{a.name}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>@{a.username}</div>
        </div>
      </div>
    )},
    { key: 'email', title: "Email", render: (a: Admin) => (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{a.email}</span>
    )},
    { key: 'role', title: "Rol", render: (a: Admin) => {
      const cfg = roleConfig[a.role] || { label: a.role, variant: 'gray', Icon: Shield }
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <cfg.Icon size={14} />
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </span>
      )
    }},
    { key: 'createdAt', title: "Qo'shilgan", render: (a: Admin) =>
      new Date(a.createdAt).toLocaleDateString('uz-UZ') },
    { key: 'actions', title: '', width: '90px', align: 'right' as const,
      render: (a: Admin) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {tab === 'active' ? (
            <>
              <button className="icon-btn icon-btn--edit" onClick={() => openEdit(a)}><Pencil size={14}/></button>
              <button className="icon-btn icon-btn--danger" onClick={() => setConfirmId(a.id)}><Trash2 size={14}/></button>
            </>
          ) : (
            <button className="icon-btn icon-btn--success" onClick={() => setRestoreId(a.id)}
              title="Tiklash"><RotateCcw size={14}/></button>
          )}
        </div>
      )},
  ]

  return (
    <div className="page">
      <PageHeader
        title="Adminlar boshqaruvi"
        count={admins.length}
        search={search}
        onSearch={setSearch}
        action={tab === 'active' && (
          <Button icon={<Plus size={16}/>} onClick={openAdd}>Admin qo'shish</Button>
        )}
      />

      <div className="pay-tabs">
        <button className={`pay-tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Faol adminlar
        </button>
        <button className={`pay-tab ${tab === 'deleted' ? 'active' : ''}`} onClick={() => setTab('deleted')}>
          O'chirilganlar
        </button>
      </div>

      <Table columns={columns} data={filtered} rowKey={(a) => a.id} loading={loading}
        emptyMessage={tab === 'active' ? "Adminlar mavjud emas" : "O'chirilgan adminlar yo'q"} />

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editing ? "Adminni tahrirlash" : "Yangi admin qo'shish"} size="sm">
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <Input label="To'liq ismi" placeholder="Ism Familiya"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Username" placeholder="admin_username"
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input label="Email" type="email" placeholder="admin@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input
            label={editing ? "Yangi parol (o'zgartirmasangiz bo'sh qoldiring)" : "Parol"}
            type="password" placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editing}
          />
          <div className="input-group">
            <label className="input-label">Rol</label>
            <select className="input-field" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Bekor</Button>
            <Button type="submit" loading={saving}>{editing ? "Saqlash" : "Qo'shish"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={handleDelete} message="Adminni o'chirishni tasdiqlaysizmi?" />

      <ConfirmModal open={!!restoreId} onClose={() => setRestoreId(null)}
        onConfirm={handleRestore} title="Tiklash"
        message="Adminni tiklashni tasdiqlaysizmi?" />
    </div>
  )
}
