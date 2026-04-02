const SUPABASE_URL = "https://dlaehmgpmnphzmeexidm.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY env var.");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const rows = [
  ["31.03.2026", "Grzegorz Bralewski", "07:00-18:00", 60],
  ["31.03.2026", "Adrian Kasinski", "07:00-18:00", 60],
  ["31.03.2026", "Mateusz Wasilewski", "07:00-18:00", 60],
  ["31.03.2026", "Artur Golubski", "07:00-18:00", 60],
  ["31.03.2026", "Rafal Depta", "07:00-18:00", 60],
  ["31.03.2026", "Lukasz Kulasinski", "07:00-18:00", 60],
  ["02.04.2026", "Grzegorz Bralewski", "07:40-08:50", 0],
  ["02.04.2026", "Adrian Kasinski", "07:40-08:10", 0],
  ["02.04.2026", "Mateusz Wasilewski", "07:40-08:10", 0],
  ["02.04.2026", "Lukasz Kulasinski", "07:40-08:10", 0],
  ["02.04.2026", "Rafal Depta", "07:40-08:50", 0],
  ["02.04.2026", "Artur Golubski", "07:40-08:10", 0],
];

function parseDateTime(dateStr, timeStr) {
  const [d, m, y] = dateStr.split(".");
  const [hh, mm] = timeStr.split(":");
  return `${y}-${m}-${d}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00+02:00`;
}

function splitRange(range) {
  const [rawStart, rawEnd] = range.split("-").map((s) => s.trim());
  return [rawStart, rawEnd];
}

async function api(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} -> ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function ensureEmployee(name) {
  const found = await api(`employees?select=id,name&name=eq.${encodeURIComponent(name)}`);
  if (found.length > 0) return found[0];

  const created = await api("employees", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return created[0];
}

async function sessionExists(employeeId, startTime, endTime) {
  const data = await api(
    `sessions?select=id&employee_id=eq.${employeeId}&start_time=eq.${encodeURIComponent(startTime)}&end_time=eq.${encodeURIComponent(endTime)}`
  );
  return data.length > 0;
}

async function insertData() {
  let inserted = 0;
  for (const [date, name, range, breakMinutes] of rows) {
    const [start, end] = splitRange(range);
    const startIso = parseDateTime(date, start);
    const endIso = parseDateTime(date, end);

    const employee = await ensureEmployee(name);
    const exists = await sessionExists(employee.id, startIso, endIso);
    if (exists) continue;

    try {
      await api("sessions", {
        method: "POST",
        body: JSON.stringify({
          employee_id: employee.id,
          start_time: startIso,
          end_time: endIso,
          break_minutes: breakMinutes,
        }),
      });
    } catch (error) {
      // Backward compatibility if break_minutes column is not yet added.
      if (String(error.message).includes("break_minutes")) {
        await api("sessions", {
          method: "POST",
          body: JSON.stringify({
            employee_id: employee.id,
            start_time: startIso,
            end_time: endIso,
          }),
        });
      } else {
        throw error;
      }
    }

    await api("events", {
      method: "POST",
      body: JSON.stringify({
        employee_id: employee.id,
        event_type: "MANUAL_ADD",
        timestamp: startIso,
      }),
    });
    inserted += 1;
  }
  console.log(`Done. Inserted ${inserted} new sessions.`);
}

insertData().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
