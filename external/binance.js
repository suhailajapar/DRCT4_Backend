const axios = require("axios");

const API_ENDPOINT = "https://api.binance.com/api/v3";

const getCurrentCryptoPrice = async (target) => {
  try {
    const response = await axios.get(
      `${API_ENDPOINT}/ticker/price?symbol=${target.toUpperCase()}USDT`
    );

    const { price } = response.data;
    return Number.parseFloat(price);
  } catch (e) {
    return null;
  }
};

module.exports = { getCurrentCryptoPrice };
