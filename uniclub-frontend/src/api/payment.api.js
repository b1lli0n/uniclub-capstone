import { apiRequest } from './api'

export function getFeeList(clubId, params = {}) {
  const query = new URLSearchParams({
    club_id: clubId,
    ...params
  }).toString()
  return apiRequest(`/payment/fees?${query}`, {
    method: 'GET'
  })
}

export const getStudentClubFees = getFeeList

export function createPaymentUrl(data) {
  return apiRequest('/payment/create-payment-url', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function getReceiptDetail(clubId, receiptId) {
  const query = clubId ? `?club_id=${clubId}` : ''
  return apiRequest(`/payment/receipts/${receiptId}${query}`, {
    method: 'GET'
  })
}
