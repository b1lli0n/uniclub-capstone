import { useState, useRef, useEffect } from 'react'
import '../../styles/custom-select.css'

export default function CustomSelect({
  id,
  value,
  onChange,
  options = [],
  className = '',
  align = 'left',
  placeholder = 'Select...',
  ariaLabel,
  disabled = false,
  'data-testid': dataTestId,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const activeOption = options.find((opt) => String(opt.value) === String(value))

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      className={`custom-select-container ${className}`.trim()}
      ref={dropdownRef}
    >
      <button
        type="button"
        id={id}
        data-testid={dataTestId}
        className={`custom-select-trigger ${isOpen ? 'is-open' : ''}`.trim()}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className={`custom-select-label ${!activeOption || !activeOption.value ? 'is-placeholder' : ''}`.trim()}>
          {activeOption && activeOption.value ? activeOption.label : placeholder}
        </span>
        <span className="custom-select-arrow" aria-hidden="true">
          <svg
            viewBox="0 0 12 8"
            fill="currentColor"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            <path d="M6 8L0 0h12L6 8z" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <ul
          className={`custom-select-options ${align === 'right' ? 'align-right' : ''}`.trim()}
          role="listbox"
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value)
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={`custom-select-option ${isSelected ? 'is-selected' : ''}`.trim()}
                onClick={() => {
                  onChange(opt.value, opt)
                  setIsOpen(false)
                }}
              >
                {opt.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
