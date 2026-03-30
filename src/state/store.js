import { formatDateTime, formatMinutes, minutesBetween, nowIso } from "../utils/time.js";

const STORAGE_KEY = "pontaj_simple_v1";

const defaultState = {
  admin: {
    username: "admin",
    password: "admin123",
  },
  employees: [
    { id: "emp_1", name: "Andrei" },
    { id: "emp_2", name: "Maria" },
    { id: "emp_3", name: "Ioana" },
  ],
  sessions: [],
  events: [],
};

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  if (!parsed) {
    saveState(defaultState);
    return structuredClone(defaultState);
  }
  return parsed;
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getEmployeeStatus(state, employeeId) {
  const openSession = state.sessions.find((s) => s.employeeId === employeeId && !s.end);
  return openSession ? "IN" : "OUT";
}

export function toggleEmployee(state, employeeId) {
  const timestamp = nowIso();
  const openSession = state.sessions.find((s) => s.employeeId === employeeId && !s.end);

  if (openSession) {
    openSession.end = timestamp;
    state.events.unshift({
      id: `ev_${crypto.randomUUID()}`,
      employeeId,
      type: "OUT",
      at: timestamp,
    });
    return { type: "OUT", at: timestamp };
  }

  state.sessions.push({
    id: `ss_${crypto.randomUUID()}`,
    employeeId,
    start: timestamp,
    end: null,
  });
  state.events.unshift({
    id: `ev_${crypto.randomUUID()}`,
    employeeId,
    type: "IN",
    at: timestamp,
  });
  return { type: "IN", at: timestamp };
}

export function addEmployee(state, name) {
  const clean = (name || "").trim();
  if (!clean) return false;
  state.employees.push({ id: `emp_${crypto.randomUUID()}`, name: clean });
  return true;
}

export function removeEmployee(state, employeeId) {
  state.employees = state.employees.filter((e) => e.id !== employeeId);
  state.sessions = state.sessions.filter((s) => s.employeeId !== employeeId);
  state.events = state.events.filter((e) => e.employeeId !== employeeId);
}

export function getEmployeeName(state, employeeId) {
  const emp = state.employees.find((e) => e.id === employeeId);
  return emp ? emp.name : "Necunoscut";
}

export function addManualSession(state, employeeId, startTime, endTime) {
  const start = new Date(startTime).toISOString();
  const end = endTime ? new Date(endTime).toISOString() : null;
  
  if (!start || start === 'Invalid Date') return false;
  if (end && end === 'Invalid Date') return false;
  if (end && new Date(end) <= new Date(start)) return false;

  const session = {
    id: `ss_${crypto.randomUUID()}`,
    employeeId,
    start,
    end,
  };
  
  state.sessions.push(session);
  
  state.events.unshift({
    id: `ev_${crypto.randomUUID()}`,
    employeeId,
    type: "MANUAL_ADD",
    at: nowIso(),
  });
  
  return true;
}

export function deleteSession(state, sessionId) {
  const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return false;
  
  const session = state.sessions[sessionIndex];
  state.sessions.splice(sessionIndex, 1);
  
  state.events.unshift({
    id: `ev_${crypto.randomUUID()}`,
    employeeId: session.employeeId,
    type: "MANUAL_DELETE",
    at: nowIso(),
  });
  
  return true;
}

export function editSession(state, sessionId, startTime, endTime) {
  const session = state.sessions.find(s => s.id === sessionId);
  if (!session) return false;
  
  const start = new Date(startTime).toISOString();
  const end = endTime ? new Date(endTime).toISOString() : null;
  
  if (!start || start === 'Invalid Date') return false;
  if (end && end === 'Invalid Date') return false;
  if (end && new Date(end) <= new Date(start)) return false;
  
  session.start = start;
  session.end = end;
  
  state.events.unshift({
    id: `ev_${crypto.randomUUID()}`,
    employeeId: session.employeeId,
    type: "MANUAL_EDIT",
    at: nowIso(),
  });
  
  return true;
}

export function getEmployeeSessions(state, employeeId) {
  return state.sessions
    .filter(s => s.employeeId === employeeId)
    .sort((a, b) => new Date(b.start) - new Date(a.start));
}

export function buildAdminRows(state) {
  const now = new Date().toISOString();
  return state.employees.map((employee) => {
    const status = getEmployeeStatus(state, employee.id);
    const employeeSessions = state.sessions.filter((s) => s.employeeId === employee.id);
    const totalMinutes = employeeSessions.reduce((sum, session) => {
      const end = session.end || now;
      return sum + minutesBetween(session.start, end);
    }, 0);
    const lastEvent = state.events.find((ev) => ev.employeeId === employee.id);

    return {
      id: employee.id,
      name: employee.name,
      status,
      worked: formatMinutes(totalMinutes),
      lastEvent: lastEvent ? `${lastEvent.type} • ${formatDateTime(lastEvent.at)}` : "-",
      sessionsCount: employeeSessions.length,
    };
  });
}
