const catchAsyncError = require("../middleware/catchAsyncError");



console.log("error");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


console.log("error1")

exports.processPayment = catchAsyncError(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "dollar",
    metadata: {
      company: "Ecommerce",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});
console.log("error2")
exports.sendStripeApiKey = catchAsyncError(async (req, res, next) => {
  const tok= process.env.STRIPE_API_KEY;
  console.log(tok); 
  res.status(200).json({ stripeApiKey: "pk_test_51HcCS4Djtcq3C3IDYpmWJxhYIKLlopy6ol2egBb8qzNEb5SoKJ5FNTshU5fdYi3CDsz05NbMGJ5NMaR741neAoEK00QURpcYd9" });
});
console.log("error3");