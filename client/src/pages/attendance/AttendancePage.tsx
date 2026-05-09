import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { attendanceApi, groupApi } from '@/api/services'
import type { Group } from '@/types'
import { PageHeader, Table, Badge } from '@/components/shared'
import './AttendancePage.css'

export default function AttendancePage() {
  const { t } = useTranslation()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<any[]>([])
  const [monthly, setMonthly] = useState<any | null>(null)
  const [tab, setTab] = useState<'daily' | 'monthly'>('daily')
  const [loading, setLoading] = useState(false)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    groupApi.getAll().then((r) => {
      setGroups(r.data)
      if (r.data.length > 0) setSelectedGroup(r.data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedGroup) return
    if (tab === 'daily') {
      setLoading(true)
      attendanceApi.getByGroup(+selectedGroup, date)
        .then((r) => setRecords(r.data))
        .finally(() => setLoading(false))
    } else {
      setLoading(true)
      attendanceApi.getMonthlyStats(+selectedGroup, month)
        .then((r) => setMonthly(r.data))
        .finally(() => setLoading(false))
    }
  }, [selectedGroup, date, tab, month])

  const statusConfig: Record<string, { label: string; variant: any }> = {
    present: { label: "Kelgan ✓", variant: 'green' },
    absent:  { label: "Kelmagan ✗", variant: 'red' },
    late:    { label: "Kech kelgan ~", variant: 'yellow' },
  }

  const dailyColumns = [
    { key: 'num', title: '№', width: '50px', render: (_: any, i: number) => <span style={{color:'var(--text-muted)',fontWeight:600}}>{i+1}</span> },
    { key: 'student', title: "O'quvchi", render: (r: any) => (
      <div>
        <div style={{fontWeight:600}}>{r.student_name || r.student?.name}</div>
        <div style={{fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{r.student_phone || r.student?.phone}</div>
      </div>
    )},
    { key: 'date', title: "Sana", render: (r: any) => (
      <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)'}}>{r.date}</span>
    )},
    { key: 'status', title: "Holat", render: (r: any) => {
      const cfg = statusConfig[r.status] || { label: r.status, variant: 'gray' }
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>
    }},
  ]

  const monthlyStudents = monthly?.students || []

  return (
    <div className="page">
      <PageHeader title={t('attendance')} />

      {/* Controls */}
      <div className="att-controls">
        <div className="input-group" style={{flexDirection:'row',alignItems:'center',gap:10}}>
          <label className="input-label" style={{margin:0,whiteSpace:'nowrap'}}>Guruh:</label>
          <select className="input-field" value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value ? +e.target.value : '')}
            style={{width:'auto',minWidth:200}}>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div className="att-tabs">
          <button className={`pay-tab ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>Kunlik</button>
          <button className={`pay-tab ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>Oylik statistika</button>
        </div>

        {tab === 'daily' ? (
          <input type="date" className="input-field" value={date}
            onChange={(e) => setDate(e.target.value)} style={{width:'auto'}}/>
        ) : (
          <input type="month" className="input-field" value={month}
            onChange={(e) => setMonth(e.target.value)} style={{width:'auto'}}/>
        )}
      </div>

      {tab === 'daily' ? (
        <>
          <div className="att-summary">
            <span className="summary-chip summary-chip--green">Kelgan: {records.filter((r) => r.status === 'present').length}</span>
            <span className="summary-chip summary-chip--red">Kelmagan: {records.filter((r) => r.status === 'absent').length}</span>
            <span className="summary-chip" style={{background:'#fef9c3',color:'#ca8a04'}}>Kech: {records.filter((r) => r.status === 'late').length}</span>
          </div>
          <Table columns={dailyColumns} data={records} rowKey={(r: any) => r.id}
            loading={loading} emptyMessage={`${date} sanasi uchun davomat belgilanmagan`} />
        </>
      ) : (
        <>
          {monthly && (
            <div className="monthly-header">
              <h3 style={{margin:0,fontWeight:700,color:'var(--text-heading)'}}>{monthly.group_name} — {month}</h3>
            </div>
          )}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width:44}}>№</th>
                  <th>O'quvchi ismi</th>
                  <th style={{textAlign:'center',width:90}}>Kelgan</th>
                  <th style={{textAlign:'center',width:90}}>Kelmagan</th>
                  <th style={{textAlign:'center',width:90}}>Kech</th>
                  <th style={{textAlign:'center',width:90}}>Jami kun</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="table-empty"><div className="loading-spinner-lg" style={{margin:'0 auto'}}/></td></tr>
                ) : monthlyStudents.length === 0 ? (
                  <tr><td colSpan={6} className="table-empty">Davomat ma'lumotlari yo'q</td></tr>
                ) : monthlyStudents.map((s: any, i: number) => (
                  <tr key={s.student_id} className={i % 2 === 0 ? 'row-odd' : 'row-even'}>
                    <td><span style={{color:'var(--text-muted)',fontWeight:600}}>{i+1}</span></td>
                    <td style={{fontWeight:600}}>{s.name}</td>
                    <td style={{textAlign:'center'}}><Badge variant="green">{s.present}</Badge></td>
                    <td style={{textAlign:'center'}}><Badge variant="red">{s.absent}</Badge></td>
                    <td style={{textAlign:'center'}}><Badge variant="yellow">{s.late}</Badge></td>
                    <td style={{textAlign:'center',fontWeight:700}}>{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
