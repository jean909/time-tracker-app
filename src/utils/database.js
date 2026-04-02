// Simple Supabase integration for time tracking
// Free tier: 2 projects, 500MB DB, no vendor lock-in

const SUPABASE_URL = window.PONTAJ_CONFIG?.SUPABASE_URL || 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = window.PONTAJ_CONFIG?.SUPABASE_ANON_KEY || 'your-anon-key';

class Database {
  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.apiKey = SUPABASE_ANON_KEY;
    this.headers = {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/rest/v1/${endpoint}`;
    const config = {
      headers: this.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  // Employees
  async getEmployees() {
    return await this.request('employees?select=*&order=name');
  }

  async addEmployee(name) {
    return await this.request('employees', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    });
  }

  async removeEmployee(id) {
    return await this.request(`employees?id=eq.${id}`, {
      method: 'DELETE',
    });
  }

  // Time sessions
  async getSessions() {
    return await this.request('sessions?select=*&order=start_time.desc');
  }

  async addSession(employeeId, startTime, endTime = null) {
    return await this.request('sessions', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: employeeId,
        start_time: startTime,
        end_time: endTime,
      }),
    });
  }

  async updateSession(id, endTime) {
    return await this.request(`sessions?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ end_time: endTime }),
    });
  }

  async getLatestOpenSession(employeeId) {
    const result = await this.request(
      `sessions?select=*&employee_id=eq.${employeeId}&end_time=is.null&order=start_time.desc&limit=1`
    );
    return result[0] || null;
  }

  async deleteSession(id) {
    return await this.request(`sessions?id=eq.${id}`, {
      method: 'DELETE',
    });
  }

  // Events log
  async addEvent(employeeId, type, timestamp) {
    return await this.request('events', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: employeeId,
        event_type: type,
        timestamp: timestamp,
      }),
    });
  }

  async getEvents(limit = 50) {
    return await this.request(`events?select=*,employees(name)&order=timestamp.desc&limit=${limit}`);
  }
}

// Fallback to localStorage if database is not configured or fails
export class HybridStorage {
  constructor() {
    this.db = new Database();
    this.isOnline = navigator.onLine;
    this.useDatabase = SUPABASE_URL !== 'https://your-project-ref.supabase.co';
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  shouldUseDatabase() {
    return this.useDatabase && this.isOnline;
  }

  // Get localStorage backup
  getLocalData() {
    const data = localStorage.getItem('pontaj_simple_v1');
    return data ? JSON.parse(data) : null;
  }

  // Save to localStorage backup
  saveLocalData(data) {
    localStorage.setItem('pontaj_simple_v1', JSON.stringify(data));
  }

  // Get pending offline changes
  getPendingChanges() {
    const pending = localStorage.getItem('pontaj_pending_changes');
    return pending ? JSON.parse(pending) : [];
  }

  // Add change to offline queue
  addPendingChange(change) {
    const pending = this.getPendingChanges();
    pending.push({ ...change, timestamp: new Date().toISOString() });
    localStorage.setItem('pontaj_pending_changes', JSON.stringify(pending));
  }

  // Sync pending changes when back online
  async syncPendingChanges() {
    if (!this.shouldUseDatabase()) return;

    const pending = this.getPendingChanges();
    if (pending.length === 0) return;

    try {
      for (const change of pending) {
        await this.executeChange(change);
      }
      // Clear pending changes after successful sync
      localStorage.removeItem('pontaj_pending_changes');
      console.log(`Synced ${pending.length} pending changes`);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  async executeChange(change) {
    switch (change.type) {
      case 'add_employee':
        await this.db.addEmployee(change.name);
        break;
      case 'remove_employee':
        await this.db.removeEmployee(change.id);
        break;
      case 'add_session':
        await this.db.addSession(change.employeeId, change.startTime, change.endTime);
        break;
      case 'punch_in':
        await this.db.addSession(change.employeeId, change.at, null);
        await this.db.addEvent(change.employeeId, 'IN', change.at);
        break;
      case 'punch_out': {
        const open = await this.db.getLatestOpenSession(change.employeeId);
        if (open) {
          await this.db.updateSession(open.id, change.at);
        }
        await this.db.addEvent(change.employeeId, 'OUT', change.at);
        break;
      }
      // Add more change types as needed
    }
  }

  // Main API methods
  async getEmployees() {
    if (this.shouldUseDatabase()) {
      try {
        const employees = await this.db.getEmployees();
        // Cache in localStorage
        const localData = this.getLocalData() || {};
        localData.employees = employees;
        this.saveLocalData(localData);
        return employees;
      } catch (error) {
        console.warn('Database failed, using local storage:', error);
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData();
    return localData?.employees || [];
  }

  async addEmployee(name) {
    const employee = { id: `emp_${Date.now()}`, name: name.trim() };

    if (this.shouldUseDatabase()) {
      try {
        const result = await this.db.addEmployee(name);
        return result[0] || employee;
      } catch (error) {
        console.warn('Database failed, adding to offline queue:', error);
        this.addPendingChange({ type: 'add_employee', name });
      }
    }

    // Update localStorage
    const localData = this.getLocalData() || { employees: [], sessions: [], events: [] };
    localData.employees.push(employee);
    this.saveLocalData(localData);
    
    return employee;
  }

  async removeEmployee(id) {
    if (this.shouldUseDatabase()) {
      try {
        await this.db.removeEmployee(id);
      } catch (error) {
        console.warn('Database failed, adding to offline queue:', error);
        this.addPendingChange({ type: 'remove_employee', id });
      }
    }

    // Update localStorage
    const localData = this.getLocalData();
    if (localData) {
      localData.employees = localData.employees.filter(e => e.id !== id);
      localData.sessions = localData.sessions.filter(s => s.employeeId !== id);
      localData.events = localData.events.filter(e => e.employeeId !== id);
      this.saveLocalData(localData);
    }
  }

  toDbEmployeeId(employeeId) {
    if (typeof employeeId !== "string") return null;
    if (employeeId.startsWith("emp_")) {
      const raw = employeeId.slice(4);
      if (/^\d+$/.test(raw)) return Number(raw);
      return null;
    }
    if (/^\d+$/.test(employeeId)) return Number(employeeId);
    return null;
  }

  async savePunchIn(employeeId, at) {
    const dbEmployeeId = this.toDbEmployeeId(employeeId);
    if (!dbEmployeeId) return;

    if (this.shouldUseDatabase()) {
      try {
        await this.db.addSession(dbEmployeeId, at, null);
        await this.db.addEvent(dbEmployeeId, "IN", at);
        return;
      } catch (error) {
        console.warn("Database punch in failed, queueing:", error);
      }
    }
    this.addPendingChange({ type: "punch_in", employeeId: dbEmployeeId, at });
  }

  async savePunchOut(employeeId, at) {
    const dbEmployeeId = this.toDbEmployeeId(employeeId);
    if (!dbEmployeeId) return;

    if (this.shouldUseDatabase()) {
      try {
        const open = await this.db.getLatestOpenSession(dbEmployeeId);
        if (open) {
          await this.db.updateSession(open.id, at);
        }
        await this.db.addEvent(dbEmployeeId, "OUT", at);
        return;
      } catch (error) {
        console.warn("Database punch out failed, queueing:", error);
      }
    }
    this.addPendingChange({ type: "punch_out", employeeId: dbEmployeeId, at });
  }
}

export default new HybridStorage();