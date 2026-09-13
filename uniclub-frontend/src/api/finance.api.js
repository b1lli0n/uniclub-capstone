import { apiRequest } from './api'

export function getClubTransactions(clubId, params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return apiRequest(`/treasurer/transaction-management/${clubId}/transactions${query}`)
}

export function getFinancialDashboard(clubId) {
  return apiRequest(`/treasurer/transaction-management/${clubId}/transactions/dashboard`)
}

export function createTransactionRequest(clubId, data) {
  return apiRequest(`/treasurer/transaction-management/${clubId}/transactions`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateTransactionRequest(clubId, transactionId, data) {
  return apiRequest(`/treasurer/transaction-management/${clubId}/transactions/${transactionId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function getTransactionDetail(clubId, transactionId) {
  return apiRequest(`/treasurer/transaction-management/${clubId}/transactions/${transactionId}`)
}
