const http = require("node:http");
const { readFile, writeFile, mkdir } = require("node:fs/promises");
const path = require("node:path");

const PORT = Number(process.env.LENDLENS_API_PORT || 5175);
const ROOT = path.resolve(__dirname, "../..");
const DB_DIR = path.join(ROOT, "db");
const LAPTOPS_FILE = path.join(DB_DIR, "laptops.json");
const TABLETS_FILE = path.join(DB_DIR, "tablets.json");
const LOGS_FILE = path.join(DB_DIR, "rental_logs.json");
const RENT_SESSIONS_FILE = path.join(DB_DIR, "rent_sessions.json");
const RETURN_PHOTOS_FILE = path.join(DB_DIR, "return_photos.json");
const RETURN_UPLOADS_DIR = path.join(DB_DIR, "uploads", "returns");
const RENT_SESSION_TTL_MS = 3 * 60 * 1000;

const allowedStatuses = new Set([
  "available",
  "rented",
  "repairing",
  "broken",
  "issue_found",
]);

function now() {
  return new Date().toISOString();
}

function normalizeLaptopId(value) {
  return String(value || "").trim().toUpperCase();
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function jsonResponse(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function htmlResponse(response, statusCode, html) {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(html);
}

function apiError(response, statusCode, code, message) {
  jsonResponse(response, statusCode, { error: { code, message } });
}

async function readJson(filePath, fallback) {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }
}

async function loadDb() {
  const [laptops, tablets, logs, rentSessions, returnPhotos] = await Promise.all([
    readJson(LAPTOPS_FILE, []),
    readJson(TABLETS_FILE, []),
    readJson(LOGS_FILE, []),
    readJson(RENT_SESSIONS_FILE, []),
    readJson(RETURN_PHOTOS_FILE, []),
  ]);

  return { laptops, tablets, logs, rentSessions, returnPhotos };
}

async function saveDb({ laptops, tablets, logs, rentSessions, returnPhotos }) {
  await Promise.all([
    writeJson(LAPTOPS_FILE, laptops),
    writeJson(TABLETS_FILE, tablets || []),
    writeJson(LOGS_FILE, logs),
    writeJson(RENT_SESSIONS_FILE, rentSessions || []),
    writeJson(RETURN_PHOTOS_FILE, returnPhotos || []),
  ]);
}

function findLaptop(laptops, laptopId) {
  return laptops.find((laptop) => laptop.id === laptopId);
}

function findTablet(tablets, tabletId) {
  return tablets.find((tablet) => tablet.id === tabletId);
}

function findAvailableLaptop(laptops) {
  return laptops.find((laptop) => laptop.status === "available");
}

function findAvailableTablet(tablets) {
  return tablets.find((tablet) => tablet.status === "available");
}

function createRentLog(logs, laptopId, studentId, rentedAt) {
  return {
    id: `log_${Date.now()}`,
    laptopId,
    studentId,
    rentedAt,
    returnedAt: null,
    result: "rented",
  };
}

async function handleGetLaptop(response, laptopId) {
  const { laptops } = await loadDb();
  const laptop = findLaptop(laptops, normalizeLaptopId(laptopId));

  if (!laptop) {
    return apiError(response, 404, "LAPTOP_NOT_FOUND", "Unknown laptop number.");
  }

  return jsonResponse(response, 200, { laptop });
}

async function handleCreateRent(request, response) {
  const body = await readBody(request);
  const laptopId = normalizeLaptopId(body.laptopId);
  const studentId = String(body.studentId || "").trim();

  if (!laptopId || !studentId) {
    return apiError(response, 400, "VALIDATION_ERROR", "laptopId and studentId are required.");
  }

  const db = await loadDb();
  const laptop = findLaptop(db.laptops, laptopId);

  if (!laptop) {
    return apiError(response, 404, "LAPTOP_NOT_FOUND", "Unknown laptop number.");
  }

  if (laptop.status !== "available") {
    return apiError(response, 409, "LAPTOP_NOT_AVAILABLE", "Laptop is not available for rent.");
  }

  const rentedAt = now();
  const rentId = `rent_${Date.now()}`;

  laptop.status = "rented";
  laptop.currentStudentId = studentId;
  laptop.currentRentId = rentId;
  laptop.lastIssueSummary = null;
  laptop.updatedAt = rentedAt;

  db.logs.unshift(createRentLog(db.logs, laptopId, studentId, rentedAt));
  await saveDb(db);

  return jsonResponse(response, 201, {
    rent: {
      id: rentId,
      laptopId,
      studentId,
      rentedAt,
      status: "active",
      baselineInstalledApps: Array.isArray(body.baselineInstalledApps)
        ? body.baselineInstalledApps
        : [],
    },
    laptop,
  });
}

function completeRent(db, session) {
  const device =
    session.deviceType === "tablet"
      ? findTablet(db.tablets, session.deviceId)
      : findLaptop(db.laptops, session.deviceId);

  if (!device) {
    const error = new Error("Unknown device number.");
    error.code = "LAPTOP_NOT_FOUND";
    throw error;
  }

  if (device.status !== "available") {
    const error = new Error("Device is not available for rent.");
    error.code = "LAPTOP_NOT_AVAILABLE";
    throw error;
  }

  const rentedAt = now();
  const rentId = `rent_${Date.now()}`;

  device.status = "rented";
  device.currentStudentId = session.studentId;
  device.currentRentId = rentId;
  device.lastIssueSummary = null;
  device.updatedAt = rentedAt;

  session.status = "confirmed";
  session.confirmedAt = rentedAt;

  db.logs.unshift(createRentLog(db.logs, device.id, session.studentId, rentedAt));

  return {
    rent: {
      id: rentId,
      laptopId: device.id,
      studentId: session.studentId,
      rentedAt,
      status: "active",
      baselineInstalledApps: [],
    },
    laptop: device,
  };
}

function createScanResultPage(title, message) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f9f9ff;
        color: #141b2b;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(100% - 32px, 380px);
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        padding: 28px;
        text-align: center;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 24px;
      }
      p {
        margin: 0;
        color: #4c5565;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
    </main>
  </body>
</html>`;
}

function isRentSessionExpired(session) {
  if (session.status !== "pending") {
    return false;
  }

  const expiresAt = Date.parse(session.expiresAt || "");
  if (Number.isNaN(expiresAt)) {
    return false;
  }

  return Date.now() >= expiresAt;
}

function expireRentSessionIfNeeded(session) {
  if (!isRentSessionExpired(session)) {
    return false;
  }

  session.status = "expired";
  session.expiredAt = now();
  return true;
}

async function handleCreateRentSession(request, response) {
  const body = await readBody(request);
  const studentId = String(body.studentId || "").trim();
  const deviceType = body.deviceType === "tablet" ? "tablet" : "laptop";
  const requestedDeviceId = normalizeLaptopId(body.deviceId);

  if (!studentId) {
    return apiError(response, 400, "VALIDATION_ERROR", "studentId is required.");
  }

  const db = await loadDb();
  const device =
    deviceType === "tablet"
      ? requestedDeviceId
        ? findTablet(db.tablets, requestedDeviceId)
        : findAvailableTablet(db.tablets)
      : requestedDeviceId
        ? findLaptop(db.laptops, requestedDeviceId)
        : findAvailableLaptop(db.laptops);

  if (!device) {
    return apiError(response, 404, "LAPTOP_NOT_FOUND", "No available device was found.");
  }

  if (device.status !== "available") {
    return apiError(response, 409, "LAPTOP_NOT_AVAILABLE", "Device is not available for rent.");
  }

  const sessionId = createId("rent_session");
  const token = createId("token");
  const createdAt = now();
  const expiresAt = new Date(Date.parse(createdAt) + RENT_SESSION_TTL_MS).toISOString();
  const confirmationUrl = `http://127.0.0.1:${PORT}/api/rent-sessions/${sessionId}/scan-confirm`;
  const session = {
    id: sessionId,
    token,
    studentId,
    deviceType,
    deviceId: device.id,
    status: "pending",
    confirmationUrl,
    createdAt,
    expiresAt,
    confirmedAt: null,
    expiredAt: null,
  };

  db.rentSessions.unshift(session);
  await saveDb(db);

  return jsonResponse(response, 201, { session, laptop: device });
}

