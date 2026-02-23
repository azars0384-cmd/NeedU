const SPREADSHEET_ID = "1ezLJS3rhWiclHvcoNZ346QytZA2L6dzF_m4GHxnkM2k"; // ⚠️ ใส่ ID Google Sheet ของคุณที่นี่
const SOURCE_RESULTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6H6WWef9PagUoZE5wOGcOcUgkz0OVhCVR4hV-EvPgVrG2532EPd3cNJzjfyyoIfvdzAek-nFNVvNp/pubhtml?gid=36966565&single=true";
const TIMEZONE = "Asia/Bangkok";

// --- CONFIGURATION: SHEET NAMES ---
const SHEETS = {
  USERS: "Users",
  TRANSACTIONS: "Transactions",
  LOTTERY_TYPES: "LotteryTypes",
  LOTTERY_RESULTS: "LotteryResults",
  BETS: "Bets",
  DEPOSIT_RULES: "DepositRules",
  SLIDERS: "Sliders",
  ARTICLES: "Articles",
  TRENDING: "Trending",
  ADMINS: "Admins",
  SETTINGS: "Settings",
  BLOCKED_NUMBERS: "BlockedNumbers",
  BANKS: "Banks",
  PAYOUT_RATES: "PayoutRates",
  UI_TEXT: "UIText",
  WHEEL_PRIZES: "WheelPrizes",
};

// --- CORE UTILS ---
function getThaiNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
  );
}

function formatThaiDateTime(ts) {
  if (!ts) return "-";
  const date = new Date(ts);
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear() + 543;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d} ${m} ${y} เวลา ${hh}:${mm} น.`;
}
function getCurrentTimestamp() {
  return Utilities.formatDate(getThaiNow(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}
function getThaiDateString() {
  return Utilities.formatDate(getThaiNow(), TIMEZONE, "yyyy-MM-dd");
}
function openSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}
function generateId(prefix) {
  return (
    (prefix || "ID") +
    Date.now().toString(36).toUpperCase() +
    Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  );
}
function hashPin(pin) {
  // Simple hash for demo - recommend bcrypt/pbkdf2 in prod if possible in GAS
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(pin), Utilities.Charset.UTF_8);
  return bytes.map((b) => ("0" + (b & 0xff).toString(16)).slice(-2)).join("");
}
function hashPassword(password) { return hashPin(password); }

function getSheetLock() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  return lock;
}

function getOrSetCache(key, callback, expirationInSeconds = 600) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  if (cached) return JSON.parse(cached);
  const result = callback();
  if (result) cache.put(key, JSON.stringify(result), expirationInSeconds);
  return result;
}

// --- API ROUTER ---
function doGet(e) {
  // Handle CORS and Preflight logic if needed (GAS handles simple GETs well)
  if (e && e.parameter && e.parameter.action) {
    const output = handleApiRequest(e);
    const jsonOutput = JSON.stringify(output);
    if (e.parameter.callback) {
      return ContentService.createTextOutput(`${e.parameter.callback}(${jsonOutput})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(jsonOutput).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput("API Running");
}

function doPost(e) { return doGet(e); }

