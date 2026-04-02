const SUPABASE_URL = "https://dlaehmgpmnphzmeexidm.supabase.co/rest/v1";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TARGET_NAME = process.argv[2] || "Adrian Kasinski";

if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY env var.");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

async function run() {
  const employeeRes = await fetch(
    `${SUPABASE_URL}/employees?select=id,name&name=eq.${encodeURIComponent(TARGET_NAME)}`,
    { headers }
  );
  const employees = await employeeRes.json();
  const employee = employees[0];
  if (!employee) {
    console.error(`Employee not found: ${TARGET_NAME}`);
    process.exit(1);
  }

  const [eventsRes, openSessionRes] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/events?select=id,event_type,timestamp&employee_id=eq.${employee.id}&order=id.desc&limit=5`,
      { headers }
    ),
    fetch(
      `${SUPABASE_URL}/sessions?select=id,start_time,end_time&employee_id=eq.${employee.id}&end_time=is.null&order=id.desc&limit=1`,
      { headers }
    ),
  ]);

  const events = await eventsRes.json();
  const openSessions = await openSessionRes.json();
  const payload = {
    employee,
    latestEvents: events,
    openSession: openSessions[0] || null,
  };
  console.log(JSON.stringify(payload, null, 2));
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