async function handleGetRentSession(response, sessionId) {
  const db = await loadDb();
  const session = db.rentSessions.find((item) => item.id === sessionId);

  if (!session) {
    return apiError(response, 404, "RENT_SESSION_NOT_FOUND", "Rent session was not found.");
  }

  const didExpire = expireRentSessionIfNeeded(session);
  if (didExpire) {
    await saveDb(db);
  }

  const laptop =
    session.deviceType === "tablet"
      ? findTablet(db.tablets, session.deviceId)
      : findLaptop(db.laptops, session.deviceId);

  if (!laptop) {
    return apiError(response, 404, "LAPTOP_NOT_FOUND", "Unknown device number.");
  }

  return jsonResponse(response, 200, { session, laptop });
}

async function handleConfirmRentSession(response, sessionId) {
  const db = await loadDb();
  const session = db.rentSessions.find((item) => item.id === sessionId);

  if (!session) {
    return apiError(response, 404, "RENT_SESSION_NOT_FOUND", "Rent session was not found.");
  }

  if (expireRentSessionIfNeeded(session)) {
    await saveDb(db);
    return apiError(response, 410, "RENT_SESSION_EXPIRED", "Rent session has expired.");
  }

  if (session.status !== "pending") {
    return apiError(response, 409, "RENT_SESSION_NOT_PENDING", "Rent session is not pending.");
  }

  try {
    const result = completeRent(db, session);
    await saveDb(db);
    return jsonResponse(response, 201, result);
  } catch (error) {
    if (error.code === "LAPTOP_NOT_FOUND") {
      return apiError(response, 404, error.code, error.message);
    }

    if (error.code === "LAPTOP_NOT_AVAILABLE") {
      return apiError(response, 409, error.code, error.message);
    }

    throw error;
  }
}

