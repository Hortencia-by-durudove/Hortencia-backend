const express = require("express");
const authRoute = require("./auth.route");
const paymentRoute = require("./payment.route");
const contactRoute = require("./contact.route");
const bookingRoute = require("./booking.route");
const userRoute = require("./user.route");
const roomRoute = require("./room.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/payments",
    route: paymentRoute,
  },
  {
    path: "/contact",
    route: contactRoute,
  },
  {
    path: "/bookings",
    route: bookingRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/rooms",
    route: roomRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
