import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { studentApi } from '@/api/services'
import type { Student } from '@/types'
import { Button, EmptyState, PageHeader, Table, Badge } from '@/components/shared'
import { useAuthStore, isSuperAdmin } from '@/store/auth.store'
import { RotateCcw } from 'lucide-react'

export default function LeftStudentsPage() {
  const { t } = useTranslation()
  const admin = useAuthStore((s) => s.admin)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [restoring, setRestoring] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    studentApi.getDeleted()
      .then((r) => setStudents(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  )

  const handleRestore = async (id: number) => {
    setRestoring(id)
    await studentApi.restore(id)
    setRestoring(null)
    load()
  }

  const columns = [
    { key: 'num', title: '№', width: '50px', render: (_: any, i: number) => <span style={{color:'var(--text-muted)', fontWeight:600}}>{i + 1}</span> },
    { key: 'name', title: t('studentName'), render: (s: Student) => (
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:34,height:34,borderRadius:'50%',background:'var(--bg-surface-2)',color:'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>
          {s.name[0]}
        </div>
        <div>
          <div style={{fontWeight:600,color:'var(--text-primary)'}}>{s.name}</div>
          <div style={{fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{s.phone}</div>
        </div>
      </div>
    )},
    { key: 'parent', title: t('parentName'), render: (s: Student) => (
      <div>
        <div>{s.parent_name}</div>
        <div style={{fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{s.parent_phone}</div>
      </div>
    )},
    { key: 'balance', title: t('balance'), render: (s: Student) => {
      const n = Number(s.balance)
      const cls = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero'
      return <span className={`balance-chip balance-chip--${cls}`}>{n.toLocaleString()} so'm</span>
    }},
    { key: 'leftAt', title: "Tark etgan sana", render: (s: Student) =>
      s.deletedAt ? new Date(s.deletedAt).toLocaleDateString('uz-UZ') : '—'
    },
    ...(isSuperAdmin(admin?.role) ? [{
      key: 'actions', title: '', width: '80px', align: 'right' as const,
      render: (s: Student) => (
        <Button size="sm" variant="secondary" icon={<RotateCcw size={13}/>}
          loading={restoring === s.id} onClick={() => handleRestore(s.id)}>
          Tiklash
        </Button>
      )
    }] : []),
  ]

  return (
    <div className="page">
      <PageHeader
        title={t('leftStudents')}
        count={students.length}
        search={search}
        onSearch={setSearch}
      />
      <Table columns={columns} data={filtered} rowKey={(s) => s.id} loading={loading}
        emptyMessage="Tark etgan o'quvchilar yo'q" />
    </div>
  )
}
