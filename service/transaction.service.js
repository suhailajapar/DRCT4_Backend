const db = require("../database");
const { getUserById } = require("./user.service");
const {
  getWalletsByLoginId,
  getWalletByCurrencyLoginId,
  createWallet,
} = require("./wallet.service");
const { getCurrentCryptoPrice } = require("../external/binance");

const buyTransaction = async (req, res) => {
  const { loginid, currency, quantity } = req.body;
  if (!loginid || !currency || !quantity) {
    return res.send({ error: "You have missing required fields/parameters." });
  }

  const wallets = await getWalletsByLoginId(loginid);
  if (wallets === null) {
    return res.send({ error: "User not found." });
  } else if (wallets.length < 1) {
    return res.send({ error: "No wallet available for user." });
  }

  const buy_wallet = wallets.find((w) => w.currency === "USD");
  let target_wallet = wallets.find((w) => w.currency === currency);
  if (!target_wallet) {
    await createWallet(currency, loginid);
    target_wallet = await getWalletByCurrencyLoginId(currency, loginid);
  }

  const crypto_price_usdt = await getCurrentCryptoPrice(currency);
};

module.exports = { buyTransaction };
