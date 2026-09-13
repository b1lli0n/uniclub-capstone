import { useState, useEffect } from 'react'
import { TEST_SUITES, runApiTest, runAllApiTests } from '../api/apiTestRunner'

const DEMO_TOKENS = {
  admin: {
    label: '👑 Admin Trường (SA)',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNmM4ZWRkNGI0MjI4ZWVkNmQ5NzE4NCIsImVtYWlsIjoiYWRtaW5AZnB0LmVkdS52biIsInJvbGUiOiJzdHVkZW50X2FmZmFpcnMiLCJpYXQiOjE3ODU0OTk5OTkyLCJleHAiOjE3ODYxMDQ3OTJ9.lIsYHadVEed5b7noMt16pnzbnEL-9dgGQv2i4NW4Eco'
  },
  president: {
    label: '👑 President (Ty - Music Club)',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNmM4ZWRkNGI0MjI4ZWVkNmQ5NzE4NSIsImVtYWlsIjoidHluY2UxODEwNDFAZnB0LmVkdS52biIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzg1NDk5OTkyLCJleHAiOjE3ODYxMDQ3OTJ9.eH3DMDB4jtaYlM8tn1uR9c0kH6jwJmiCK2NMXNnMlIc'
  },
  secretary: {
    label: '✍️ Secretary (Bich - Music Club)',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNmM4ZWRkNGI0MjI4ZWVkNmQ5NzE4NiIsImVtYWlsIjoiZGVtbzFAZnB0LmVkdS52biIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzg1NDk5OTkyLCJleHAiOjE3ODYxMDQ3OTJ9.VuhTNAjIvHDKAVL6uonwXhacuRJow-ODeXsJk2YM1Mg'
  },
  treasurer: {
    label: '💰 Treasurer (Cuong - Music Club)',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNmM4ZWRkNGI0MjI4ZWVkNmQ5NzE4NyIsImVtYWlsIjoiZGVtbzJAZnB0LmVkdS52biIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzg1NDk5OTkyLCJleHAiOjE3ODYxMDQ7OTJ9.ey1pBvE7FTSiFoV0nO3now3_QYYrqq0bSwkUOQYNbzo'
  }
}

export default function ApiTestPage() {
  const [selectedRole, setSelectedRole] = useState('president')
  const [activeCategory, setActiveCategory] = useState('All')
  const [results, setResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState(null)

  useEffect(() => {
    // Luôn đồng bộ Token mới nhất của vai trò được chọn vào localStorage
    if (DEMO_TOKENS[selectedRole]) {
      localStorage.setItem('token', DEMO_TOKENS[selectedRole].token)
    }
  }, [selectedRole])

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey)
    localStorage.setItem('token', DEMO_TOKENS[roleKey].token)
    setResults([])
  }

  const handleRunAll = async () => {
    setIsRunning(true)
    setResults([])
    localStorage.setItem('token', DEMO_TOKENS[selectedRole].token)
    await runAllApiTests((completed, total, latestResult) => {
      setResults((prev) => [...prev, latestResult])
    })
    setIsRunning(false)
  }

  const handleRunSingle = async (testItem, index) => {
    const res = await runApiTest(testItem)
    setResults((prev) => {
      const copy = [...prev]
      copy[index] = res
      return copy
    })
  }

  const categories = ['All', ...TEST_SUITES.map((s) => s.category)]

  const filteredResults =
    activeCategory === 'All'
      ? results
      : results.filter((r) => r.category === activeCategory)

  const passedCount = results.filter((r) => r.status === 'PASSED').length
  const failedCount = results.filter((r) => r.status === 'FAILED').length

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '25px', borderBottom: '2px solid #e2e8f0', pb: '15px' }}>
        <h1 style={{ color: '#1e293b', fontSize: '28px', marginBottom: '8px' }}>
          ⚡ UniClub Frontend API Connection Test Suite
        </h1>
        <p style={{ color: '#64748b' }}>
          Kiểm tra kết nối toàn bộ 7 Nhóm chức năng API giữa Frontend và Backend.
        </p>
      </header>

      {/* Role Switcher & Controls */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontWeight: '600', marginRight: '8px', color: '#334155' }}>Chọn Vai Trò Giả Lập:</label>
          <select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {Object.entries(DEMO_TOKENS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunAll}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#94a3b8' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? '⏳ Running Tests...' : '▶ Run All API Tests'}
        </button>

        {results.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto', fontWeight: '600' }}>
            <span style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '6px 12px', borderRadius: '20px' }}>
              ✓ Passed: {passedCount}
            </span>
            <span style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '6px 12px', borderRadius: '20px' }}>
              ✕ Failed: {failedCount}
            </span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: activeCategory === cat ? 'none' : '1px solid #cbd5e1',
              backgroundColor: activeCategory === cat ? '#0f172a' : '#f8fafc',
              color: activeCategory === cat ? '#fff' : '#475569',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b' }}>Nhấn <b>"Run All API Tests"</b> để kiểm tra kết nối API.</p>
          </div>
        ) : (
          filteredResults.map((r, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: r.status === 'PASSED' ? '#f0fdf4' : '#fef2f2'
                }}
              >
                <span
                  style={{
                    fontWeight: '700',
                    color: r.status === 'PASSED' ? '#16a34a' : '#dc2626',
                    width: '90px'
                  }}
                >
                  {r.status === 'PASSED' ? '✓ PASS' : '✕ FAIL'}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.name}</div>
                  <code style={{ fontSize: '12px', color: '#64748b' }}>{r.endpoint}</code>
                </div>

                <span style={{ fontSize: '13px', color: '#64748b', marginRight: '15px' }}>
                  {r.latencyMs} ms
                </span>

                <span style={{ fontSize: '12px', color: '#475569' }}>
                  {expandedIndex === idx ? '▲ Hide' : '▼ View Data'}
                </span>
              </div>

              {expandedIndex === idx && (
                <div style={{ padding: '15px', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '13px', overflowX: 'auto' }}>
                  {r.status === 'PASSED' ? (
                    <pre style={{ margin: 0 }}>{JSON.stringify(r.data, null, 2)}</pre>
                  ) : (
                    <div style={{ color: '#fca5a5' }}>
                      <strong>Error:</strong> {r.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
