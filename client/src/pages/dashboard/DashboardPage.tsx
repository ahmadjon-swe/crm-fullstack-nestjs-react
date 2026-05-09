import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { dashboardApi } from '@/api/services'
import type { DashboardStats, MonthlyStatItem } from '@/types'
import { Users, GraduationCap, BookOpen, UserX } from 'lucide-react'
import './DashboardPage.css'

export default function DashboardPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthly, setMonthly] = useState<MonthlyStatItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), dashboardApi.getMonthly()])
      .then(([s, m]) => {
        setStats(s.data)
        setMonthly(m.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const cards = stats
    ? [
        { label: t('totalStudents'),   value: stats.totalStudents,   icon: Users,         color: 'blue',  sub: `+${stats.newStudentsThisMonth} ${t('thisMonth') || 'bu oy'}` },
        { label: t('totalTeachers'),   value: stats.totalTeachers,   icon: GraduationCap, color: 'green', sub: t('activeTeachers') || 'Faol o\'qituvchilar' },
        { label: t('leftThisMonth'),   value: stats.leftStudentsThisMonth, icon: UserX,   color: 'red',   sub: `${t('total') || 'Jami'}: ${stats.totalLeftStudents}` },
        { label: t('totalGroups'),     value: stats.totalGroups,     icon: BookOpen,      color: 'purple',sub: t('activeGroups') || 'Faol guruhlar' },
      ]
    : []

  const currentYear = new Date().getFullYear()

  if (loading) return (
    <div className="page-loading">
      <div className="loading-spinner-lg" />
    </div>
  )

  return (
    <div className="dashboard">
      {/* Stat cards */}
      <div className="stat-grid">
        {cards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className={`stat-card stat-card--${color}`}>
            <div className="stat-card__body">
              <div className="stat-card__info">
                <p className="stat-card__label">{label}:</p>
                <p className="stat-card__value">{value} <span className="stat-card__unit">ta</span></p>
                <p className="stat-card__sub">{sub}</p>
              </div>
              <div className={`stat-card__icon-wrap stat-icon--${color}`}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h2 className="chart-title">
              {currentYear}-YIL{' '}
              <span className="chart-month-highlight">
                {monthly[monthly.length - 1]?.label}
              </span>{' '}
              oyigacha bo'lgan statistika
            </h2>
            <p className="chart-subtitle">O'quvchilar va ketganlar soni oyma-oy</p>
          </div>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot legend-blue" />
              {t('activeStudents') || "Jami o'quvchilar"}
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-red" />
              {t('leftStudents') || 'Tark etganlar'}
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-md)',
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
              cursor={{ fill: 'var(--bg-surface-2)' }}
              formatter={(val: number, name: string) => [
                `${val} ta`,
                name === 'activeStudents' ? "O'quvchilar" : 'Ketganlar',
              ]}
            />
            <Bar dataKey="activeStudents" name="activeStudents"
              fill="var(--brand-500)" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11, fill: 'var(--text-secondary)' }} />
            <Bar dataKey="leftStudents" name="leftStudents"
              fill="var(--accent-danger)" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11, fill: 'var(--text-secondary)' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