async function handleScanConfirmRentSession(response, sessionId) {
  const db = await loadDb();
  const session = db.rentSessions.find((item) => item.id === sessionId);

  if (!session) {
    return htmlResponse(
      response,
      404,
      createScanResultPage("Session not found", "This rental QR code is not valid.")
    );
  }

  if (expireRentSessionIfNeeded(session)) {
    await saveDb(db);
    return htmlResponse(
      response,
      410,
      createScanResultPage("QR expired", "This rental QR code is valid for 3 minutes only.")
    );
  }

  if (session.status === "confirmed") {
    return htmlResponse(
      response,
      200,
      createScanResultPage("Rental already confirmed", "You may close this page.")
    );
  }

  if (session.status !== "pending") {
    return htmlResponse(
      response,
      409,
      createScanResultPage("Session unavailable", "This rental session can no longer be confirmed.")
    );
  }

  try {
    completeRent(db, session);
    await saveDb(db);
    return htmlResponse(
      response,
      200,
      createScanResultPage("Rental confirmed", "You may close this page.")
    );
  } catch (error) {
    if (error.code === "LAPTOP_NOT_FOUND") {
      return htmlResponse(response, 404, createScanResultPage("Device not found", error.message));
    }

    if (error.code === "LAPTOP_NOT_AVAILABLE") {
      return htmlResponse(response, 409, createScanResultPage("Device unavailable", error.message));
    }

    throw error;
  }
}

