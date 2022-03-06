const Router = require("express").Router;
const { buyTransaction } = require("../service/transaction.service");

const transactionRouter = Router();
transactionRouter
  .route("/")
  .get((req, res) => res.send("Transaction endpoint."));
transactionRouter.route("/buy").post(buyTransaction);

module.exports = transactionRouter;
