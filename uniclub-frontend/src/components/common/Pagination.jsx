import React from 'react'
import './Pagination.css'

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  ariaLabel = 'Pagination',
}) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pageNumbers = []
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages - 2, totalPages - 1, totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, 2, 3, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pageNumbers
  }

  return (
    <nav className={`clubs-pagination ${className}`.trim()} aria-label={ariaLabel}>
      <button
        type="button"
        className="clubs-pagination__btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="18" height="18">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {getPageNumbers().map((num, idx) => {
        if (num === '...') {
          return (
            <span key={`dots-${idx}`} className="clubs-pagination__dots">
              ...
            </span>
          )
        }
        return (
          <button
            key={num}
            type="button"
            className={`clubs-pagination__btn clubs-pagination__btn--num${
              num === currentPage ? ' is-active' : ''
            }`}
            onClick={() => onPageChange(num)}
            aria-current={num === currentPage ? 'page' : undefined}
          >
            {num}
          </button>
        )
      })}

      <button
        type="button"
        className="clubs-pagination__btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="18" height="18">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  )
}
