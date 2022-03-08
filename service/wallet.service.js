const res = require("express/lib/response");
const db = require("../database");

// Shared
const getWalletsByLoginId = async (loginid) => {
  const profile_query = "SELECT * from hikers.wallet	WHERE loginid=$1";

  const user = await db.query(profile_query, [loginid]);
  if (!user || !user.rowCount) {
    return null;
  }

  const get_wallet_query = "SELECT * FROM hikers.wallet WHERE loginid = $1";
  const results = await db.query(get_wallet_query, [loginid]);
  return results.rows;
};

const createWallet = async (currency, loginid) => {
  const create_wallet_query =
    "INSERT INTO hikers.wallet (currency, balance, loginid) VALUES ($1, $2, $3)";

  return await db.query(create_wallet_query, [currency, 0, loginid]);
};

const getWalletByCurrencyLoginId = async (currency, loginid) => {
  const get_wallet_query =
    "SELECT * FROM hikers.wallet WHERE loginid = $1 AND currency = $2";

  const result = await db.query(get_wallet_query, [loginid, currency]);
  return result.rows[0];
};

const checkForExistingWallet = async (currency, loginid) => {
  return await getWalletByCurrencyLoginId(currency, loginid);
};

// Services
const getAccountWallets = async (req, res) => {
  const { loginid } = req.params;
  if (!loginid) {
    return res.send({ error: "No loginid specified." });
  }
  const wallets = await getWalletsByLoginId(loginid);
  if (!wallets) {
    return res.send({ error: "User not found." });
  }
  return res.send(wallets);
};

const createNewWallet = async (req, res) => {
  const { loginid } = req.params;
  const { currency } = req.body;
  let parsed_currency = currency;

  if (!loginid) {
    return res.send({ error: "You have missing required fields/parameters." });
  }
  if (!currency) {
    parsed_currency = "USD";
  }

  const profile_query = "SELECT * from hikers.wallet	WHERE loginid=$1";

  const user = await db.query(profile_query, [loginid]);
  if (!user || !user.rowCount) {
    return res.send({ error: "User not found." });
  }

  const existing_wallet = await checkForExistingWallet(
    parsed_currency,
    loginid
  );
  if (existing_wallet) {
    return res.send({ error: "Existing wallet already exist." });
  }

  await createWallet(parsed_currency, loginid);
  const wallets = await getWalletsByLoginId(loginid);
  const wallet = wallets.find((w) => w.currency === currency);
  return res.send(wallet);
};

const topupWallet = async (req, res) => {
  const { wallet_id } = req.params;
  const { amount, currency } = req.body;
  if (!amount || !currency) {
    return res.send({ error: "You have missing required fields/parameters." });
  }

  const topup_ammount = Number.parseFloat(amount);
  if (topup_ammount < 0) {
    return res.send({ error: "Invalid amount." });
  }

  const get_wallet_id_query =
    "SELECT * FROM hikers.wallet WHERE wallet_id = $1";
  const result = await db.query(get_wallet_id_query, [wallet_id]);
  if (!result.rowCount) {
    return res.send({ error: "Wallet not found." });
  }

  const {
    walletId,
    balance: target_balance,
    currency: target_currency,
    loginid,
  } = result.rows[0];
  if (currency !== target_currency) {
    return res.send({ error: "Currency mismatch." });
  }

  const new_balance = Number.parseFloat(target_balance) + topup_ammount;
  const update_wallet_query =
    "UPDATE hikers.wallet SET balance = $1 WHERE wallet_id = $2";
  await db.query(update_wallet_query, [new_balance, wallet_id]);

  return res.send({
    wallet_id,
    currency: target_currency,
    balance: new_balance,
    loginid,
  });
};

module.exports = {
  getAccountWallets,
  createNewWallet,
  topupWallet,
  getWalletsByLoginId,
  getWalletByCurrencyLoginId,
  createWallet,
};
