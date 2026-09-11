const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  viewPaymentReceipt,
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn,
  listFeeOfUser
} = require('../../controllers/member/payment.controller')

const { verifyToken } = require('../../middlewares/auth.middleware')

// VNPay callbacks must be public for VNPay server and browser redirects.
router.get('/vnpay-return', vnpayReturn)
router.get('/vnpay-ipn', vnpayIpn)

// Require authentication for member payment actions
router.use(verifyToken)

router.get('/fees', listFeeOfUser)
router.post('/create-payment-url', createPaymentUrl)
router.get('/receipts/:receiptId', viewPaymentReceipt)

module.exports = router
