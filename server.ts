import express from "express";
import path from "path";
import crypto from "crypto";
import fetch from "node-fetch";
import cors from "cors";
import { pool } from "./src/lib/db";

const STARTUP_LOGS: string[] = [];
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = function(...args) {
  STARTUP_LOGS.push(`[INFO] ${args.join(' ')}`);
  originalLog.apply(console, args);
};
console.warn = function(...args) {
  STARTUP_LOGS.push(`[WARN] ${args.join(' ')}`);
  originalWarn.apply(console, args);
};
console.error = function(...args) {
  STARTUP_LOGS.push(`[ERROR] ${args.join(' ')}`);
  originalError.apply(console, args);
};

let dbConnectionFailed = false;

async function initDB() {
  try {
    console.log("[MySQL] Attempting to connect to database...");
    // Try a simple ping first
    const connection = await pool.getConnection();
    connection.release();
    console.log("[MySQL] Connection successful. Ensuring tables exist...");

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        username VARCHAR(255),
        password VARCHAR(255),
        avatar VARCHAR(255),
        balance DECIMAL(15, 2) DEFAULT 0.00,
        streak INT DEFAULT 0,
        role VARCHAR(50) DEFAULT 'user',
        referrer_uid VARCHAR(255),
        is_private_profile TINYINT(1) DEFAULT 0,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trans_id VARCHAR(255) UNIQUE,
        uid VARCHAR(255),
        type VARCHAR(50),
        amount DECIMAL(15, 2),
        description TEXT,
        username VARCHAR(255),
        avatar VARCHAR(255),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS offerwalls (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        api_key VARCHAR(255),
        secret_key VARCHAR(255),
        pub_id VARCHAR(255),
        app_id VARCHAR(255),
        is_active TINYINT(1) DEFAULT 1,
        image_url VARCHAR(255)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(100) PRIMARY KEY,
        data JSON
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(255) UNIQUE,
        reward_amount INT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS redeemed_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255),
        code VARCHAR(255),
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_code (uid, code)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255),
        username VARCHAR(255),
        avatar VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255),
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("[MySQL] Table check complete.");
  } catch (error: any) {
    dbConnectionFailed = true;
    if (error.code === 'ETIMEDOUT' || error.message.includes('ETIMEDOUT')) {
      console.warn("[MySQL] Database connection timed out. Falling back to Demo Mode.");
    } else {
      console.error("[MySQL] Error during initialization:", error.message);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Local MySQL transitions
  console.log("[System] Transitioning to Local MySQL database...");

  // Middleware
  app.use(cors());
  app.use(express.json());

  // --- DATABASE INITIALIZATION (NON-BLOCKING) ---
  initDB();

  // --- PUBLIC POSTBACK ROUTES (MUST BE AT THE TOP) ---
  
  // Diagnostics Route removed or updated for MySQL
  app.get("/api/diagnostics/db", async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({
        status: "Connected to MySQL",
        startupLogs: STARTUP_LOGS
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message, startupLogs: STARTUP_LOGS });
    }
  });

  // Admin Route: Test Offerwall Callback (MySQL version)
  app.get("/api/tester/postback", cors(), async (req, res) => {
    try {
      const { id, userId } = req.query;
      if (!id || !userId) return res.status(400).json({ success: false, error: "Missing identity parameters" });

      const [ows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', [id]);
      if (ows.length === 0) return res.status(404).json({ success: false, error: "Offerwall settings not found." });

      const settings = ows[0];
      const secretKey = settings.secret_key || settings.api_key || "";
      const testAmount = "1000";
      const testTxid = `TEST_${Date.now()}`;
      const baseUrl = "https://findejob.com";
      
      let testUrl = "";
      if (id === 'adlexy' || id === 'admantum') {
        if (id === 'adlexy') {
          testUrl = `${baseUrl}/api/postback.php?source=adlexy&offer_id=${testTxid}&user_id=${userId}&amount=${testAmount}&status=1&api_key=${secretKey}`;
        } else {
          const hash = crypto.createHash("md5").update((userId as string) + testTxid + testAmount + secretKey).digest("hex");
          testUrl = `${baseUrl}/api/postback.php?source=admantum&uid=${userId}&reward=${testAmount}&transid=${testTxid}&key=${hash}`;
        }
      } else if (id === 'gemiad') {
        const hash = crypto.createHash("md5").update(testTxid + userId + testAmount + secretKey).digest("hex");
        testUrl = `${baseUrl}/api/postback.php?source=gemiad&identity_id=${userId}&points=${testAmount}&txid=${testTxid}&result=result&hash=${hash}&campaign_id=test_camp`;
      } else if (id === 'flexwall') {
        const hash = crypto.createHash("md5").update(testTxid + userId + testAmount + secretKey).digest("hex");
        testUrl = `${baseUrl}/api/postback.php?source=flexwall&user_id=${userId}&amount=${testAmount}&TXID=${testTxid}&offer_name=TestOffer&key=${hash}`;
      } else if (id === 'radientwall') {
        const hash = crypto.createHash("md5").update((userId as string) + testTxid + testAmount + secretKey).digest("hex");
        testUrl = `${baseUrl}/api/postback/radientwall?subId=${userId}&transId=${testTxid}&reward=${testAmount}&status=1&signature=${hash}`;
      } else if (id === 'vortexwall' || id === 'mobivortex') {
        const hash = crypto.createHash("sha256").update((userId as string) + "test_camp" + testTxid + secretKey).digest("hex");
        testUrl = `${baseUrl}/api/postback.php?identity_id=${userId}&campaign_id=test_camp&txid=${testTxid}&points=${testAmount}&result=Approved&hash=${hash}`;
      } else {
        testUrl = `${baseUrl}/api/postback.php?userId=${userId}&reward=${testAmount}&transId=${testTxid}&secret=${secretKey}`;
      }

      console.log(`[Tester] Fetching: ${testUrl}`);
      
      let response;
      const fetchOptions: any = {
        headers: {
          'User-Agent': 'AdTester/2.0',
          'Accept': '*/*',
          'Origin': baseUrl
        },
        timeout: 15000
      };

      try {
        response = await (fetch as any)(testUrl, fetchOptions);
      } catch (e: any) {
        const loopbackUrl = testUrl.replace(baseUrl, `http://127.0.0.1:${PORT}`);
        response = await (fetch as any)(loopbackUrl, fetchOptions);
      }
      
      const rawText = await response.text();
      let bodyData = rawText;
      try {
        bodyData = JSON.parse(rawText);
      } catch (e) {}

      return res.status(200).json({
        success: response.ok,
        status: response.status,
        body: bodyData,
        debug: {
          url: testUrl.replace(secretKey, '****'),
          responseLength: rawText.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Helper to find user by ID or UID field in MySQL
  const findUserMySQL = async (userId: string) => {
    const [users]: any = await pool.execute('SELECT * FROM users WHERE uid = ? OR email = ? OR username = ?', [userId, userId, userId]);
    if (users.length === 0) {
      // Special Test Mode bypass for common dashboard test IDs
      const isTestUser = userId === 'QkeOZFVn12gQxTVsz8J7YEizem22' || 
                         userId === '{uid}' || 
                         userId === '{user_id}' ||
                         userId === '[uid]' ||
                         userId === '12345' ||
                         userId.toLowerCase().includes('test');
      
      if (isTestUser) {
        return { testMode: true, userId: 'test_user_id' };
      }
      return { error: 'USER_NOT_FOUND' };
    }
    return { exists: true, data: users[0], userId: users[0].uid };
  };

  // Helper to send postback success response
  const sendSuccess = (res: any, network: string) => {
    if (network === 'adlexy') return res.status(200).json({ success: true });
    if (['admantum', 'flexwall', 'gemiad', 'vortexwall', 'mobivortex'].includes(network)) return res.status(200).send("OK");
    return res.status(200).send("OK");
  };

  // 3. AdBlueMedia Postback Route
  app.get("/api/postback/adbluemedia", async (req, res) => {
    try {
      const { lead_id, s1, payout_cents, status } = req.query;
      if (!lead_id || !s1 || !payout_cents || !status) {
        return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Missing parameters");
      }

      const transId = lead_id as string;
      const userId = s1 as string;
      const rewardNum = parseInt(payout_cents as string, 10);

      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transId]);
      if (existing.length > 0) return res.status(200).header('Content-Type', 'text/plain').send("DUP");

      const userResult = await findUserMySQL(userId);
      if (userResult.error) return res.status(200).send("USER_NOT_FOUND");
      if (userResult.testMode) return sendSuccess(res, "AdBlueMedia");

      const userData = userResult.data;
      const finalReward = status === "1" ? Math.abs(rewardNum) : -Math.abs(rewardNum);

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [finalReward, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, userResult.userId, "offer", finalReward, "AdBlueMedia Offer", userData.username, userData.avatar, status === "1" ? "credited" : "reversed"]
      );

      return res.status(200).header('Content-Type', 'text/plain').send("OK");
    } catch (error) {
      console.error("AdBlueMedia Postback Error:", error);
      return res.status(500).header('Content-Type', 'text/plain').send("ERROR");
    }
  });

  // 4. RadientWall Postback Route
  app.get("/api/postback/radientwall", async (req, res) => {
    try {
      const { subId, transId, reward, signature, status, payout } = req.query;
      if (!subId || !transId || !reward || !signature || !status) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Missing parameters");

      const [owRows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', ['radientwall']);
      if (owRows.length === 0) return res.status(404).header('Content-Type', 'text/plain').send("ERROR: Offerwall not configured");
      const secretKey = owRows[0].secret_key || owRows[0].api_key;
      
      const generatedSignature = crypto.createHash("md5").update((subId as string) + (transId as string) + (reward as string) + secretKey).digest("hex");
      if (generatedSignature !== signature) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Signature doesn't match");

      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transId]);
      if (existing.length > 0) return res.status(200).header('Content-Type', 'text/plain').send("DUP");

      const userResult = await findUserMySQL(subId as string);
      if (userResult.error) return res.status(200).send("USER_NOT_FOUND");
      if (userResult.testMode) return sendSuccess(res, "radientwall");

      const userData = userResult.data;
      const rewardNum = parseFloat(reward as string);
      const finalReward = status === "1" ? Math.abs(rewardNum) : -Math.abs(rewardNum);

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [finalReward, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, userResult.userId, "offer", finalReward, "RadientWall Offer", userData.username, userData.avatar, status === "1" ? "credited" : "reversed"]
      );

      return res.status(200).header('Content-Type', 'text/plain').send("OK");
    } catch (error) {
      console.error("RadientWall Postback Error:", error);
      return res.status(500).header('Content-Type', 'text/plain').send("ERROR");
    }
  });

  // 5. Adlexy Postback Route
  app.get("/api/postback/adlexy", async (req, res) => {
    try {
      const { sub_id, amount, transaction_id, api_key } = req.query;
      if (!sub_id || !amount || !transaction_id || !api_key) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Missing parameters");

      const [owRows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', ['adlexy']);
      if (owRows.length === 0) return res.status(404).header('Content-Type', 'text/plain').send("ERROR: Offerwall not configured");
      const validKey = owRows[0].secret_key || owRows[0].api_key;

      if (api_key !== validKey) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Invalid API Key");

      const transId = transaction_id as string;
      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transId]);
      if (existing.length > 0) return res.status(200).json({ success: true });

      const userResult = await findUserMySQL(sub_id as string);
      if (userResult.error) return res.status(200).json({ success: false, error: "USER_NOT_FOUND" });
      if (userResult.testMode) return res.status(200).json({ success: true });

      const userData = userResult.data;
      const rewardNum = parseFloat(amount as string);

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [rewardNum, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, userResult.userId, "offer", rewardNum, "Adlexy Task", userData.username, userData.avatar, "credited"]
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Adlexy Postback Error:", error);
      return res.status(500).header('Content-Type', 'text/plain').send("ERROR");
    }
  });

  // 5.5 Admantum Postback Route (MySQL)
  app.get("/api/postback/admantum", cors(), async (req, res) => {
    try {
      const { uid, reward, transid, key } = req.query;

      if (!uid || !reward || !transid || !key) {
        return res.status(200).header('Content-Type', 'text/plain').send("NOT OK");
      }

      const userId = uid as string;
      const transactionId = transid as string;
      const rewardAmount = reward as string;
      const hash = key as string;

      const [owRows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', ['admantum']);
      if (owRows.length === 0) return res.status(200).header('Content-Type', 'text/plain').send("NOT OK");
      const secretKey = owRows[0].secret_key || owRows[0].api_key;

      if (!secretKey) return res.status(200).header('Content-Type', 'text/plain').send("NOT OK");

      const generatedHash = crypto
        .createHash("md5")
        .update(userId + transactionId + rewardAmount + secretKey)
        .digest("hex");

      if (generatedHash !== hash) {
        return res.status(200).header('Content-Type', 'text/plain').send("HASH_MISMATCH");
      }

      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transactionId]);
      if (existing.length > 0) return res.status(200).header('Content-Type', 'text/plain').send("OK");

      const userResult = await findUserMySQL(userId);
      if (userResult.error) return res.status(200).header('Content-Type', 'text/plain').send("USER_NOT_FOUND");
      if (userResult.testMode) return res.status(200).header('Content-Type', 'text/plain').send("OK");

      const userData = userResult.data;
      const rewardNum = parseFloat(rewardAmount);

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [rewardNum, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transactionId, userResult.userId, "offer", rewardNum, "Admantum Offer", userData.username, userData.avatar, "credited"]
      );

      return res.status(200).header('Content-Type', 'text/plain').send("OK");
    } catch (error) {
      console.error("Admantum Postback Error:", error);
      return res.status(200).header('Content-Type', 'text/plain').send("NOT OK");
    }
  });

  // 5.6 Gemiad (GemiWall) Postback Route (MySQL)
  app.get("/api/postback/gemiad", async (req, res) => {
    try {
      const userId = (req.query.userid || req.query.identity_id) as string;
      const amount = (req.query.amount || req.query.points) as string;
      const transId = (req.query.txn_id || req.query.txid) as string;
      const resultStatus = (req.query.status || req.query.result || req.query.Result) as string;
      const key = (req.query.key || req.query.hash) as string;
      const campaignId = req.query.campaign_id as string || "";
      
      if (!userId || !amount || !transId || !key) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Missing parameters");

      const [owRows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', ['gemiad']);
      if (owRows.length === 0) return res.status(404).header('Content-Type', 'text/plain').send("ERROR: Offerwall not configured");
      const secretKey = owRows[0].secret_key || owRows[0].api_key;

      if (!secretKey) return res.status(500).header('Content-Type', 'text/plain').send("ERROR: Secret key missing");

      const md5Hash = crypto.createHash("md5").update(transId + userId + amount + secretKey).digest("hex");
      const sha256Hash = crypto.createHash("sha256").update(userId + campaignId + transId + secretKey).digest("hex");

      const isMd5Valid = md5Hash === key;
      const isSha256Valid = sha256Hash === key;

      if (!isMd5Valid && !isSha256Valid) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Invalid Hash");

      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transId]);
      if (existing.length > 0) return res.status(200).header('Content-Type', 'text/plain').send(isSha256Valid ? "Approved" : "OK");

      const userResult = await findUserMySQL(userId);
      if (userResult.error) return res.status(404).header('Content-Type', 'text/plain').send("ERROR: User not found");
      if (userResult.testMode) return res.status(200).header('Content-Type', 'text/plain').send(isSha256Valid ? "Approved" : "OK");

      const userData = userResult.data;
      const rewardNum = parseFloat(amount);
      const isSuccess = resultStatus === "1" || resultStatus === "approved" || resultStatus === "success" || resultStatus === "result";
      const finalReward = isSuccess ? Math.abs(rewardNum) : -Math.abs(rewardNum);

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [finalReward, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, userResult.userId, "offer", finalReward, (req.query.campaign_name as string) || "Gemiad Task", userData.username, userData.avatar, isSuccess ? "credited" : "reversed"]
      );

      return res.status(200).header('Content-Type', 'text/plain').send(isSha256Valid ? "Approved" : "OK");
    } catch (error) {
      console.error("Gemiad Postback Error:", error);
      return res.status(500).header('Content-Type', 'text/plain').send("ERROR");
    }
  });

  // 5.7 Flexwall Postback Route (MySQL)
  app.get("/api/postback/flexwall", async (req, res) => {
    try {
      const { user_id, amount, TXID, key, offer_name } = req.query;
      if (!user_id || !amount || !TXID) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Missing parameters");

      const [owRows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', ['flexwall']);
      if (owRows.length === 0) return res.status(404).header('Content-Type', 'text/plain').send("ERROR: Offerwall not configured");
      const secretKey = owRows[0].secret_key || owRows[0].api_key;
      
      if (key && secretKey) {
        const generatedHash = crypto.createHash("md5").update((TXID as string) + (user_id as string) + (amount as string) + secretKey).digest("hex");
        if (generatedHash !== key) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Invalid Hash");
      }

      const transId = TXID as string;
      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transId]);
      if (existing.length > 0) return res.status(200).header('Content-Type', 'text/plain').send("OK");

      const userResult = await findUserMySQL(user_id as string);
      if (userResult.error) return res.status(404).header('Content-Type', 'text/plain').send("ERROR: User not found");
      if (userResult.testMode) return res.status(200).header('Content-Type', 'text/plain').send("OK");

      const userData = userResult.data;
      const rewardNum = parseFloat(amount as string);

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [rewardNum, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, userResult.userId, "offer", rewardNum, (offer_name as string) || "Flexwall Task", userData.username, userData.avatar, "credited"]
      );

      return res.status(200).header('Content-Type', 'text/plain').send("OK");
    } catch (error) {
      console.error("Flexwall Postback Error:", error);
      return res.status(500).header('Content-Type', 'text/plain').send("ERROR");
    }
  });

  // VortexWall/MobiVortex Postback Route (MySQL)
  app.get(["/api/postback/vortexwall", "/api/postback/mobivortex"], async (req, res) => {
    try {
      const { identity_id, campaign_id, txid, hash, points, result, campaign_name } = req.query;
      if (!identity_id || !campaign_id || !txid || !hash) return res.status(400).send("Missing parameters");

      const networkDocId = req.path.includes('mobivortex') ? 'mobivortex' : 'vortexwall';
      const [owRows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', [networkDocId]);
      if (owRows.length === 0) return res.status(404).send("Offerwall not configured");
      const secretKey = owRows[0].secret_key || owRows[0].api_key;

      if (!secretKey) return res.status(500).send("Secret key missing");

      const generatedHash = crypto.createHash("sha256").update((identity_id as string) + (campaign_id as string) + (txid as string) + secretKey).digest("hex");
      if (generatedHash !== hash) return res.status(400).send("Unauthorized");

      const transId = txid as string;
      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transId]);
      if (existing.length > 0) return res.status(200).send("Approved");

      const userResult = await findUserMySQL(identity_id as string);
      if (userResult.error) return res.status(404).send("User not found");
      if (userResult.testMode) return res.status(200).send("Approved");

      const userData = userResult.data;
      const rewardNum = parseFloat(points as string || "0");
      const isReversal = result === 'rejected';
      const finalReward = isReversal ? -Math.abs(rewardNum) : Math.abs(rewardNum);

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [finalReward, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, userResult.userId, "offer", finalReward, (campaign_name as string) || "VortexWall Task", userData.username, userData.avatar, isReversal ? "reversed" : "credited"]
      );

      return res.status(200).send("Approved");
    } catch (error) {
      console.error("VortexWall Postback Error:", error);
      return res.status(500).send("Internal server error");
    }
  });

  // 6. Generic Postback Route (MySQL)
  app.get("/api/postback/:network", async (req, res) => {
    try {
      const { network } = req.params;
      const userId = (req.query.userId || req.query.user_id || req.query.user || req.query.uid || req.query.subId || req.query.s1) as string;
      const reward = (req.query.reward || req.query.amount || req.query.currency || req.query.payout || req.query.user_amount) as string;
      const transId = (req.query.transId || req.query.txn_id || req.query.transaction_id || req.query.transaction || req.query.lead_id || req.query.id) as string;
      const secret = (req.query.secret || req.query.key || req.query.password || req.query.hash || req.query.sig || req.query.signature) as string;
      const status = (req.query.status || req.query.state) as string;

      if (!userId || !reward) return res.status(400).header('Content-Type', 'text/plain').send("ERROR: Missing parameters");

      const [owRows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', [network.toLowerCase()]);
      if (owRows.length === 0) return res.status(404).header('Content-Type', 'text/plain').send("ERROR: Offerwall not configured");

      const config = owRows[0];
      const validSecret = config.secret_key || config.api_key;
      if (validSecret && validSecret.trim() !== '') {
        if (!secret || secret !== validSecret) return res.status(401).header('Content-Type', 'text/plain').send("ERROR: Invalid secret");
      }

      const transactionId = transId || `gen_${network}_${Date.now()}`;
      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transactionId]);
      if (existing.length > 0) return res.status(200).header('Content-Type', 'text/plain').send("DUP");

      const userResult = await findUserMySQL(userId);
      if (userResult.error) return res.status(200).header('Content-Type', 'text/plain').send("USER_NOT_FOUND");
      if (userResult.testMode) return res.status(200).header('Content-Type', 'text/plain').send("OK");

      const userData = userResult.data;
      const rewardNum = parseFloat(reward);
      const isChargeback = status === "reversed" || status === "chargeback" || status === "0" || status === "rejected";
      const finalReward = isChargeback ? -Math.abs(rewardNum) : Math.abs(rewardNum);

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [finalReward, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transactionId, userResult.userId, "offer", finalReward, `${network.toUpperCase()} Offer`, userData.username, userData.avatar, finalReward >= 0 ? "credited" : "reversed"]
      );

      return res.status(200).header('Content-Type', 'text/plain').send("OK");
    } catch (error) {
      console.error(`Postback Error (${req.params.network}):`, error);
      return res.status(500).header('Content-Type', 'text/plain').send("ERROR");
    }
  });

  // 7. Universal Postback Route (MySQL)
  app.all(["/api/postback", "/api/postback.php", "/api/postback/:source"], cors(), async (req, res) => {
    const params = { ...req.query, ...req.body, ...req.params };
    try {
      const sourceRaw = (params.vendor || params.source || (params.offer_id ? 'adlexy' : 'generic')) as string;
      const source = sourceRaw.toLowerCase().replace(".php", "");
      
      let userId = (params.userId || params.user_id || params.userid || params.user || params.uid || params.subId || params.s1 || params.sub_id || params.identity_id) as string;
      let reward = (params.reward || params.amount || params.currency || params.payout || params.user_amount || params.virtual_currency || params.points) as string;
      const transId = (params.transId || params.txn_id || params.transaction_id || params.transaction || params.lead_id || params.txid || params.id || params.offer_id || params.of_id) as string;
      const secret = (params.secret || params.key || params.password || params.hash || params.sig || params.signature || params.api_key) as string;
      const status = (params.status || params.state || "1") as string;
      const offerId = (params.of_id || params.offer_id) as string;

      if (!userId || !reward) return res.status(200).json({ success: false, error: "Missing parameters" });

      const [owRows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', [source]);
      if (owRows.length > 0) {
        const config = owRows[0];
        const validSecret = config.secret_key || config.api_key;
        if (source === 'admantum') {
          if (validSecret && secret) {
            const expectedHash = crypto.createHash("md5").update(userId + offerId + reward + validSecret).digest("hex");
            if (secret.toLowerCase() !== expectedHash.toLowerCase()) return res.status(200).json({ success: false, error: "Invalid hash" });
          }
        } else if (validSecret && validSecret.trim() !== '') {
          if (!secret || secret !== validSecret) return res.status(200).json({ success: false, error: "Invalid secret" });
        }
      }

      const transactionId = transId || `univ_${source}_${Date.now()}`;
      const [existing]: any = await pool.execute('SELECT id FROM transactions WHERE trans_id = ?', [transactionId]);
      if (existing.length > 0) return res.status(200).json({ success: true, message: "Duplicate" });

      const userResult = await findUserMySQL(userId);
      if (userResult.error || userResult.testMode) return res.status(200).json({ success: true });

      const userData = userResult.data;
      const rewardNum = parseFloat(reward);
      const isChargeback = status === "reversed" || status === "chargeback" || status === "0" || status === "rejected" || status === "charge";
      const isSuccess = status === "1" || status === "approved" || status === "completed" || !status;
      
      if (!isSuccess && !isChargeback) return res.status(200).json({ success: true, message: "Bypassed" });

      const finalReward = isChargeback ? -Math.abs(rewardNum) : Math.abs(rewardNum);
      
      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [finalReward, userResult.userId]);
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transactionId, userResult.userId, "offer", finalReward, `${source.toUpperCase()} Offer`, userData.username, userData.avatar, finalReward >= 0 ? "credited" : "reversed"]
      );

      return res.status(200).json({ success: true, message: "OK" });
    } catch (error: any) {
      console.error(`Universal Postback Error:`, error);
      return res.status(200).json({ success: false, error: error.message });
    }
  });

  // --- END PUBLIC POSTBACK ROUTES ---

  // --- END PUBLIC POSTBACK ROUTES ---

  // --- CORE APP API ROUTES ---

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Get Site Settings (MySQL)
  app.get("/api/get_settings", async (req, res) => {
    console.log("[API] Hit /api/get_settings");
    if (dbConnectionFailed) {
      return res.json({
        status: "success",
        settings: {
          siteName: "findejob.com",
          heroText: "Earn money for every task you complete online. (Demo Mode)",
          heroBtnText: "Start Earning Now",
          heroBtnColor: "#10b981",
        },
        note: "Offline mode"
      });
    }
    try {
      const [rows]: any = await pool.execute('SELECT data FROM site_settings WHERE id = ?', ['global']);
      
      let settings: any = {};
      if (rows && rows.length > 0) {
        settings = rows[0].data;
      }

      const defaultSettings = {
        siteName: "findejob.com",
        heroText: "Earn money for every task you complete online.",
        heroBtnText: "Start Earning Now",
        heroBtnColor: "#10b981",
        ...settings
      };

      res.json({ status: "success", settings: defaultSettings });
    } catch (error: any) {
      dbConnectionFailed = true;
      console.warn("[API] get_settings error, using defaults:", error.message);
      const defaultSettings = {
        siteName: "findejob.com",
        heroText: "Earn money for every task you complete online. (Demo Mode)",
        heroBtnText: "Start Earning Now",
        heroBtnColor: "#10b981",
      };
      res.json({ status: "success", settings: defaultSettings, note: "Offline mode" });
    }
  });

  // Get Offerwalls
  app.get("/api/get_offerwalls", async (req, res) => {
    if (dbConnectionFailed) {
      return res.json({
        status: "success",
        offerwalls: [
          { id: 'adbluemedia', name: 'AdBlueMedia', is_active: 1, logoUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-offerwall-1-1175027.png' },
          { id: 'upwall', name: 'UPWALL', is_active: 1, logoUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-offerwall-1-1175027.png' }
        ],
        note: "Offline mode"
      });
    }
    try {
      const id = req.query.id as string;
      
      if (id) {
        const [rows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', [id]);
        if (rows && rows.length > 0) {
          res.json({ status: "success", config: { id: rows[0].id.toString(), ...rows[0] } });
        } else {
          res.status(404).json({ status: "error", message: "Offerwall not found" });
        }
      } else {
        const [offerwalls]: any = await pool.execute('SELECT * FROM offerwalls WHERE is_active = 1');
        const formatted = (offerwalls || []).map((ow: any) => ({
          ...ow,
          id: ow.id.toString(),
          logoUrl: ow.image_imageUrl || ow.image_url
        }));
        res.json({ status: "success", offerwalls: formatted });
      }
    } catch (error: any) {
      dbConnectionFailed = true;
      console.warn("[API] get_offerwalls error:", error.message);
      // Fallback for demo
      const demoOfferwalls = [
        { id: 'adbluemedia', name: 'AdBlueMedia', is_active: 1, logoUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-offerwall-1-1175027.png' },
        { id: 'upwall', name: 'UPWALL', is_active: 1, logoUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-offerwall-1-1175027.png' }
      ];
      res.json({ status: "success", offerwalls: demoOfferwalls, note: "Offline mode" });
    }
  });

  // Get User Data (Balance, History, Live Feed)
  app.get("/api/get_user_data", async (req, res) => {
    if (dbConnectionFailed) {
      return res.json({
        status: "error",
        message: "Offline mode",
        balance: 0,
        username: "Guest",
        role: "user",
        history: [],
        global_transactions: [],
        note: "Database unreachable"
      });
    }
    try {
      const uid = req.query.uid as string;
      if (!uid) return res.status(400).json({ status: "error", message: "Missing UID" });

      let userData: any = { balance: 0, username: "Guest", role: "user" };
      let history: any[] = [];
      let global_transactions: any[] = [];

      try {
        const [users]: any = await pool.execute('SELECT * FROM users WHERE uid = ?', [uid]);
        
        if (users && users.length === 0) {
          // Auto-create user if doesn't exist (Guest mode)
          const guestEmail = `guest_${uid}@findejob.com`;
          try {
            await pool.execute(
              'INSERT IGNORE INTO users (uid, email, password, username, balance, streak, role) VALUES (?, ?, ?, ?, 0, 0, "user")', 
              [uid, guestEmail, '', `Guest_${uid.substring(0, 5)}`]
            );
          } catch (e) {
            console.error("Race condition on insert", e);
          }
          
          // Fetch again after insert to ensure we have the DB generated values
          const [usersRefetched]: any = await pool.execute('SELECT * FROM users WHERE uid = ?', [uid]);
          if (usersRefetched && usersRefetched.length > 0) {
            userData = usersRefetched[0];
          } else {
            userData = { balance: 0, username: `Guest_${uid.substring(0, 5)}`, role: 'user', is_private: 0 };
          }
        } else if (users) {
          userData = users[0];
        }

        // User Transactions (History)
        const [historyRows]: any = await pool.execute(
          'SELECT * FROM transactions WHERE uid = ? ORDER BY created_at DESC LIMIT 20', 
          [uid]
        );
        
        if (historyRows) {
          history = historyRows.map((row: any) => ({
            id: row.id.toString(),
            transId: row.trans_id,
            reward: row.reward || row.amount,
            status: row.status,
            type: row.type,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
          }));
        }

        // Global activity
        const [globalRows]: any = await pool.execute(
          'SELECT t.*, u.username, u.avatar FROM transactions t LEFT JOIN users u ON t.uid = u.uid WHERE t.status = "credited" ORDER BY t.created_at DESC LIMIT 15'
        );

        if (globalRows) {
          global_transactions = globalRows.map((row: any) => ({
            id: row.id.toString(),
            username: row.username || 'User',
            userAvatar: row.avatar || null,
            reward: row.reward || row.amount,
            offerName: row.description || row.name || `${row.offerwall || 'Offer'} completion`,
            type: row.type || 'offer',
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
          }));
        }
      } catch (dbError: any) {
        console.warn("[API] get_user_data DB failure, using defaults:", dbError.message);
      }

      res.json({
        status: "success",
        balance: Number(userData.balance) || 0,
        username: userData.username || userData.displayName || "User",
        avatar: userData.avatar || null,
        role: userData.role || "user",
        isPrivate: !!userData.is_private,
        user_transactions: history,
        history: history,
        global_transactions: global_transactions
      });
    } catch (error: any) {
      console.warn("[API] get_user_data fatal error:", error.message);
      res.json({ 
        status: "error", 
        message: error.message,
        balance: 0,
        username: "Guest",
        role: "user",
        history: [],
        global_transactions: [],
        note: "Database unreachable"
      });
    }
  });

  // Claim Daily Bonus
  app.get("/api/daily_bonus", async (req, res) => {
    try {
      const uid = req.query.uid as string;
      if (!uid) return res.status(400).json({ status: "error", message: "Missing UID" });

      const [users]: any = await pool.execute('SELECT * FROM users WHERE uid = ?', [uid]);
      if (users.length === 0) return res.status(404).json({ status: "error", message: "User not found" });

      const user = users[0];
      const amount = 50;

      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [amount, uid]);
      
      await pool.execute(
        'INSERT INTO transactions (uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uid, 'daily_bonus', amount, 'Daily Bonus', user.username, user.avatar, 'credited']
      );

      res.json({ status: "success", amount, balance: Number(user.balance) + amount });
    } catch (error: any) {
      console.warn("[API] daily_bonus error:", error.message);
      res.json({ status: "error", message: "Database connection failed" });
    }
  });

  // Auth: Signup
  app.post("/api/signup", async (req, res) => {
    if (dbConnectionFailed) {
      return res.status(503).json({ status: "error", message: "Database temporarily unavailable. Account creation is disabled in Offline Mode." });
    }
    try {
      const { email, password, username } = req.body;
      if (!email || !password || !username) return res.status(400).json({ status: "error", message: "Missing fields" });

      const uid = "USER_" + crypto.randomBytes(4).toString('hex').toUpperCase() + Date.now().toString().slice(-4);
      const emailLower = email.toLowerCase();

      const [existingUsers]: any = await pool.execute('SELECT id FROM users WHERE email = ?', [emailLower]);
      if (existingUsers.length > 0) return res.status(400).json({ status: "error", message: "User already exists" });

      await pool.execute(
        'INSERT INTO users (uid, email, password, username, balance, streak, role) VALUES (?, ?, ?, ?, 0, 0, "user")', 
        [uid, emailLower, password, username]
      );

      const userData = {
        uid,
        email: emailLower,
        displayName: username,
        balance: 0,
        streak: 0,
        role: "user"
      };

      res.json({ status: "success", user: userData });
    } catch (error: any) {
      console.warn("[API] signup error:", error.message);
      res.json({ status: "error", message: "Signup failed: " + error.message });
    }
  });

  // Auth: Login
  app.post("/api/login", async (req, res) => {
    if (dbConnectionFailed) {
      return res.status(503).json({ status: "error", message: "Database temporarily unavailable. Login is disabled in Offline Mode." });
    }
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) return res.status(400).json({ status: "error", message: "Missing credentials" });

      const identLower = identifier.toLowerCase();
      
      const [users]: any = await pool.execute(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [identLower, identLower]
      );

      if (users.length === 0) return res.status(404).json({ status: "error", message: "User not found" });
      const user = users[0];

      // Plaintext check for demo (should match PHP signup)
      if (user.password !== password) {
        return res.status(401).json({ status: "error", message: "Invalid credentials" });
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.username,
        photoURL: user.avatar,
        balance: Number(user.balance) || 0,
        streak: user.streak || 0,
        role: user.role,
        isPrivateProfile: !!user.is_private
      };
      
      // Update lastLogin
      try {
        await pool.execute('UPDATE users SET lastLogin = NOW() WHERE uid = ?', [user.uid]);
      } catch (e) {}

      res.json({ status: "success", user: userData });
    } catch (error: any) {
      console.warn("[API] login error:", error.message);
      res.json({ status: "error", message: "Login failed: " + error.message });
    }
  });

  // Support: Submit Ticket (MySQL)
  app.post("/api/submit_support", async (req, res) => {
    try {
      const { uid, name, email, subject, message } = req.body;
      await pool.execute(
        'INSERT INTO support_tickets (uid, name, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
        [uid || 'guest', name, email, subject, message, 'open']
      );
      res.json({ status: "success", message: "Ticket submitted" });
    } catch (error: any) {
      console.warn("[API] submit_support error:", error.message);
      res.json({ status: "error", message: "Database failure" });
    }
  });

  // Chat: Send Message & Get History (MySQL)
  app.route("/api/chat")
    .get(async (req, res) => {
      try {
        const [messages]: any = await pool.execute('SELECT * FROM chat_messages ORDER BY created_at ASC LIMIT 50');
        res.json({ 
          status: "success", 
          messages: (messages || []).map((m: any) => ({
            id: m.id.toString(),
            ...m,
            timestamp: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString()
          }))
        });
      } catch (error: any) {
        console.warn("[API] get chat history DB failure:", error.message);
        res.json({ status: "success", messages: [], note: "Offline mode" });
      }
    })
    .post(async (req, res) => {
      try {
        const { userId, message } = req.body;
        const [users]: any = await pool.execute('SELECT * FROM users WHERE uid = ?', [userId]);
        const user = users[0] || {};
        
        await pool.execute(
          'INSERT INTO chat_messages (uid, username, avatar, message) VALUES (?, ?, ?, ?)',
          [userId, user.username || "User", user.avatar || null, message]
        );
        res.json({ status: "success" });
      } catch (error: any) {
        console.warn("[API] post chat error:", error.message);
        res.json({ status: "error", message: "Chat database failure" });
      }
    });

  // Referrals (MySQL)
  app.get("/api/get_referrals", async (req, res) => {
    try {
      const uid = req.query.uid as string;
      const [referrals]: any = await pool.execute('SELECT * FROM users WHERE referrer_uid = ?', [uid]);
      res.json({ 
        status: "success", 
        referrals: (referrals || []).map((r: any) => ({
          id: r.uid,
          username: r.username || "User",
          date: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          status: "Active",
          earned: 0
        }))
      });
    } catch (error: any) {
      console.warn("[API] get_referrals DB failure:", error.message);
      res.json({ status: "success", referrals: [], note: "Offline mode" });
    }
  });

  // Redeem Promo (MySQL)
  app.post("/api/redeem_promo", async (req, res) => {
    try {
      const { uid, code } = req.body;
      if (!uid || !code) return res.status(400).json({ status: "error", message: "Missing params" });

      const promoId = code.toUpperCase();
      const [promos]: any = await pool.execute('SELECT * FROM promo_codes WHERE code = ? AND is_active = 1', [promoId]);

      if (promos.length === 0) {
        return res.json({ status: "error", message: "Invalid or inactive promo code" });
      }

      const promo = promos[0];
      const [existing]: any = await pool.execute('SELECT * FROM redeemed_codes WHERE uid = ? AND code = ?', [uid, promoId]);

      if (existing.length > 0) {
        return res.json({ status: "error", message: "Code already redeemed" });
      }

      const rewardAmount = promo.reward_amount || 0;
      const [users]: any = await pool.execute('SELECT * FROM users WHERE uid = ?', [uid]);
      if (users.length === 0) return res.status(404).json({ status: "error", message: "User not found" });

      const user = users[0];

      await pool.execute('INSERT INTO redeemed_codes (uid, code) VALUES (?, ?)', [uid, promoId]);
      await pool.execute('UPDATE users SET balance = balance + ? WHERE uid = ?', [rewardAmount, uid]);
      
      const transId = `promo_${promoId}_${Date.now()}`;
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, uid, 'reward', rewardAmount, `Promo: ${promoId}`, user.username, user.avatar || null, 'credited']
      );

      res.json({ status: "success", reward: rewardAmount, balance: Number(user.balance) + rewardAmount });
    } catch (error: any) {
      console.warn("[API] redeem_promo error:", error.message);
      res.json({ status: "error", message: "Promo database failure" });
    }
  });

  // Update Profile (MySQL)
  app.post("/api/update_profile", async (req, res) => {
      try {
          const { uid, isPrivate } = req.body;
          if (!uid) return res.status(400).json({ status: "error", message: "UID required" });

          await pool.execute('UPDATE users SET is_private_profile = ? WHERE uid = ?', [isPrivate ? 1 : 0, uid]);
          res.json({ status: "success", message: "Profile updated" });
      } catch (error: any) {
          console.warn("[API] update_profile error:", error.message);
          res.json({ status: "error", message: "Database connection failed" });
      }
  });



  // Leaderboard (MySQL)
  app.get("/api/get_leaderboard", async (req, res) => {
    if (dbConnectionFailed) {
      return res.json({ status: "success", leaderboard: [], note: "Offline mode" });
    }
    try {
      const [leaderboard]: any = await pool.execute('SELECT uid, username, avatar, balance FROM users ORDER BY balance DESC LIMIT 50');
      res.json({ 
        status: "success", 
        leaderboard: (leaderboard || []).map((user: any, index: number) => ({
          rank: index + 1,
          uid: user.uid,
          username: user.username || "User",
          avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username || 'User'}`,
          balance: Number(user.balance) || 0
        }))
      });
    } catch (error: any) {
      console.warn("[API] get_leaderboard DB failure:", error.message);
      res.json({ status: "success", leaderboard: [], note: "Offline mode" });
    }
  });

  // Live Activity Feed
  app.get("/api/get_live_activity", async (req, res) => {
    if (dbConnectionFailed) {
      return res.json({
        status: "success",
        activities: [
          { id: '1', username: 'DemoUser', reward: 500, offerName: 'Demo Offer', type: 'offer', createdAt: new Date().toISOString() }
        ],
        note: "Offline mode"
      });
    }
    try {
      let activities = [];
      try {
        const [globalRows]: any = await pool.execute(
          'SELECT t.*, u.username, u.avatar FROM transactions t LEFT JOIN users u ON t.uid = u.uid WHERE t.status = "credited" ORDER BY t.created_at DESC LIMIT 20'
        );

        if (globalRows) {
          activities = globalRows.map((row: any) => ({
            id: row.id.toString(),
            username: row.username || 'User',
            userAvatar: row.avatar || null,
            reward: row.amount || row.reward,
            offerName: row.description || row.name || 'Offer completion',
            type: row.type || 'offer',
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
          }));
        }
      } catch (dbError: any) {
        console.warn("[API] get_live_activity DB failure:", dbError.message);
        // Demo data
        activities = [
          { id: '1', username: 'DemoUser', reward: 500, offerName: 'Demo Offer', type: 'offer', createdAt: new Date().toISOString() }
        ];
      }

      res.json({ status: "success", activities });
    } catch (error: any) {
      res.status(200).json({ status: "success", activities: [], note: "Error but safe" });
    }
  });

  // Admin: Update Settings (MySQL)
  app.post("/api/admin_update_settings", async (req, res) => {
    try {
      const { settings } = req.body;
      if (!settings) return res.status(400).json({ status: "error", message: "Missing settings" });

      await pool.execute('REPLACE INTO site_settings (id, data) VALUES (?, ?)', ['global', JSON.stringify(settings)]);
      res.json({ status: "success", message: "Settings updated successfully" });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin: Get Offerwalls (MySQL)
  app.get("/api/admin_get_offerwalls", async (req, res) => {
    try {
      const [configs]: any = await pool.execute('SELECT * FROM offerwalls');
      res.json({ status: "success", configs });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin: Update Offerwall (MySQL)
  app.post("/api/admin_update_offerwall", async (req, res) => {
    try {
      const config = req.body;
      const { id } = config;
      if (!id) return res.status(400).json({ status: "error", message: "Missing ID" });

      // We handle dynamic updates by converting config to SQL
      const fields = Object.keys(config).filter(k => k !== 'id');
      const sets = fields.map(f => `${f.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)} = ?`).join(', ');
      const values = fields.map(f => config[f]);
      
      if (fields.length > 0) {
        await pool.execute(`UPDATE offerwalls SET ${sets} WHERE id = ?`, [...values, id]);
      }
      
      res.json({ status: "success", message: "Offerwall updated successfully" });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin: Get Users (MySQL)
  app.get("/api/admin_get_users", async (req, res) => {
    try {
      const [users]: any = await pool.execute('SELECT * FROM users ORDER BY created_at DESC LIMIT 100');
      res.json({ 
        status: "success", 
        users: users.map((u: any) => ({
          ...u,
          createdAt: u.created_at ? new Date(u.created_at).toISOString() : null
        }))
      });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin: Update User (MySQL)
  app.post("/api/admin_update_user", async (req, res) => {
    try {
      const { uid, updates } = req.body;
      if (!uid) return res.status(400).json({ status: "error", message: "Missing UID" });

      const fields = Object.keys(updates);
      const sets = fields.map(f => `${f.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`)} = ?`).join(', ');
      const values = fields.map(f => updates[f]);

      if (fields.length > 0) {
        await pool.execute(`UPDATE users SET ${sets} WHERE uid = ?`, [...values, uid]);
      }

      res.json({ status: "success", message: "User updated successfully" });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin: Get Withdrawals (MySQL)
  app.get("/api/admin_get_withdrawals", async (req, res) => {
    try {
      const filter = req.query.filter as string;
      let query = 'SELECT * FROM transactions WHERE type = "withdrawal"';
      let params = [];
      
      if (filter && filter !== "all") {
        query += ' AND status = ?';
        params.push(filter);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [withdrawals]: any = await pool.execute(query, params);
      res.json({ 
        status: "success", 
        withdrawals: withdrawals.map((w: any) => ({
          ...w,
          id: w.id.toString(),
          time: w.created_at ? new Date(w.created_at).toLocaleString() : ''
        }))
      });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin: User Audit
  // Admin: User Audit (MySQL)
  app.get("/api/admin_user_audit", async (req, res) => {
    try {
      const uid = req.query.uid as string;
      if (!uid) return res.status(400).json({ status: "error", message: "Missing UID" });

      const [users]: any = await pool.execute('SELECT * FROM users WHERE uid = ?', [uid]);
      if (users.length === 0) return res.status(404).json({ status: "error", message: "User not found" });
      
      const [history]: any = await pool.execute('SELECT * FROM transactions WHERE uid = ? ORDER BY created_at DESC LIMIT 50', [uid]);
      
      res.json({
        status: "success",
        user: users[0],
        history: history.map((h: any) => ({
            id: h.id.toString(),
            ...h,
            time: h.created_at ? new Date(h.created_at).toLocaleString() : ''
        }))
      });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin: Update Transaction (MySQL)
  app.post("/api/admin_update_transaction", async (req, res) => {
    try {
      const { id, status } = req.body;
      if (!id) return res.status(400).json({ status: "error", message: "Missing ID" });

      await pool.execute('UPDATE transactions SET status = ? WHERE id = ?', [status, id]);
      res.json({ status: "success", message: "Transaction updated" });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin: Promo Codes (MySQL)
  app.route("/api/admin_promo_codes")
    .get(async (req, res) => {
      try {
        const [promoCodes]: any = await pool.execute('SELECT * FROM promo_codes');
        res.json({ status: "success", promoCodes });
      } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
      }
    })
    .post(async (req, res) => {
      try {
        const { action, id, code, rewardAmount, isActive } = req.body;
        if (action === "create") {
          const promoId = code.toUpperCase();
          await pool.execute(
            'INSERT INTO promo_codes (code, reward_amount, is_active) VALUES (?, ?, ?)',
            [promoId, parseInt(rewardAmount, 10), 1]
          );
          res.json({ status: "success", message: "Promo code created" });
        } else if (action === "toggle") {
          await pool.execute('UPDATE promo_codes SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
          res.json({ status: "success", message: "Promo code updated" });
        } else {
          res.status(400).json({ status: "error", message: "Invalid action" });
        }
      } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
      }
    })
    .delete(async (req, res) => {
      try {
        const id = req.query.id as string;
        if (!id) return res.status(400).json({ status: "error", message: "Missing ID" });
        await pool.execute('DELETE FROM promo_codes WHERE id = ?', [id]);
        res.json({ status: "success", message: "Promo code deleted" });
      } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
      }
    });

  // Admin: Stats (MySQL)
  app.get("/api/admin_stats", async (req, res) => {
    if (dbConnectionFailed) {
      return res.json({
        status: "success",
        stats: { totalUsers: 0, totalEarnings: 0, pendingWithdrawals: 0, activeOffers: 0 },
        note: "Offline mode"
      });
    }
    try {
      const [uRows]: any = await pool.execute('SELECT COUNT(*) as count FROM users');
      const [tRows]: any = await pool.execute('SELECT SUM(amount) as total FROM transactions WHERE amount > 0');
      const [wRows]: any = await pool.execute('SELECT COUNT(*) as count FROM transactions WHERE type = "withdrawal" AND status = "pending"');
      const [oRows]: any = await pool.execute('SELECT COUNT(*) as count FROM offerwalls WHERE is_active = 1');
      
      res.json({
        status: "success",
        stats: {
            totalUsers: uRows[0].count,
            totalEarnings: tRows[0].total || 0,
            pendingWithdrawals: wRows[0].count,
            activeOffers: oRows[0].count
        }
      });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // User: Withdraw
  app.post("/api/withdraw", async (req, res) => {
    if (dbConnectionFailed) {
      return res.status(503).json({ status: "error", message: "Database temporarily unavailable" });
    }
    try {
      const { uid, amount, method, address } = req.body;
      if (!uid || !amount || !method || !address) return res.status(400).json({ status: "error", message: "Missing fields" });

      const [users]: any = await pool.execute('SELECT * FROM users WHERE uid = ?', [uid]);
      if (users.length === 0) return res.status(404).json({ status: "error", message: "User not found" });

      const user = users[0];
      const currentBalance = Number(user.balance);

      if (currentBalance < amount) {
        return res.status(400).json({ status: "error", message: "Insufficient balance" });
      }

      await pool.execute('UPDATE users SET balance = balance - ? WHERE uid = ?', [amount, uid]);

      const transId = `withdraw_${Date.now()}_${uid}`;
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, uid, 'withdrawal', -Math.abs(amount), `Withdraw via ${method} to ${address}`, user.username, user.avatar_url || user.avatar || '', 'pending']
      );

      res.json({ status: "success", message: "Withdrawal requested", balance: currentBalance - amount });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Record Activity
  app.post("/api/record_activity", async (req, res) => {
    if (dbConnectionFailed) {
      return res.json({ status: "success", note: "Activity not recorded (Offline)" });
    }
    try {
      const { userId, username, userAvatar, offerName, reward, type, network } = req.body;
      const transId = `activity_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await pool.execute(
        'INSERT INTO transactions (trans_id, uid, type, amount, description, username, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [transId, userId, type || 'offer', reward, `${network ? network + ': ' : ''}${offerName}`, username || 'User', userAvatar || null, 'credited']
      );
      
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // --- END CORE APP API ROUTES ---

  // API routes can go here
  
  // Proxy Routes (MySQL)
  app.get("/api/fetch-adbluemedia", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      const [ows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', ['adbluemedia']);
      if (ows.length === 0) return res.status(404).json({ error: "AdBlueMedia not configured" });

      const config = ows[0];
      if (!config.is_active) return res.status(403).json({ error: "Offerwall disabled" });

      const apiUrl = `https://d2dzcaq3bhqk1m.cloudfront.net/public/offers/feed.php?user_id=${config.pub_id || config.app_id}&api_key=${config.api_key}&s1=${userId}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/fetch-upwall", async (req, res) => {
    try {
      const { userId, country, os } = req.query;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      const [ows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', ['upwall']);
      if (ows.length === 0) return res.status(404).json({ error: "UPWALL not configured" });

      const config = ows[0];
      if (!config.is_active) return res.status(403).json({ error: "Offerwall disabled" });

      const effectiveKey = config.app_id || config.api_key;
      const apiUrl = `https://offerwall.upwall.io/api?app_id=${effectiveKey}&userid=${userId}${country ? `&country=${country}` : ''}${os ? `&os=${os}` : ''}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/fetch-adlexy", async (req, res) => {
    try {
      const { userId, country, device } = req.query;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      const [ows]: any = await pool.execute('SELECT * FROM offerwalls WHERE id = ?', ['adlexy']);
      if (ows.length === 0) return res.status(404).json({ error: "Adlexy not configured" });

      const config = ows[0];
      if (!config.is_active) return res.status(403).json({ error: "Offerwall disabled" });

      let apiUrl = `https://adlexy.com/api/v1/offers?api_key=${config.api_key}&user_id=${userId}`;
      if (country) apiUrl += `&country=${country}`;
      if (device) apiUrl += `&device=${device}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Global catch-all for /api routes to prevent them falling through to index.html (SPA)
  // This ensures that 404 API requests return JSON instead of the HTML for the frontend.
  app.all("/api/*", cors(), (req, res) => {
    res.status(404).json({
      error: "API endpoint not found",
      path: req.path,
      domain: req.get('host')
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("FATAL: Failed to start server:", error);
  process.exit(1);
});
