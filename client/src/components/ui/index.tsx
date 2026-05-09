/* ── Button ────────────────────────────────────────────────────────────────── */
import React from 'react'

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
  variant = 'primary', size = 'md', loading, icon, fullWidth, children, className = '', ...props
}: ButtonProps) {
  const base = 'btn'
  const cls = [base, `btn-${variant}`, `btn-${size}`, fullWidth ? 'btn-full' : '', className].join(' ')
  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="spinner" /> : icon}
      {children}
    </button>
  )
}

/* ── Input ─────────────────────────────────────────────────────────────────── */
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
        {icon && <span className="input-icon">{icon}</span>}
        <input className={`input-field ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''} ${className}`} {...props} />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}

/* ── Select ────────────────────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <select className={`input-field ${error ? 'input-error' : ''} ${className}`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props}>{children}</div>
}

/* ── Badge ─────────────────────────────────────────────────────────────────── */
type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'gray'
export function Badge({ color = 'blue', children }: { color?: BadgeColor; children: React.ReactNode }) {
  return <span className={`badge badge-${color}`}>{children}</span>
}

/* ── Spinner ───────────────────────────────────────────────────────────────── */
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding: 32 }}>
      <div
        style={{
          width: size, height: size,
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--brand-500)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  )
}

/* ── Modal ─────────────────────────────────────────────────────────────────── */
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/* ── Table ─────────────────────────────────────────────────────────────────── */
interface Column<T> {
  key: string
  title: string
  render?: (row: T, idx: number) => React.ReactNode
  width?: string | number
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyText?: string
}

export function Table<T extends { id?: number }>({ columns, data, loading, emptyText = 'No data' }: TableProps<T>) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 50 }}>№</th>
            {columns.map((c) => (
              <th key={c.key} style={c.width ? { width: c.width } : {}}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + 1}><Spinner /></td></tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign:'center', padding: 32, color: 'var(--text-muted)' }}>
                {emptyText}
              </td>
            </tr>
          ) : data.map((row, i) => (
            <tr key={row.id ?? i}>
              <td>{i + 1}</td>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(row, i) : (row as any)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── StatCard ──────────────────────────────────────────────────────────────── */
export function StatCard({
  title, value, icon, color = 'blue',
}: { title: string; value: string | number; icon?: React.ReactNode; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <strong className="stat-value">{value}</strong>
      </div>
      {icon && <div className={`stat-icon stat-icon-${color}`}>{icon}</div>}
    </div>
  )
}