function handleApiRequest(e) {
  const action = e.parameter.action;
  try {
    const actions = {
      login: () => login(e.parameter),
      register: () => register(e.parameter),
      getUserInfo: () => getUserInfo(e.parameter),
      getHomePageData: () => getHomePageData(),
      getUITexts: () => getUITexts(),
      placeBet: () => placeBet(e.parameter),
      createTransaction: () => createTransaction(e.parameter),
      updateTransactionDetails: () => updateTransactionDetails(e.parameter),
      getWalletPageData: () => getWalletPageData(e.parameter),
      getUserReferralSummary: () => getUserReferralSummary(e.parameter),
      getUserWithdrawalsToday: () => getUserWithdrawalsToday(e.parameter),
      saveUser: () => saveUser(e.parameter),
      syncResults: () => syncExternalResults(),

      adminLogin: () => adminLogin(e.parameter),
      getAdminStats: () => getAdminStats(),
      getExtendedDashboardData: () => getExtendedDashboardData(),
      getDashboardChartData: () => getDashboardChartData(),
      getAdvancedStats: () => getAdvancedStats(),
      getAdminTableData: () => getAdminTableData(e.parameter),
      saveAdminRecord: () => saveAdminRecordGeneric(e.parameter),
      deleteAdminRecord: () => deleteAdminRecord(e.parameter),
      processTransaction: () => processTransaction(e.parameter),
      saveWebSettings: () => saveWebSettings(e.parameter),

      getBanks: () => getBanks(e.parameter),
      getLotteryTypes: () => getLotteryTypes(e.parameter),
      getLatestResults: () => getLatestResults(e.parameter),
      getSystemBankDetails: () => getSystemBankDetails(),
      getUserBetHistory: () => getUserBetHistory(e.parameter),

      getWheelPrizes: () => getWheelPrizes(),
      spinWheel: () => spinWheel(e.parameter),
    };

    if (actions[action]) return actions[action]();
    return { success: false, error: "Unknown action: " + action };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// --- DB HELPERS ---
function sheetToJSON(sheetName) {
  const ss = openSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map((h) => String(h).trim());
  return values.slice(1).map((row) => {
    let obj = {};
    headers.forEach((h, i) => {
      let v = row[i];
      if (v instanceof Date) {
        v = Utilities.formatDate(v, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
      }
      obj[h] = v;
    });
    return obj;
  });
}

function getHeaders(sheetName) {
  const sheet = openSpreadsheet().getSheetByName(sheetName);
  return sheet ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map((h) => String(h).trim()) : [];
}

function findRecord(sheetName, id, idCol) {
  const sheet = openSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { idx: -1, data: null };
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h) => String(h).trim());
  const colIdx = headers.indexOf(String(idCol).trim());
  if (colIdx === -1) return { idx: -1, data: null, error: `Column ${idCol} not found` };
  const searchId = String(id).trim();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIdx]).trim() === searchId) {
      let obj = {};
      headers.forEach((h, j) => (obj[h] = data[i][j]));
      return { idx: i + 1, data: obj };
    }
  }
  return { idx: -1, data: null };
}

