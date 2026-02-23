// src/services/api.js

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwdYmg60zjZf0oo7OtI8JvWiC4wFu_KMuDJEzvsvXsbO7PcIz16k_RGS837Uh-lbysaWQ/exec';

/**
 * Generic API Caller to Google Apps Script
 * @param {string} action - The action name (e.g., 'login', 'getHomePageData')
 * @param {object} params - Additional parameters to send
 * @returns {Promise<any>}
 */
export const callAPI = async (action, params = {}) => {
  try {
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append('action', action);

    // Append all params to the URL query string
    Object.keys(params).forEach(key => {
      // Convert objects/arrays to JSON string if needed, otherwise string
      const value = typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
      url.searchParams.append(key, value);
    });

    // Use fetch with 'no-cors' mode might be needed if simple GET, but GAS usually returns JSON.
    // However, GAS Web Apps redirect (302) to the content.
    // fetch() follows redirects by default.
    const response = await fetch(url.toString(), {
      method: 'GET', // The GAS script supports doGet which handles all logic
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Call Failed [${action}]:`, error);
    return { success: false, error: error.message };
  }
};

// --- User Actions ---
export const login = (username, password) => callAPI('login', { username, password });
export const register = (userData) => callAPI('register', userData);
export const getUserInfo = (userId) => callAPI('getUserInfo', { userId });
export const getHomePageData = () => callAPI('getHomePageData');
export const getLotteryTypes = (all = false) => callAPI('getLotteryTypes', { all });
export const placeBet = (userId, lotteryType, bets) => callAPI('placeBet', { userId, lotteryType, bets });
export const getWalletPageData = (userId) => callAPI('getWalletPageData', { userId });
export const createTransaction = (data) => callAPI('createTransaction', data);
export const getUserBetHistory = (userId) => callAPI('getUserBetHistory', { userId });
export const getLatestResults = (lotteryType = 'ALL') => callAPI('getLatestResults', { lotteryType });
export const getUITexts = () => callAPI('getUITexts');
export const getBanks = (all = false) => callAPI('getBanks', { all });
export const getSystemBankDetails = () => callAPI('getSystemBankDetails');
export const updateTransactionDetails = (data) => callAPI('updateTransactionDetails', data);
export const saveUser = (data) => callAPI('saveUser', data);
export const getUserReferralSummary = (userId) => callAPI('getUserReferralSummary', { userId });
export const getUserWithdrawalsToday = (userId) => callAPI('getUserWithdrawalsToday', { userId });

// --- Wheel ---
export const getWheelPrizes = () => callAPI('getWheelPrizes');
export const spinWheel = (userId) => callAPI('spinWheel', { userId });

// --- Admin Actions ---
export const adminLogin = (username, password) => callAPI('adminLogin', { username, password });
export const getAdminStats = () => callAPI('getAdminStats');
export const getExtendedDashboardData = () => callAPI('getExtendedDashboardData');
export const getDashboardChartData = () => callAPI('getDashboardChartData');
export const getAdvancedStats = () => callAPI('getAdvancedStats');
export const getAdminTableData = (sheetName) => callAPI('getAdminTableData', { sheetName });
export const saveAdminRecord = (sheetName, data) => callAPI('saveAdminRecord', { sheetName, data }); // data should be JSON string
export const deleteAdminRecord = (sheetName, id) => callAPI('deleteAdminRecord', { sheetName, id });
export const processTransaction = (id, status, adminName) => callAPI('processTransaction', { id, status, adminName });
export const saveWebSettings = (data) => callAPI('saveWebSettings', { data }); // data is JSON string

// --- System ---
export const syncExternalResults = () => callAPI('syncResults');

export default {
  callAPI,
  login,
  register,
  getHomePageData,
  // ... export all
};
