import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/ui.store'
import Sidebar from './Sidebar'
import Header from './Header'
import styles from './MainLayout.module.css'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'dashboard',
  '/teachers':     'teachers',
  '/students':     'students',
  '/students/left':'leftStudents',
  '/groups':       'groups',
  '/payments':     'payments',
  '/attendance':   'attendance',
  '/admins':       'admins',
}

export default function MainLayout() {
  const { t } = useTranslation()
  const { sidebarOpen } = useUIStore()
  const location = useLocation()

  const titleKey = Object.keys(PAGE_TITLES).find((k) => location.pathname.startsWith(k))
  const title = titleKey ? t(PAGE_TITLES[titleKey]) : ''

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={`${styles.main} ${sidebarOpen ? styles.shifted : ''}`}>
        <Header title={title} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