async function handleReturnStart(request, response) {
  const body = await readBody(request);
  const laptopId = normalizeLaptopId(body.laptopId);
  const studentId = String(body.studentId || "").trim();

  if (!laptopId || !studentId) {
    return apiError(response, 400, "VALIDATION_ERROR", "laptopId and studentId are required.");
  }

  const { laptops } = await loadDb();
  const laptop = findLaptop(laptops, laptopId);

  if (!laptop) {
    return apiError(response, 404, "LAPTOP_NOT_FOUND", "Unknown laptop number.");
  }

  if (laptop.status !== "rented") {
    return apiError(response, 409, "LAPTOP_NOT_RENTED", "Laptop is not rented.");
  }

  if (laptop.currentStudentId && laptop.currentStudentId !== studentId) {
    return apiError(response, 409, "STUDENT_MISMATCH", "Student number does not match the active rent.");
  }

  return jsonResponse(response, 201, {
    inspection: {
      id: `inspection_${Date.now()}`,
      rentId: laptop.currentRentId,
      laptopId,
      studentId,
      healthStatus: "pass",
      visualStatus: "pass",
      finalStatus: "returned",
      createdAt: now(),
    },
  });
}

function getMockReturnPhotoAngles(deviceType) {
  if (deviceType === "tablet") {
    return ["front_screen", "back_surface"];
  }

  return ["open_screen_keyboard", "closed_top_accessories", "closed_bottom"];
}

async function handleUploadReturnPhotosMock(request, response) {
  const body = await readBody(request);
  const studentId = String(body.studentId || "").trim();
  const deviceType = body.deviceType === "tablet" ? "tablet" : "laptop";
  const deviceId = normalizeLaptopId(body.deviceId);

  if (!studentId || !deviceId) {
    return apiError(response, 400, "VALIDATION_ERROR", "studentId and deviceId are required.");
  }

  const db = await loadDb();
  const device =
    deviceType === "tablet"
      ? findTablet(db.tablets, deviceId)
      : findLaptop(db.laptops, deviceId);

  if (!device) {
    return apiError(response, 404, "LAPTOP_NOT_FOUND", "Unknown device number.");
  }

  if (device.status !== "rented" || device.currentStudentId !== studentId) {
    return apiError(response, 409, "STUDENT_MISMATCH", "Device is not rented to this student.");
  }

  const photoSetId = createId("return_photos");
  const createdAt = now();
  const uploadDir = path.join(RETURN_UPLOADS_DIR, photoSetId);
  const angles = getMockReturnPhotoAngles(deviceType);
  const photos = angles.map((angle, index) => {
    return {
      id: `${photoSetId}_${index + 1}`,
      angle,
      status: "uploaded",
      path: `db/uploads/returns/${photoSetId}/${angle}.json`,
    };
  });

  await mkdir(uploadDir, { recursive: true });
  await Promise.all(
    photos.map((photo) => {
      return writeJson(path.join(ROOT, photo.path), {
        mock: true,
        photoSetId,
        deviceType,
        deviceId,
        studentId,
        angle: photo.angle,
        createdAt,
      });
    })
  );

  const photoSet = {
    id: photoSetId,
    studentId,
    deviceType,
    deviceId,
    rentId: device.currentRentId || null,
    status: "uploaded",
    photos,
    createdAt,
    inspection: {
      status: "pending",
      resultPath: null,
      heatmapPath: null,
      issues: [],
    },
  };

  db.returnPhotos.unshift(photoSet);
  await saveDb(db);

  return jsonResponse(response, 201, { photoSet });
}

async function handleAddLaptop(request, response) {
  const body = await readBody(request);
  const laptopId = normalizeLaptopId(body.id);

  if (!laptopId || !body.model) {
    return apiError(response, 400, "VALIDATION_ERROR", "id and model are required.");
  }

  const db = await loadDb();
  if (findLaptop(db.laptops, laptopId)) {
    return apiError(response, 409, "VALIDATION_ERROR", "Laptop already exists.");
  }

  const laptop = {
    id: laptopId,
    brand: String(body.brand || "Unknown"),
    model: String(body.model),
    purchaseYear: Number(body.purchaseYear || new Date().getFullYear()),
    purchaseMonth: Number(body.purchaseMonth || new Date().getMonth() + 1),
    status: "available",
    currentStudentId: null,
    currentRentId: null,
    lastIssueSummary: null,
    updatedAt: now(),
  };

  db.laptops.unshift(laptop);
  await saveDb(db);

  return jsonResponse(response, 201, { laptop });
}

