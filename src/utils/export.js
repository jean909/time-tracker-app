import { minutesBetween } from "./time.js";

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function exportEmployeeToExcelLikeCsv(employee, sessions) {
  const nowIso = new Date().toISOString();
  const rows = [
    ["Employee", employee.name],
    ["GeneratedAt", new Date().toLocaleString()],
    [],
    ["Start", "End", "WorkedMinutes", "WorkedHours"],
  ];

  let totalMinutes = 0;
  for (const session of sessions) {
    const end = session.end || nowIso;
    const workedMinutes = minutesBetween(session.start, end);
    totalMinutes += workedMinutes;
    rows.push([
      new Date(session.start).toLocaleString(),
      session.end ? new Date(session.end).toLocaleString() : "OPEN",
      workedMinutes,
      (workedMinutes / 60).toFixed(2),
    ]);
  }

  rows.push([]);
  rows.push(["TotalMinutes", totalMinutes]);
  rows.push(["TotalHours", (totalMinutes / 60).toFixed(2)]);

  const csv = rows
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  // BOM helps Excel open UTF-8 correctly.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = employee.name.replaceAll(" ", "_");
  link.href = url;
  link.download = `timesheet_${safeName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
