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
    const breakMinutes = Number(session.breakMinutes ?? session.break_minutes ?? 0) || 0;
    const workedMinutes = Math.max(0, minutesBetween(session.start, end) - breakMinutes);
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

export function exportAllEmployeesToExcelLikeCsv(employees, getSessionsForEmployee) {
  const rows = [["Employee", "Start", "End", "WorkedMinutes", "WorkedHours"]];
  let grandTotalMinutes = 0;
  const nowIso = new Date().toISOString();

  for (const employee of employees) {
    const sessions = getSessionsForEmployee(employee.id);
    let employeeTotal = 0;
    for (const session of sessions) {
      const end = session.end || nowIso;
      const breakMinutes = Number(session.breakMinutes ?? session.break_minutes ?? 0) || 0;
      const workedMinutes = Math.max(0, minutesBetween(session.start, end) - breakMinutes);
      employeeTotal += workedMinutes;
      rows.push([
        employee.name,
        new Date(session.start).toLocaleString(),
        session.end ? new Date(session.end).toLocaleString() : "OPEN",
        workedMinutes,
        (workedMinutes / 60).toFixed(2),
      ]);
    }
    rows.push([employee.name, "TOTAL", "", employeeTotal, (employeeTotal / 60).toFixed(2)]);
    grandTotalMinutes += employeeTotal;
  }

  rows.push(["ALL_EMPLOYEES_TOTAL", "", "", grandTotalMinutes, (grandTotalMinutes / 60).toFixed(2)]);

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "timesheet_all_employees.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