async function handleAddTablet(request, response) {
  const body = await readBody(request);
  const tabletId = normalizeLaptopId(body.id);

  if (!tabletId || !body.model) {
    return apiError(response, 400, "VALIDATION_ERROR", "id and model are required.");
  }

  const db = await loadDb();
  if (findTablet(db.tablets, tabletId)) {
    return apiError(response, 409, "VALIDATION_ERROR", "Tablet already exists.");
  }

  const tablet = {
    id: tabletId,
    brand: String(body.brand || "Unknown"),
    model: String(body.model),
    purchaseYear: Number(body.purchaseYear || new Date().getFullYear()),
    purchaseMonth: Number(body.purchaseMonth || new Date().getMonth() + 1),
    status: "available",
    currentStudentId: null,
    currentRentId: null,
    lastIssueSummary: null,
    updatedAt: now(),
  };

  db.tablets.unshift(tablet);
  await saveDb(db);

  return jsonResponse(response, 201, { tablet });
}

async function handleDeleteLaptop(response, laptopId) {
  const id = normalizeLaptopId(laptopId);
  const db = await loadDb();
  const nextLaptops = db.laptops.filter((laptop) => laptop.id !== id);

  if (nextLaptops.length === db.laptops.length) {
    return apiError(response, 404, "LAPTOP_NOT_FOUND", "Unknown laptop number.");
  }

  db.laptops = nextLaptops;
  await saveDb(db);

  return jsonResponse(response, 200, { deleted: true, laptopId: id });
}

async function handleDeleteTablet(response, tabletId) {
  const id = normalizeLaptopId(tabletId);
  const db = await loadDb();
  const nextTablets = db.tablets.filter((tablet) => tablet.id !== id);

  if (nextTablets.length === db.tablets.length) {
    return apiError(response, 404, "TABLET_NOT_FOUND", "Unknown tablet number.");
  }

  db.tablets = nextTablets;
  await saveDb(db);

  return jsonResponse(response, 200, { deleted: true, tabletId: id });
}

async function handlePatchStatus(request, response, laptopId) {
  const body = await readBody(request);
  const status = String(body.status || "");

  if (!allowedStatuses.has(status)) {
    return apiError(response, 400, "VALIDATION_ERROR", "Unsupported laptop status.");
  }

  const db = await loadDb();
  const laptop = findLaptop(db.laptops, normalizeLaptopId(laptopId));

  if (!laptop) {
    return apiError(response, 404, "LAPTOP_NOT_FOUND", "Unknown laptop number.");
  }

  laptop.status = status;
  laptop.lastIssueSummary = Object.prototype.hasOwnProperty.call(body, "note")
    ? String(body.note || "").trim() || null
    : laptop.lastIssueSummary;
  laptop.updatedAt = now();

  if (status !== "rented") {
    laptop.currentStudentId = null;
    laptop.currentRentId = null;
  }

  await saveDb(db);
  return jsonResponse(response, 200, { laptop });
}

async function handlePatchTabletStatus(request, response, tabletId) {
  const body = await readBody(request);
  const status = String(body.status || "");

  if (!allowedStatuses.has(status)) {
    return apiError(response, 400, "VALIDATION_ERROR", "Unsupported tablet status.");
  }

  const db = await loadDb();
  const tablet = findTablet(db.tablets, normalizeLaptopId(tabletId));

  if (!tablet) {
    return apiError(response, 404, "TABLET_NOT_FOUND", "Unknown tablet number.");
  }

  tablet.status = status;
  tablet.lastIssueSummary = Object.prototype.hasOwnProperty.call(body, "note")
    ? String(body.note || "").trim() || null
    : tablet.lastIssueSummary;
  tablet.updatedAt = now();

  if (status !== "rented") {
    tablet.currentStudentId = null;
    tablet.currentRentId = null;
  }

  await saveDb(db);
  return jsonResponse(response, 200, { tablet });
}

