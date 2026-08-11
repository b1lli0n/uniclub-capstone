const mongoose = require('mongoose')
const crypto = require('crypto')
const querystring = require('querystring')
const ClubMember = require('../../models/club_member.model')
const Payment = require('../../models/payment.model')
const Transaction = require('../../models/transaction.model')

const PAYMENT_STATUS = {
  PENDING: 0,
  SUCCESS: 1,
  FAILED: 2
}

const PAYMENT_METHOD = {
  CASH: 0,
  VNPAY: 1
}

function generateTxnRef() {
  const ts = Date.now().toString().slice(-8)
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `VNP${ts}${rand}`
}

function formatDateVnp(date = new Date()) {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`
}

function removeVietnameseTones(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const qs = require('qs')

// Sort object keys alphabetically and encode for VNPay V2.1.0 specification
function sortObject(obj = {}) {
  const sorted = {}
  const keys = Object.keys(obj)
    .filter((key) => obj[key] !== undefined && obj[key] !== null && obj[key] !== '')
    .sort()

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+')
  }

  return sorted
}

// Build HMAC-SHA512 signed query matching official VNPay standard
function buildSignedQuery(params, secretKey) {
  const sortedParams = sortObject(params)
  const signData = qs.stringify(sortedParams, { encode: false })
  const secureHash = crypto
    .createHmac('sha512', String(secretKey || '').trim())
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')

  return {
    sortedParams,
    secureHash,
    signedQuery: `${signData}&vnp_SecureHash=${secureHash}`
  }
}

function buildHashFromRawQuery(rawQuery = '', secretKey) {
  const queryPart = String(rawQuery || '').includes('?')
    ? String(rawQuery).split('?')[1]
    : String(rawQuery)

  const signData = queryPart
    .split('&')
    .filter((pair) => pair && !pair.startsWith('vnp_SecureHash=') && !pair.startsWith('vnp_SecureHashType='))
    .join('&')

  if (!signData) {
    return {
      signData: '',
      secureHash: ''
    }
  }

  const secureHash = crypto
    .createHmac('sha512', String(secretKey || '').trim())
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')

  return {
    signData,
    secureHash
  }
}

function getVnpayConfig() {
  const tmnCode = (process.env.vnp_TmnCode || process.env.VNP_TMNCODE || '').trim()
  const hashSecret = (process.env.vnp_HashSecret || process.env.VNP_HASHSECRET || '').trim()
  const vnpUrl = (process.env.vnp_Url || process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html').trim()
  const returnUrl = (process.env.vnp_ReturnUrl || process.env.VNP_RETURNURL || '').trim()

  if (!tmnCode || !hashSecret || !returnUrl) {
    throw new Error('VNPay config is missing')
  }

  return {
    tmnCode,
    hashSecret,
    vnpUrl,
    returnUrl
  }
}

function parsePaging(options = {}) {
  const page = Math.max(parseInt(options.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(options.limit || '20', 10), 1), 100)
  return { page, limit }
}

function normalizeStatus(status) {
  if (status === undefined || status === null || status === '') return null
  if (typeof status === 'number') {
    return [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED].includes(status)
      ? status
      : null
  }

  const value = String(status).trim()
  if (['0', '1', '2'].includes(value)) {
    return Number(value)
  }
  return null
}

function normalizePeriod(payload = {}) {
  const value = payload.period || payload.period_label || payload.periodLabel
  return value ? String(value).trim() : ''
}

function normalizeClubId(options = {}) {
  const value = options.club || options.club_id || options.clubId
  if (value === undefined || value === null) return null

  const trimmed = String(value).trim()
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null

  if (!mongoose.isValidObjectId(trimmed)) {
    throw new Error('Invalid club_id')
  }

  return trimmed
}


function applyMemberPaymentFilters(query, options = {}) {
  const normalizedStatus = normalizeStatus(options.status)
  if (normalizedStatus !== null) {
    query.status = normalizedStatus
  }

  if (options.period && String(options.period).trim()) {
    query.period = String(options.period).trim()
  }

  return query
}

async function getActiveMembership(clubId, userId) {
  const membership = await ClubMember.findOne({
    club_id: clubId,
    user_id: userId,
    status: { $in: ['active', 1] }
  })

  if (!membership) {
    throw new Error('You are not an active member of this club')
  }

  return membership
}

async function listFeeOfUser(userId, options = {}) {
  const { page, limit } = parsePaging(options)
  const normalizedClubId = normalizeClubId(options)

  let memberships = []
  if (normalizedClubId) {
    const membership = await ClubMember.findOne({
      user_id: userId,
      status: { $in: ['active', 1] },
      club_id: normalizedClubId
    })
      .select('_id club_id status role')
      .lean()

    memberships = membership ? [membership] : []
  } else {
    memberships = await ClubMember.find({
      user_id: userId,
      status: { $in: ['active', 1] }
    })
      .select('_id club_id status role')
      .lean()
  }

  if (!memberships.length) {
    return {
      items: [],
      page,
      limit,
      total: 0,
      summary: {
        unpaid: 0,
        paid: 0,
        failed: 0,
        all: 0
      },
      user_id: userId
    }
  }

  const membershipIds = memberships.map((item) => item._id)
  const query = applyMemberPaymentFilters({ membership_id: { $in: membershipIds } }, options)
  const countQueryBase = { membership_id: { $in: membershipIds } }
  if (options.period && String(options.period).trim()) {
    countQueryBase.period = String(options.period).trim()
  }

  const [items, total, unpaid_count, paid_count, failed_count] = await Promise.all([
    Payment.find(query)
      .sort({ status: 1, period: -1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'membership_id',
        select: 'club_id status role user_id',
        populate: [
          { path: 'club_id', select: 'name category logo_url' },
          { path: 'user_id', select: 'full_name email avatar_url' }
        ]
      })
      .populate({
        path: 'transaction_id',
        select: 'category description type'
      })
      .lean(),
    Payment.countDocuments(query),
    Payment.countDocuments({ ...countQueryBase, status: PAYMENT_STATUS.PENDING }),
    Payment.countDocuments({ ...countQueryBase, status: PAYMENT_STATUS.SUCCESS }),
    Payment.countDocuments({ ...countQueryBase, status: PAYMENT_STATUS.FAILED })
  ])

  return {
    items: items.map((item) => {
      const club = item.membership_id?.club_id || null

      return {
        ...item,
        club_id: club?._id || null,
        club_name: club?.name || null,
        club_logo: club?.logo_url || null
      }
    }),
    page,
    limit,
    total,
    summary: {
      unpaid: unpaid_count,
      paid: paid_count,
      failed: failed_count,
      all: unpaid_count + paid_count + failed_count
    },
    user_id: userId
  }
}

async function createVnpayPaymentUrl({ clubId, requesterId, payload = {}, ipAddr = '127.0.0.1' }) {
  if (!mongoose.isValidObjectId(clubId)) {
    throw new Error('Invalid club_id')
  }

  const config = getVnpayConfig()
  const createDate = formatDateVnp(new Date())

  const membership = await getActiveMembership(clubId, requesterId)

  const paymentId = payload.payment_id || payload.paymentId || payload.receipt_id || payload.receiptId
  let receipt = null

  if (paymentId && mongoose.isValidObjectId(paymentId)) {
    receipt = await Payment.findOne({
      _id: paymentId,
      membership_id: membership._id
    })
  } else {
    const period = normalizePeriod(payload)
    const amount = Number(payload.amount)

    const lookup = {
      membership_id: membership._id,
      status: PAYMENT_STATUS.PENDING
    }

    if (period) {
      lookup.period = period
    }

    if (Number.isFinite(amount) && amount > 0) {
      lookup.amount = amount
    }

    receipt = await Payment.findOne(lookup).sort({ created_at: -1 })
  }

  if (!receipt) {
    throw new Error('Payment not found for VNPay')
  }

  if (receipt.status === PAYMENT_STATUS.SUCCESS) {
    throw new Error('Payment is already successful')
  }

  receipt.payment_method = PAYMENT_METHOD.VNPAY
  receipt.status = PAYMENT_STATUS.PENDING
  receipt.txn_ref = generateTxnRef()
  receipt.vnp_response_code = undefined
  const rawOrderInfo = String(payload.orderInfo || receipt.period || 'Membership fee payment').trim()
  receipt.order_info = removeVietnameseTones(rawOrderInfo) || 'Thanh toan hoi phi'
  receipt.paid_at = undefined
  await receipt.save()

  const amount = Math.round(Number(receipt.amount) * 100)
  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: payload.language ? String(payload.language).trim() : 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: receipt.txn_ref,
    vnp_OrderInfo: receipt.order_info,
    vnp_OrderType: payload.orderType ? String(payload.orderType).trim() : 'other',
    vnp_Amount: amount,
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate
  }

  if (payload.bankCode && String(payload.bankCode).trim()) {
    vnpParams.vnp_BankCode = String(payload.bankCode).trim()
  }

  const { signedQuery } = buildSignedQuery(vnpParams, config.hashSecret)
  const paymentUrl = `${config.vnpUrl}?${signedQuery}`
  console.log('=== GENERATED VNPAY URL ===', paymentUrl)

  return {
    paymentUrl,
    txnRef: receipt.txn_ref,
    paymentId: receipt._id
  }
}

async function handleVnpayCallback(query = {}, rawQuery = '') {
  const config = getVnpayConfig()
  const params = { ...query }

  const receivedHash = params.vnp_SecureHash
  delete params.vnp_SecureHash
  delete params.vnp_SecureHashType

  if (!receivedHash) {
    throw new Error('Invalid secure hash')
  }

  let calculatedHash = buildSignedQuery(params, config.hashSecret).secureHash
  if (rawQuery) {
    const rawHash = buildHashFromRawQuery(rawQuery, config.hashSecret).secureHash
    if (rawHash) {
      calculatedHash = rawHash
    }
  }

  if (calculatedHash.toLowerCase() !== String(receivedHash).toLowerCase()) {
    throw new Error('Invalid secure hash')
  }

  const txnRef = params.vnp_TxnRef ? String(params.vnp_TxnRef).trim() : ''
  if (!txnRef) {
    throw new Error('Missing transaction reference')
  }

  const payment = await Payment.findOne({ txn_ref: txnRef })
  if (!payment) {
    throw new Error('Payment not found')
  }

  const responseCode = params.vnp_ResponseCode ? String(params.vnp_ResponseCode).trim() : ''
  const isSuccess = responseCode === '00'
  const nextStatus = isSuccess ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED

  if (payment.status === PAYMENT_STATUS.PENDING) {
    payment.status = nextStatus
    payment.vnp_response_code = responseCode || undefined
    if (isSuccess) {
      payment.paid_at = new Date()
    }
    await payment.save()
  }

  return {
    paymentId: payment._id,
    txnRef,
    status: payment.status,
    vnpResponseCode: responseCode,
    vnpPaydate: params.vnp_PayDate ? String(params.vnp_PayDate).trim() : undefined,
    vnpOrderInfo: params.vnp_OrderInfo ? String(params.vnp_OrderInfo).trim() : undefined
  }
}

async function getReceiptDetail(clubId, userId, receiptId) {
  if (!mongoose.isValidObjectId(receiptId)) {
    throw new Error('Invalid receipt id')
  }

  if (clubId && !mongoose.isValidObjectId(clubId)) {
    throw new Error('Invalid club_id')
  }

  const payment = await Payment.findById(receiptId)
    .populate({
      path: 'membership_id',
      select: 'club_id user_id role status',
      populate: [
        { path: 'club_id', select: 'name category logo_url description' },
        { path: 'user_id', select: 'full_name email avatar_url' }
      ]
    })
    .populate({
      path: 'transaction_id',
      select: 'category description type transaction_date'
    })
    .lean()

  if (!payment) {
    throw new Error('Receipt not found')
  }

  const membership = payment.membership_id
  if (!membership) {
    throw new Error('Receipt not found')
  }

  const memberUserId = membership.user_id?._id || membership.user_id
  if (String(memberUserId) !== String(userId)) {
    throw new Error('You are not allowed to view this receipt')
  }

  if (clubId) {
    const memberClubId = membership.club_id?._id || membership.club_id
    if (String(memberClubId) !== String(clubId)) {
      throw new Error('You are not allowed to view this receipt')
    }
  }

  const club = membership.club_id || null
  const user = membership.user_id || null

  return {
    receiptId: payment._id,
    payment_id: payment._id,
    membership_id: membership._id,
    club: club ? {
      _id: club._id,
      name: club.name,
      category: club.category,
      logo_url: club.logo_url
    } : null,
    user: user ? {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url
    } : null,
    period: payment.period,
    amount: payment.amount,
    status: payment.status,
    status_label: payment.status === 1 ? 'SUCCESS' : payment.status === 2 ? 'FAILED' : 'PENDING',
    payment_method: payment.payment_method,
    payment_method_label: payment.payment_method === 1 ? 'VNPAY' : 'CASH',
    txn_ref: payment.txn_ref,
    vnp_response_code: payment.vnp_response_code,
    order_info: payment.order_info,
    paid_at: payment.paid_at,
    created_at: payment.created_at,
    transaction: payment.transaction_id || null
  }
}

module.exports = {
  listFeeOfUser,
  createVnpayPaymentUrl,
  handleVnpayCallback,
  getReceiptDetail
}