function saveRecord(sheetName, data, idCol, prefix) {
  const lock = getSheetLock();
  try {
    const sheet = openSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return { success: false, error: `Sheet ${sheetName} missing` };
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map((h) => String(h).trim());
    const id = data[idCol] || generateId(prefix);
    data[idCol] = id;
    if (!data["อัปเดตล่าสุด"]) data["อัปเดตล่าสุด"] = getCurrentTimestamp();
    if (!data["วันที่สร้าง"] && headers.includes("วันที่สร้าง")) data["วันที่สร้าง"] = getCurrentTimestamp();
    const info = findRecord(sheetName, id, idCol);
    const row = headers.map((h) => {
      if (h === "รหัสPIN" && data[h]) return hashPassword(data[h]);
      return data[h] !== undefined ? data[h] : info.data ? info.data[h] : "";
    });
    if (info.idx !== -1) {
      sheet.getRange(info.idx, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    return { success: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

function updateCell(sheetName, rowIdx, colName, val) {
  const lock = getSheetLock();
  try {
    const sheet = openSpreadsheet().getSheetByName(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map((h) => String(h).trim());
    const colIdx = headers.indexOf(String(colName).trim()) + 1;
    if (colIdx > 0) sheet.getRange(rowIdx, colIdx).setValue(val);
  } finally {
    lock.releaseLock();
  }
}

// --- AUTH & USER ---
function login(p) {
  const users = sheetToJSON(SHEETS.USERS);
  const user = users.find((u) => String(u["เบอร์โทรศัพท์"]) === String(p.username) && u["รหัสPIN"] === hashPassword(p.password));
  if (!user) return { success: false, error: "Login Failed" };
  return { success: true, data: { userId: user["รหัสผู้ใช้"], username: user["ชื่อผู้ใช้"], name: user["ชื่อ-สกุล"], balance: Number(user["ยอดเงินคงเหลือ"]), bankName: user["ชื่อธนาคาร"], accountNumber: user["เลขที่บัญชี"] } };
}

function register(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const users = sheetToJSON(SHEETS.USERS);
    if (users.some((u) => String(u["เบอร์โทรศัพท์"]) === String(p.phone))) return { success: false, error: "User exists" };
    const newUser = {
      รหัสผู้ใช้: generateId("U"), ชื่อผู้ใช้: p.phone, เบอร์โทรศัพท์: p.phone, รหัสPIN: p.pin, "ชื่อ-สกุล": p.name, ยอดเงินคงเหลือ: 0,
      รายได้แนะนำ: 0, ชื่อธนาคาร: p.bankName, ชื่อบัญชี: p.accountName, เลขที่บัญชี: p.accountNumber, สถานะ: "active", วันที่สมัคร: getCurrentTimestamp()
    };
    saveRecord(SHEETS.USERS, newUser, "รหัสผู้ใช้");
    return { success: true, data: { userId: newUser["รหัสผู้ใช้"], name: newUser["ชื่อ-สกุล"], balance: 0 } };
  } finally { lock.releaseLock(); }
}

function getUserInfo(p) {
  const info = findRecord(SHEETS.USERS, p.userId, "รหัสผู้ใช้");
  if (info.idx === -1) return { success: false };
  return { success: true, data: { name: info.data["ชื่อ-สกุล"], balance: Number(info.data["ยอดเงินคงเหลือ"]), bankName: info.data["ชื่อธนาคาร"], accountNumber: info.data["เลขที่บัญชี"] } };
}

// --- TRANSACTION ---
function createTransaction(p) {
  const lock = getSheetLock();
  try {
    const amount = parseFloat(p.amount);
    if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

    if (p.type === "deposit") {
      const txData = { รหัสผู้ใช้: p.userId, ประเภท: "deposit", จำนวนเงิน: amount, สถานะ: "pending", รายละเอียด: p.promoDetails || "Normal", วันที่สร้างรายการ: getCurrentTimestamp() };
      const res = saveRecord(SHEETS.TRANSACTIONS, txData, "รหัสธุรกรรม", "TX");
      return { success: true, transactionId: res.id };
    }
    if (p.type === "withdraw") {
      const uInfo = findRecord(SHEETS.USERS, p.userId, "รหัสผู้ใช้");
      if (Number(uInfo.data["ยอดเงินคงเหลือ"]) < amount) throw new Error("Insufficient Balance");
      updateCell(SHEETS.USERS, uInfo.idx, "ยอดเงินคงเหลือ", Number(uInfo.data["ยอดเงินคงเหลือ"]) - amount);
      return saveRecord(SHEETS.TRANSACTIONS, { รหัสผู้ใช้: p.userId, ประเภท: "withdraw", จำนวนเงิน: amount, สถานะ: "pending", วันที่สร้างรายการ: getCurrentTimestamp() }, "รหัสธุรกรรม", "TX");
    }
    return { success: false, error: "Invalid Type" };
  } catch (e) { return { success: false, error: e.message }; }
  finally { lock.releaseLock(); }
}

function updateTransactionDetails(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const info = findRecord(SHEETS.TRANSACTIONS, p.transactionId, "รหัสธุรกรรม");
    if (info.idx === -1) return { success: false, error: "Transaction Not Found" };
    if (p.slipUrl) updateCell(SHEETS.TRANSACTIONS, info.idx, "ลิงก์สลิป", p.slipUrl);
    if (p.transferTime) updateCell(SHEETS.TRANSACTIONS, info.idx, "ข้อมูลธนาคาร", `Time: ${p.transferTime}`);
    return { success: true };
  } finally { lock.releaseLock(); }
}

// --- BETTING ---
function placeBet(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const u = findRecord(SHEETS.USERS, p.userId, "รหัสผู้ใช้");
    const l = sheetToJSON(SHEETS.LOTTERY_TYPES).find((x) => x["รหัสประเภทหวย"] === p.lotteryType);
    const bets = JSON.parse(p.bets);
    const total = bets.reduce((s, b) => s + Number(b.amount), 0);
    if (Number(u.data["ยอดเงินคงเหลือ"]) < total) throw new Error("Low Balance");
    updateCell(SHEETS.USERS, u.idx, "ยอดเงินคงเหลือ", Number(u.data["ยอดเงินคงเหลือ"]) - total);

    // Commission logic skipped for brevity but can be added here

    const sheet = openSpreadsheet().getSheetByName(SHEETS.BETS);
    bets.forEach((b) => {
      const k = "อัตราจ่าย_" + b.format.replace(/ /g, "");
      const rate = l[k] ? Number(l[k]) : 90;
      sheet.appendRow([generateId("BET"), p.userId, p.lotteryType, getThaiDateString(), b.format, b.number, b.amount, rate, "pending", 0, getCurrentTimestamp(), ""]);
    });
    return { success: true, data: { newBalance: Number(u.data["ยอดเงินคงเหลือ"]) - total } };
  } catch (e) { return { success: false, error: e.message }; }
  finally { lock.releaseLock(); }
}

// --- ADMIN & DASHBOARD ---
function getAdminStats() {
  const u = sheetToJSON(SHEETS.USERS);
  const t = sheetToJSON(SHEETS.TRANSACTIONS);
  const d = getThaiDateString();
  return {
    success: true,
    data: {
      totalUsers: u.length,
      totalDeposits: t.filter((x) => x["ประเภท"] == "deposit" && x["สถานะ"] == "completed" && String(x["วันที่สร้างรายการ"]).startsWith(d)).reduce((a, b) => a + Number(b["จำนวนเงิน"]), 0),
      totalWithdrawals: t.filter((x) => x["ประเภท"] == "withdraw" && x["สถานะ"] == "completed" && String(x["วันที่สร้างรายการ"]).startsWith(d)).reduce((a, b) => a + Number(b["จำนวนเงิน"]), 0),
      totalBets: u.reduce((a, b) => a + Number(b["ยอดเงินคงเหลือ"] || 0), 0) // Using balance as proxy for system money
    },
  };
}

function getAdminTableData(p) { return { success: true, data: sheetToJSON(SHEETS[p.sheetName] || p.sheetName) }; }
function saveAdminRecordGeneric(p) { const d = JSON.parse(p.data); const s = SHEETS[p.sheetName] || p.sheetName; const h = getHeaders(s); return saveRecord(s, d, h[0]); }
function deleteAdminRecord(p) { const s = openSpreadsheet().getSheetByName(SHEETS[p.sheetName] || p.sheetName); const i = findRecord(SHEETS[p.sheetName] || p.sheetName, p.id, getHeaders(SHEETS[p.sheetName] || p.sheetName)[0]); if (i.idx !== -1) s.deleteRow(i.idx); return { success: true }; }

function processTransaction(p) {
  const l = LockService.getScriptLock();
  l.waitLock(30000);
  try {
    const i = findRecord(SHEETS.TRANSACTIONS, p.id, "รหัสธุรกรรม");
    if (i.idx === -1) throw new Error("Not found");
    const u = findRecord(SHEETS.USERS, String(i.data["รหัสผู้ใช้"]).trim(), "รหัสผู้ใช้");
    const amt = Number(i.data["จำนวนเงิน"]);
    if (p.status === "completed" && i.data["ประเภท"] === "deposit") updateCell(SHEETS.USERS, u.idx, "ยอดเงินคงเหลือ", Number(u.data["ยอดเงินคงเหลือ"]) + amt);
    else if (p.status === "rejected" && i.data["ประเภท"] === "withdraw") updateCell(SHEETS.USERS, u.idx, "ยอดเงินคงเหลือ", Number(u.data["ยอดเงินคงเหลือ"]) + amt);
    updateCell(SHEETS.TRANSACTIONS, i.idx, "สถานะ", p.status);
    updateCell(SHEETS.TRANSACTIONS, i.idx, "ดำเนินการโดย", p.adminName);
    return { success: true };
  } finally { l.releaseLock(); }
}

// --- GENERAL GETTERS ---
function getHomePageData() {
  const sliders = sheetToJSON(SHEETS.SLIDERS).filter((x) => x["เปิดใช้งาน"]).sort((a, b) => a["ลำดับ"] - b["ลำดับ"]);
  const promos = sheetToJSON(SHEETS.DEPOSIT_RULES).filter((x) => x["เปิดใช้งาน"]);
  const articles = sheetToJSON(SHEETS.ARTICLES).filter((x) => x["เปิดใช้งาน"]);
  const popularLotto = sheetToJSON(SHEETS.LOTTERY_TYPES).filter((x) => x["เปิดใช้งาน"] && x["ยอดนิยม"]);
  return { success: true, data: { sliders, promos, articles, popularLotto } };
}

function getLotteryTypes(p) {
  const all = sheetToJSON(SHEETS.LOTTERY_TYPES);
  const filtered = all.filter((x) => (p && p.all) || x["เปิดใช้งาน"]);
  const transformed = filtered.map((x) => ({ ...x, formattedOpen: formatThaiDateTime(x["เวลาเปิดรับ (Full)"]), formattedClose: formatThaiDateTime(x["เวลาปิดรับ (Full)"]), rawClose: x["เวลาปิดรับ (Full)"] }));
  return { success: true, data: transformed };
}

function getLatestResults(p) {
  const results = sheetToJSON(SHEETS.LOTTERY_RESULTS);
  const types = sheetToJSON(SHEETS.LOTTERY_TYPES);
  let filtered = results;
  if (p && p.lotteryType && p.lotteryType !== "ALL") filtered = results.filter((x) => String(x["CODE"]) === String(p.lotteryType));
  filtered.sort((a, b) => new Date(b["วันที่"]) - new Date(a["วันที่"]));
  const mapped = filtered.map((res) => {
    const lottoInfo = types.find((t) => String(t["รหัสประเภทหวย"]) === String(res["CODE"])) || {};
    return { lotteryTypeId: res["CODE"], lotteryName: res["ชื่อหวย"] || lottoInfo["ชื่อเต็ม"] || res["CODE"], lotteryFlag: lottoInfo["ลิงก์รูปภาพ"], drawDate: formatThaiDateTime(res["วันที่"]), prizeFirst: res["รางวัลที่ 1 / 4ตัว"], prize6: res["รางวัลที่ 1 / 4ตัว"], prizeLast2: res["ท้าย2 / 2ล่าง"], prizeFirst3: res["หน้า3 / 3ตัว"], prizeLast3: res["ท้าย3 / 2บน"] };
  });
  return { success: true, data: mapped };
}

function getWalletPageData(p) {
  const u = findRecord(SHEETS.USERS, p.userId, "รหัสผู้ใช้").data || {};
  const tx = sheetToJSON(SHEETS.TRANSACTIONS).filter((x) => String(x["รหัสผู้ใช้"]) == String(p.userId));
  const history = tx.map(x => ({ ...x, type: x["ประเภท"], time: formatThaiDateTime(x["วันที่สร้างรายการ"]), amount: Number(x["จำนวนเงิน"]), status: x["สถานะ"] })).sort((a, b) => new Date(b["วันที่สร้างรายการ"]) - new Date(a["วันที่สร้างรายการ"])).slice(0, 50);
  return { success: true, data: { balance: Number(u["ยอดเงินคงเหลือ"] || 0), history } };
}

function getSystemBankDetails() {
  const s = sheetToJSON(SHEETS.SETTINGS);
  const getS = (k) => (s.find(x => x["คีย์"] === k) || {})["ค่า"];
  return { success: true, data: { promptpay: getS("promptpay_number"), bankName: getS("receiving_bank_name"), accountName: getS("receiving_account_name"), accountNumber: getS("receiving_account_number") } };
}

function getBanks(p) { return { success: true, data: sheetToJSON(SHEETS.BANKS) }; }
function getUITexts() { return { success: true, data: {} }; } // Simplified
function getUserBetHistory(p) {
  const bets = sheetToJSON(SHEETS.BETS).filter(b => String(b["รหัสผู้ใช้"]) === String(p.userId));
  return { success: true, data: bets.map(b => ({ ...b, amount: Number(b["จำนวนเงิน"]), winAmount: Number(b["ยอดชนะ"]), status: b["สถานะโพย"] })) };
}

// --- EXTERNAL SYNC ---
function syncExternalResults() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return { success: false, error: "System busy" };
  try {
    const html = UrlFetchApp.fetch(SOURCE_RESULTS_URL).getContentText();
    const tableData = parseHtmlTable(html);
    if (!tableData || tableData.length === 0) throw new Error("No data found");
    const systemSheet = openSpreadsheet().getSheetByName(SHEETS.LOTTERY_RESULTS);
    let updateCount = 0;
    const rows = tableData.slice(1);
    rows.forEach(row => {
      if (row.length < 4) return;
      const rawName = row[1]; const raw3Top = row[2]; const raw2Bot = row[3];
      const code = mapLotteryNameToCode(rawName);
      if (!code) return;
      const dateStr = getThaiDateString();
      const prizes = { name: rawName, prize6: raw3Top, prize2: raw2Bot, prize3F: "", prize3B: "" };
      const res = saveSystemResult(systemSheet, code, dateStr, prizes);
      if (res.updated) updateCount++;
    });
    return { success: true, updated: updateCount };
  } catch (e) { return { success: false, error: e.toString() }; }
  finally { lock.releaseLock(); }
}

function parseHtmlTable(html) {
  const tableRegex = /<table[^>]*>(.*?)<\/table>/s; const match = html.match(tableRegex); if (!match) return [];
  const tableContent = match[1]; const trRegex = /<tr[^>]*>(.*?)<\/tr>/gs; const rows = []; let trMatch;
  while ((trMatch = trRegex.exec(tableContent)) !== null) {
    const rowContent = trMatch[1]; const tdRegex = /<td[^>]*>(.*?)<\/td>/gs; const cells = []; let tdMatch;
    while ((tdMatch = tdRegex.exec(rowContent)) !== null) { cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim()); }
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

function mapLotteryNameToCode(name) {
  if (name.includes("นอยพิเศษ")) return "HANOI_SPECIAL";
  if (name.includes("นอยปกติ")) return "HANOI";
  if (name.includes("นอยVIP")) return "HANOI_VIP";
  if (name.includes("ลาว")) return "LAO_DEV";
  if (name.includes("ไทย")) return "TH_GOV";
  return null;
}

function saveSystemResult(sheet, typeId, dateStr, prizes) {
  const data = sheet.getDataRange().getValues(); const headers = data[0];
  const col = { id: headers.indexOf("CODE"), name: headers.indexOf("ชื่อหวย"), date: headers.indexOf("วันที่"), p6: headers.indexOf("รางวัลที่ 1 / 4ตัว"), p2: headers.indexOf("ท้าย2 / 2ล่าง"), update: headers.indexOf("วันที่บันทึกผล") };
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) { if (String(data[i][col.id]) === String(typeId) && String(data[i][col.date]).startsWith(dateStr)) { rowIndex = i + 1; break; } }
  if (rowIndex !== -1) {
    if (prizes.prize6 && /\d/.test(prizes.prize6)) {
      sheet.getRange(rowIndex, col.p6 + 1).setValue(prizes.prize6);
      sheet.getRange(rowIndex, col.p2 + 1).setValue(prizes.prize2);
      sheet.getRange(rowIndex, col.update + 1).setValue(getCurrentTimestamp());
      return { updated: true };
    }
  } else {
    const newRow = new Array(headers.length).fill("");
    newRow[col.id] = typeId; newRow[col.name] = prizes.name; newRow[col.date] = dateStr;
    newRow[col.p6] = prizes.prize6; newRow[col.p2] = prizes.prize2; newRow[col.update] = getCurrentTimestamp();
    sheet.appendRow(newRow);
    return { updated: true };
  }
  return { updated: false };
}