async function route(request, response) {
  if (request.method === "OPTIONS") {
    return jsonResponse(response, 204, {});
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (request.method === "GET" && pathname === "/api/health") {
    return jsonResponse(response, 200, { ok: true });
  }

  if (request.method === "GET" && pathname === "/api/laptops") {
    const { laptops } = await loadDb();
    return jsonResponse(response, 200, { laptops });
  }

  if (request.method === "GET" && pathname === "/api/tablets") {
    const { tablets } = await loadDb();
    return jsonResponse(response, 200, { tablets });
  }

  if (request.method === "POST" && pathname === "/api/tablets") {
    return handleAddTablet(request, response);
  }

  if (request.method === "POST" && pathname === "/api/laptops") {
    return handleAddLaptop(request, response);
  }

  if (request.method === "GET" && pathname === "/api/rental-logs") {
    const { logs } = await loadDb();
    return jsonResponse(response, 200, {
      logs: logs.filter((log) => log.returnedAt && log.result !== "rented"),
    });
  }

  if (request.method === "POST" && pathname === "/api/rents") {
    return handleCreateRent(request, response);
  }

  if (request.method === "POST" && pathname === "/api/rent-sessions") {
    return handleCreateRentSession(request, response);
  }

  if (request.method === "POST" && pathname === "/api/returns/start") {
    return handleReturnStart(request, response);
  }

  if (request.method === "POST" && pathname === "/api/returns/photos/mock-upload") {
    return handleUploadReturnPhotosMock(request, response);
  }

  const laptopMatch = pathname.match(/^\/api\/laptops\/([^/]+)$/);
  if (laptopMatch && request.method === "GET") {
    return handleGetLaptop(response, laptopMatch[1]);
  }

  if (laptopMatch && request.method === "DELETE") {
    return handleDeleteLaptop(response, laptopMatch[1]);
  }

  const statusMatch = pathname.match(/^\/api\/laptops\/([^/]+)\/status$/);
  if (statusMatch && request.method === "PATCH") {
    return handlePatchStatus(request, response, statusMatch[1]);
  }

  const tabletMatch = pathname.match(/^\/api\/tablets\/([^/]+)$/);
  if (tabletMatch && request.method === "DELETE") {
    return handleDeleteTablet(response, tabletMatch[1]);
  }

  const tabletStatusMatch = pathname.match(/^\/api\/tablets\/([^/]+)\/status$/);
  if (tabletStatusMatch && request.method === "PATCH") {
    return handlePatchTabletStatus(request, response, tabletStatusMatch[1]);
  }

  const rentSessionMatch = pathname.match(/^\/api\/rent-sessions\/([^/]+)$/);
  if (rentSessionMatch && request.method === "GET") {
    return handleGetRentSession(response, rentSessionMatch[1]);
  }

  const rentScanConfirmMatch = pathname.match(/^\/api\/rent-sessions\/([^/]+)\/scan-confirm$/);
  if (rentScanConfirmMatch && request.method === "GET") {
    return handleScanConfirmRentSession(response, rentScanConfirmMatch[1]);
  }

  const rentConfirmMatch = pathname.match(/^\/api\/rent-sessions\/([^/]+)\/confirm$/);
  if (rentConfirmMatch && request.method === "POST") {
    return handleConfirmRentSession(response, rentConfirmMatch[1]);
  }

  return apiError(response, 404, "NOT_FOUND", "API route not found.");
}

const server = http.createServer((request, response) => {
  route(request, response).catch((error) => {
    if (error && error.code === "VALIDATION_ERROR") {
      return apiError(response, 400, "VALIDATION_ERROR", error.message);
    }

    console.error(error);
    return apiError(response, 500, "SERVER_ERROR", "Unexpected API server error.");
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`KeepEy API server running at http://127.0.0.1:${PORT}`);
});
