import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CreditCard, ClipboardCheck, UserX, UserCog, LogOut, X
} from 'lucide-react'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const { t } = useTranslation()
  const { admin, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const navigate = useNavigate()

  const nav = [
    { to: '/dashboard',    icon: LayoutDashboard, label: t('dashboard') },
    { to: '/teachers',     icon: GraduationCap,   label: t('teachers') },
    { to: '/students',     icon: Users,            label: t('students') },
    { to: '/students/left',icon: UserX,            label: t('leftStudents') },
    { to: '/groups',       icon: BookOpen,         label: t('groups') },
    { to: '/payments',     icon: CreditCard,       label: t('payments') },
    { to: '/attendance',   icon: ClipboardCheck,   label: t('attendance') },
    ...(admin?.role === 'superadmin'
      ? [{ to: '/admins', icon: UserCog, label: t('admins') }]
      : []),
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <GraduationCap size={20} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Education</span>
              <span className={styles.logoSub}>CRM</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false) }}
            >
              <Icon size={18} className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {admin?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className={styles.adminMeta}>
              <span className={styles.adminName}>{admin?.name}</span>
              <span className={styles.adminRole}>{admin?.role}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title={t('logout')}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  )
}
