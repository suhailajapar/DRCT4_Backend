const db = require("../database");
const { getUserById } = require("./user.service");

// Shared
export const getWalletsByLoginId = async (loginid) => {
  const user = await getUserById(loginid);
  if (!user || !user.rowCount) {
    return null;
  }

  const get_wallet_query = "SELECT * FROM hikers.wallet WHERE loginid = $1";
  const results = await db.query(get_wallet_query, [loginid]);
  return results.rows;
};

export const createWallet = async (currency, loginid) => {
  const create_wallet_query =
    "INSERT INTO hikers.wallet (currency, balance, loginid) VALUES ($1, $2, $3)";

  return await db.query(create_wallet_query, [currency, 0, loginid]);
};

export const getWalletByCurrencyLoginId = async (currency, loginid) => {
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
  if (!loginid) {
    return res.send({ error: "You have missing required fields/parameters." });
  }
  if (!currency) {
    currency = "USD";
  }

  const user = await getUserById(loginid);
  if (!user) {
    return res.send({ error: "User not found." });
  }

  const existing_wallet = await checkForExistingWallet(currency, loginid);
  if (existing_wallet) {
    return res.send({ error: "Existing wallet already exist." });
  }

  await createWallet(currency, loginid);
  const wallets = await getWalletsByLoginId(loginid);
  const wallet = wallets.find((w) => w.currency === currency);
  return res.send(wallet);
};

const topupWallet = async (req, res) => {
  const { walletid } = req.params;
  const { amount, currency } = req.body;
  if (!amount || !currency) {
    return res.send({ error: "You have missing required fields/parameters." });
  }

  const topup_ammount = Number.parseFloat(amount);
  if (topup_ammount < 0) {
    return res.send({ error: "Invalid amount." });
  }

  const get_wallet_id_query = "SELECT * FROM hikers.wallet WHERE id = $1";
  const result = await db.query(get_wallet_id_query, [walletid]);
  if (!result.rowCount) {
    return res.send({ error: "Wallet not found." });
  }

  const {
    id,
    balance: target_balance,
    currency: target_currency,
    loginid,
  } = result.rows[0];
  if (currency !== target_currency) {
    return res.send({ error: "Currency mismatch." });
  }

  const new_balance = Number.parseFloat(target_balance) + topup_ammount;
  const update_wallet_query = "UPDATE hikers.wallet SET balance = $1";
  await db.query(update_wallet_query, [new_balance]);

  return res.send({
    id,
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
