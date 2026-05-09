import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { Menu, Sun, Moon, Globe } from 'lucide-react'
import styles from './Header.module.css'
import { format } from 'date-fns'

const LANGS = [
  { code: 'uz', label: "O'z" },
  { code: 'ru', label: 'Ru' },
  { code: 'en', label: 'En' },
] as const

export default function Header({ title }: { title?: string }) {
  const { i18n } = useTranslation()
  const { theme, toggleTheme, lang, setLang, toggleSidebar } = useUIStore()
  const admin = useAuthStore((s) => s.admin)

  const handleLang = (code: typeof LANGS[number]['code']) => {
    setLang(code)
    i18n.changeLanguage(code)
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        {title && <h1 className={styles.title}>{title}</h1>}
      </div>

      <div className={styles.right}>
        {/* Date */}
        <span className={styles.date}>{format(new Date(), 'dd.MM.yyyy')}</span>

        {/* Language switcher */}
        <div className={styles.langSwitcher}>
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`${styles.langBtn} ${lang === l.code ? styles.langActive : ''}`}
              onClick={() => handleLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Admin avatar */}
        <div className={styles.avatar} title={admin?.name}>
          {admin?.name?.[0]?.toUpperCase() ?? 'A'}
          {admin?.role === 'superadmin' && <span className={styles.badge} />}
        </div>
      </div>
    </header>
  )
}
