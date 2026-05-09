import React, { useEffect, useRef } from 'react'
import { Search, X, AlertTriangle } from 'lucide-react'
import './shared.css'

/* ════════════════════════════════════════════
   BUTTON
════════════════════════════════════════════ */
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type BtnSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary', size = 'md', loading, icon, fullWidth,
  children, className = '', ...props
}: ButtonProps) {
  const cls = ['btn', `btn-${variant}`, `btn-${size}`, fullWidth ? 'btn-full' : '', className].join(' ')
  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="spinner" /> : icon}
      {children}
    </button>
  )
}

/* ════════════════════════════════════════════
   INPUT
════════════════════════════════════════════ */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrap">
        {icon && <span className="input-icon-left">{icon}</span>}
        <input
          className={`input-field ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}

/* ════════════════════════════════════════════
   SELECT
════════════════════════════════════════════ */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <select className={`input-field ${error ? 'input-error' : ''} ${className}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}

/* ════════════════════════════════════════════
   MODAL
════════════════════════════════════════════ */
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box modal-${size}`} role="dialog" aria-modal>
        <div className="modal-head">
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   CONFIRM MODAL
════════════════════════════════════════════ */
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  message?: string
  title?: string
  loading?: boolean
}

export function ConfirmModal({
  open, onClose, onConfirm, message = "O'chirishni tasdiqlaysizmi?",
  title = "Tasdiqlash", loading
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="confirm-modal">
        <div className="confirm-icon"><AlertTriangle size={32} color="var(--accent-warning)"/></div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-msg">{message}</p>
        <div className="confirm-actions">
          <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>O'chirish</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════
   PAGE HEADER
════════════════════════════════════════════ */
interface PageHeaderProps {
  title?: string
  count?: number
  search?: string
  onSearch?: (v: string) => void
  action?: React.ReactNode
  extra?: React.ReactNode
}

export function PageHeader({ title, count, search, onSearch, action, extra }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__left">
        {title && (
          <div className="page-title-wrap">
            <h2 className="page-title">{title}</h2>
            {count !== undefined && <span className="page-count">{count} ta</span>}
          </div>
        )}
        {extra}
      </div>
      <div className="page-header__right">
        {onSearch && (
          <div className="search-wrap">
            <Search size={16} className="search-icon"/>
            <input
              className="search-input"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        {action}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   TABLE
════════════════════════════════════════════ */
interface Column<T> {
  key: string
  title: string
  render?: (row: T, idx: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey?: (row: T) => string | number
  loading?: boolean
  emptyMessage?: string
}

export function Table<T>({ columns, data, rowKey, loading, emptyMessage }: TableProps<T>) {
  if (loading) return <div className="table-loading"><div className="loading-spinner-lg"/></div>

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width, textAlign: col.align || 'left' }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyMessage || "Ma'lumot topilmadi"}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={rowKey ? rowKey(row) : idx} className={idx % 2 === 0 ? 'row-odd' : 'row-even'}>
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row, idx) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════ */
export function EmptyState({ message, icon }: { message?: string; icon?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon || '📭'}</div>
      <p className="empty-state__msg">{message || "Ma'lumot topilmadi"}</p>
    </div>
  )
}

/* ════════════════════════════════════════════
   BADGE
════════════════════════════════════════════ */
type BadgeVariant = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple'

export function Badge({ children, variant = 'blue' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

/* ════════════════════════════════════════════
   STAT MINI
════════════════════════════════════════════ */
export function StatMini({ label, value, variant = 'blue' }: { label: string; value: string | number; variant?: BadgeVariant }) {
  return (
    <div className={`stat-mini stat-mini--${variant}`}>
      <span className="stat-mini__val">{value}</span>
      <span className="stat-mini__label">{label}</span>
    </div>
  )
}
