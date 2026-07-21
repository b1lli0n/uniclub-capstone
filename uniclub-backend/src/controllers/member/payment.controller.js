const {
  listFeeOfUser: listFeeOfUserService,
  createVnpayPaymentUrl,
  handleVnpayCallback,
  getReceiptDetail
} = require('../../services/member/payment.service')

function resolveUserId(req) {
  return req.user?._id || req.user?.id
}

function resolveClubId(req) {
  return req.params.clubId || req.body.club_id || req.body.clubId || req.query.club_id || req.query.clubId
}

async function listFeeOfUser(req, res) {
  try {
    const userId = resolveUserId(req)
    const clubId = resolveClubId(req)
    const options = {
      ...req.query,
      clubId,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      period: req.query.period
    }

    const result = await listFeeOfUserService(userId, options)
    return res.status(200).json({
      success: true,
      message: 'Fee list retrieved successfully',
      data: result
    })
  } catch (err) {
    console.error(err)
    if (err.message === 'Invalid club_id') {
      return res.status(400).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Failed to fetch fee list' })
  }
}

async function viewPaymentReceipt(req, res) {
  try {
    const clubId = resolveClubId(req)
    const { receiptId } = req.params
    const userId = resolveUserId(req)

    const receipt = await getReceiptDetail(clubId, userId, receiptId)
    res.json({
      success: true,
      message: 'Receipt detail retrieved successfully',
      data: receipt
    })
  } catch (err) {
    console.error(err)
    if (err.message === 'Invalid receipt id' || err.message === 'Invalid club_id') {
      return res.status(400).json({ message: err.message })
    }
    if (err.message === 'You are not allowed to view this receipt' || err.message === 'You are not an active member of this club') {
      return res.status(403).json({ message: err.message })
    }
    if (err.message === 'Receipt not found') {
      return res.status(404).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Failed to fetch payment receipt' })
  }
}

async function createPaymentUrl(req, res) {
  try {
    const clubId = resolveClubId(req)
    const userId = resolveUserId(req)

    if (!clubId) {
      return res.status(400).json({ message: 'club_id is required' })
    }

    const payload = {
      ...req.body,
      payment_method: 1,
      status: 0
    }

    const ipRaw = req.headers['x-forwarded-for']
      || req.connection?.remoteAddress
      || req.socket?.remoteAddress
      || req.connection?.socket?.remoteAddress
      || '127.0.0.1'
    const ipAddr = String(ipRaw).split(',')[0].trim()

    const result = await createVnpayPaymentUrl({
      clubId,
      requesterId: userId,
      payload,
      ipAddr
    })

    return res.status(201).json({
      message: 'Payment URL created',
      ...result
    })
  } catch (err) {
    console.error(err)
    if (
      err.message === 'Invalid amount' ||
      err.message === 'period is required' ||
      err.message === 'Invalid fee_id' ||
      err.message === 'Invalid payment method' ||
      err.message === 'Invalid club_id' ||
      err.message === 'VNPay config is missing'
    ) {
      return res.status(400).json({ message: err.message })
    }
    if (err.message === 'Payment not found for VNPay') {
      return res.status(404).json({ message: err.message })
    }
    if (err.message === 'Payment is already successful') {
      return res.status(409).json({ message: err.message })
    }
    if (err.message === 'You are not an active member of this club') {
      return res.status(403).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Failed to create VNPay payment URL' })
  }
}

async function vnpayReturn(req, res) {
  try {
    const result = await handleVnpayCallback(req.query, req.originalUrl || req.url)
    const redirectUrl = process.env.VNP_RETURN_REDIRECT_URL || process.env.FRONTEND_VNP_RETURN_URL
    if (redirectUrl) {
      const qs = new URLSearchParams({
        status: String(result.status),
        txnRef: String(result.txnRef),
        paymentId: String(result.paymentId),
        vnpResponseCode: String(result.vnpResponseCode || ''),
        vnpPaydate: String(result.vnpPaydate || ''),
        vnpOrderInfo: String(result.vnpOrderInfo || '')
      }).toString()
      return res.redirect(`${redirectUrl}?${qs}`)
    }

    return res.status(200).json({
      message: 'VNPay return processed',
      ...result
    })
  } catch (err) {
    console.error(err)

    const redirectUrl = process.env.VNP_RETURN_REDIRECT_URL || process.env.FRONTEND_VNP_RETURN_URL
    if (redirectUrl) {
      const qs = new URLSearchParams({
        status: 'error',
        message: err.message || 'Failed to process VNPay return'
      }).toString()
      return res.redirect(`${redirectUrl}?${qs}`)
    }

    if (
      err.message === 'Invalid secure hash' ||
      err.message === 'Missing transaction reference' ||
      err.message === 'Payment not found'
    ) {
      return res.status(400).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Failed to process VNPay return' })
  }
}

async function vnpayIpn(req, res) {
  try {
    await handleVnpayCallback(req.query, req.originalUrl || req.url)
    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' })
  } catch (err) {
    console.error(err)
    if (err.message === 'Invalid secure hash') {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' })
    }
    if (err.message === 'Missing transaction reference' || err.message === 'Payment not found') {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' })
    }
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' })
  }
}

module.exports = {
  listFeeOfUser,
  viewPaymentReceipt,
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn
}
