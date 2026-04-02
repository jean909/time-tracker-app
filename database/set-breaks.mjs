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

const targetNames = [
  "Grzegorz Bralewski",
  "Adrian Kasinski",
  "Mateusz Wasilewski",
  "Artur Golubski",
  "Rafal Depta",
  "Lukasz Kulasinski",
];

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

async function run() {
  const employees = await api("employees?select=id,name");
  const target = employees.filter((e) => targetNames.includes(e.name));
  const targetIds = new Set(target.map((e) => e.id));

  const sessions = await api(
    "sessions?select=id,employee_id,start_time,end_time,break_minutes&order=start_time.asc"
  );

  const march31 = sessions.filter((s) => {
    const d = new Date(s.start_time);
    return (
      targetIds.has(s.employee_id) &&
      d.getUTCFullYear() === 2026 &&
      d.getUTCMonth() === 2 && // March
      d.getUTCDate() === 31
    );
  });

  let updated = 0;
  for (const s of march31) {
    const patched = await api(`sessions?id=eq.${s.id}`, {
      method: "PATCH",
      body: JSON.stringify({ break_minutes: 60 }),
    });
    updated += patched.length;
  }

  const verify = await api(
    "sessions?select=id,employee_id,start_time,end_time,break_minutes&order=start_time.asc"
  );
  const verifiedRows = verify.filter((s) => {
    const d = new Date(s.start_time);
    return (
      targetIds.has(s.employee_id) &&
      d.getUTCFullYear() === 2026 &&
      d.getUTCMonth() === 2 &&
      d.getUTCDate() === 31
    );
  });

  console.log("Updated rows:", updated);
  console.log("Verified March 31 rows:", verifiedRows.length);
  console.log(
    "Break values:",
    verifiedRows.map((r) => ({ id: r.id, break_minutes: r.break_minutes }))
  );
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
