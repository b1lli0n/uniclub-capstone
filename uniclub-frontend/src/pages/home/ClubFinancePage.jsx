import { useMemo, useState } from 'react'
import { ALL_CLUBS, CLUB_FINANCE_TRANSACTIONS } from '../../data/mockData'
import '../../styles/club-finance.css'

const EMPTY_FORM = { title: '', type: 'expense', category: '', amount: '', dateInput: '', counterparty: '', description: '' }
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const statusLabel = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected' }
const fallbackClub = ALL_CLUBS[0]

function ClubFinancePage({ clubId }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || fallbackClub
  const [transactions, setTransactions] = useState(() => CLUB_FINANCE_TRANSACTIONS.filter((item) => item.clubId === club.id))
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [formTarget, setFormTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [toast, setToast] = useState(null)

  const approved = transactions.filter((item) => item.status === 'approved')
  const income = approved.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const expense = approved.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const displayed = useMemo(() => transactions.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter || item.type === filter
    const normalized = query.trim().toLowerCase()
    return matchesFilter && (!normalized || [item.title, item.category, item.counterparty, item.referenceCode].some((value) => value.toLowerCase().includes(normalized)))
  }), [transactions, query, filter])

  function notify(message) { setToast(message); window.setTimeout(() => setToast(null), 3000) }
  function openCreate() { setForm(EMPTY_FORM); setFormTarget('create') }
  function openEdit(item) { setForm({ title: item.title, type: item.type, category: item.category, amount: String(item.amount), dateInput: item.dateInput, counterparty: item.counterparty, description: item.description }); setSelected(null); setFormTarget(item) }
  function saveRequest(event) {
    event.preventDefault()
    const payload = { title: form.title.trim(), type: form.type, category: form.category.trim(), amount: Number(form.amount), dateInput: form.dateInput, date: form.dateInput.split('-').reverse().join('/'), counterparty: form.counterparty.trim(), description: form.description.trim() }
    if (!payload.title || !payload.amount || !payload.dateInput) return
    if (formTarget === 'create') {
      const item = { ...payload, id: `finance-${Date.now()}`, clubId: club.id, status: 'pending', createdBy: 'Ha Van Son', referenceCode: `TR-${club.id.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}` }
      setTransactions((items) => [item, ...items]); notify('Transaction request created.')
    } else {
      setTransactions((items) => items.map((item) => item.id === formTarget.id ? { ...item, ...payload } : item)); notify('Transaction request updated.')
    }
    setFormTarget(null)
  }
  function exportReport() {
    const headers = ['Reference', 'Title', 'Type', 'Category', 'Amount', 'Date', 'Status']
    const rows = transactions.map((item) => [item.referenceCode, item.title, item.type, item.category, item.amount, item.date, item.status])
    const blob = new Blob([[headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${club.id}-financial-report.csv`; link.click(); URL.revokeObjectURL(url)
    notify('Financial report exported as CSV.')
  }

  return <main className="club-finance-page">
    <section className="club-finance-hero"><div><span>{club.name} · Treasurer workspace</span><h1>Financial Dashboard</h1><p>Track approved funds, manage transaction requests, and keep every club expense transparent.</p></div><div className="club-finance-hero__actions"><button type="button" onClick={exportReport}>⇩ Export report</button><button type="button" onClick={openCreate}>+ New request</button></div></section>
    <section className="club-finance-summary" aria-label="Financial overview"><SummaryCard label="Current balance" value={income - expense} accent="balance" /><SummaryCard label="Approved income" value={income} accent="income" /><SummaryCard label="Approved expenses" value={expense} accent="expense" /><div className="club-finance-summary__card club-finance-summary__card--pending"><span>Pending requests</span><strong>{transactions.filter((item) => item.status === 'pending').length}</strong><small>Awaiting review</small></div></section>
    <section className="club-finance-transactions"><header><div><span>Transaction requests</span><h2>All transactions</h2></div><label className="club-finance-search">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, category or reference..." /></label></header><div className="club-finance-filters">{[['all', 'All'], ['income', 'Income'], ['expense', 'Expenses'], ['pending', 'Pending'], ['approved', 'Approved']].map(([value, label]) => <button key={value} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><div className="club-finance-table" role="table"><div className="club-finance-table__head" role="row"><span>Transaction</span><span>Type</span><span>Amount</span><span>Status</span><span /></div>{displayed.map((item) => <div className="club-finance-table__row" role="row" key={item.id}><div><strong>{item.title}</strong><small>{item.referenceCode} · {item.date}</small></div><span className={`club-finance-type club-finance-type--${item.type}`}>{item.type === 'income' ? 'Income' : 'Expense'}</span><strong className={item.type === 'income' ? 'is-income' : 'is-expense'}>{item.type === 'income' ? '+' : '-'}{currency.format(item.amount)}</strong><span className={`club-finance-status club-finance-status--${item.status}`}>{statusLabel[item.status]}</span><div className="club-finance-table__actions"><button type="button" onClick={() => setSelected(item)}>View</button>{item.status === 'pending' && <button type="button" onClick={() => openEdit(item)}>Edit</button>}</div></div>)}{!displayed.length && <div className="club-finance-empty">No transaction requests match this filter.</div>}</div></section>
    {selected && <TransactionDetail item={selected} onClose={() => setSelected(null)} onEdit={() => openEdit(selected)} />}
    {formTarget && <TransactionForm item={formTarget === 'create' ? null : formTarget} form={form} setForm={setForm} onClose={() => setFormTarget(null)} onSubmit={saveRequest} />}
    {toast && <div className="club-finance-toast" role="status">{toast}</div>}
  </main>
}

function SummaryCard({ label, value, accent }) { return <div className={`club-finance-summary__card club-finance-summary__card--${accent}`}><span>{label}</span><strong>{currency.format(value)}</strong><small>{accent === 'balance' ? 'Available club funds' : 'This semester'}</small></div> }
function TransactionDetail({ item, onClose, onEdit }) { return <FinanceModal title="Transaction detail" onClose={onClose}><div className="club-finance-detail"><div className="club-finance-detail__title"><span className={`club-finance-type club-finance-type--${item.type}`}>{item.type === 'income' ? 'Income' : 'Expense'}</span><h3>{item.title}</h3><strong className={item.type === 'income' ? 'is-income' : 'is-expense'}>{item.type === 'income' ? '+' : '-'}{currency.format(item.amount)}</strong></div><div className="club-finance-detail__grid"><div><span>Reference</span><strong>{item.referenceCode}</strong></div><div><span>Status</span><strong className={`club-finance-status club-finance-status--${item.status}`}>{statusLabel[item.status]}</strong></div><div><span>Category</span><strong>{item.category}</strong></div><div><span>Counterparty</span><strong>{item.counterparty}</strong></div><div><span>Transaction date</span><strong>{item.date}</strong></div><div><span>Requested by</span><strong>{item.createdBy}</strong></div></div><p>{item.description}</p></div><footer><button type="button" onClick={onClose}>Close</button>{item.status === 'pending' && <button type="button" className="is-primary" onClick={onEdit}>Edit request</button>}</footer></FinanceModal> }
function TransactionForm({ item, form, setForm, onClose, onSubmit }) { const change = (key, value) => setForm((current) => ({ ...current, [key]: value })); const openDatePicker = (event) => event.currentTarget.showPicker?.(); return <FinanceModal title={item ? 'Update transaction request' : 'Create transaction request'} onClose={onClose}><form className="club-finance-form" onSubmit={onSubmit}><label>Transaction title<input required value={form.title} onChange={(event) => change('title', event.target.value)} placeholder="e.g. Buy event supplies" /></label><div><label>Type<select value={form.type} onChange={(event) => change('type', event.target.value)}><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Amount (VND)<input required min="1" type="number" value={form.amount} onChange={(event) => change('amount', event.target.value)} placeholder="0" /></label></div><div><label>Category<input required value={form.category} onChange={(event) => change('category', event.target.value)} placeholder="e.g. Supplies" /></label><label>Date<input required type="date" value={form.dateInput} onClick={openDatePicker} onChange={(event) => change('dateInput', event.target.value)} /></label></div><label>Counterparty<input value={form.counterparty} onChange={(event) => change('counterparty', event.target.value)} placeholder="Supplier, member group, sponsor..." /></label><label>Description<textarea value={form.description} rows="3" onChange={(event) => change('description', event.target.value)} placeholder="Add context for this transaction request..." /></label><footer><button type="button" onClick={onClose}>Cancel</button><button type="submit" className="is-primary">{item ? 'Save changes' : 'Create request'}</button></footer></form></FinanceModal> }
function FinanceModal({ title, children, onClose }) { return <div className="club-finance-modal" role="dialog" aria-modal="true"><button className="club-finance-modal__backdrop" aria-label="Close dialog" onClick={onClose} /><section className="club-finance-modal__panel"><header><h2>{title}</h2><button type="button" aria-label="Close" onClick={onClose}>×</button></header>{children}</section></div> }

export default ClubFinancePage
