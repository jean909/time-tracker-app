const translations = {
  en: {
    // Login page
    appTitle: "Simple Time Tracking",
    appDescription: "Time tracking app for tablets with kiosk and admin mode.",
    kioskEntry: "Kiosk Entry",
    kioskDescription: "Used on the entrance tablet.",
    openKiosk: "Open Kiosk",
    adminEntry: "Admin Entry",
    username: "Username",
    password: "Password",
    loginAdmin: "Login Admin",
    invalidCredentials: "Invalid credentials.",

    // Kiosk page
    kioskMode: "Kiosk Mode",
    back: "Back",
    admin: "Admin",
    selectName: "Select a name.",
    tapForEntry: "Tap on name for entry/exit/return.",
    atWork: "At work",
    away: "Away",
    enteredWork: "entered work",
    leftWork: "left work",

    // Admin page
    addEmployee: "Add employee",
    employeeName: "Employee name",
    add: "Add",
    currentSituation: "Current situation",
    name: "Name",
    status: "Status",
    totalHours: "Total hours",
    lastEvent: "Last event",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    noEmployees: "No employees exist.",
    recentEvents: "Recent events",
    noEvents: "No events exist.",
    logout: "Logout",
    kiosk: "Kiosk",
    sessions: "sessions",

    // Employee detail
    editTimeTracking: "Edit time tracking",
    backToAdmin: "Back to Admin",
    addManualSession: "Add manual session",
    entry: "Entry",
    exit: "Exit (optional)",
    addSession: "Add session",
    existingSessions: "Existing sessions",
    save: "Save",
    noSessions: "No sessions exist.",
    confirmDelete: "Are you sure you want to delete this session?",
    confirmDeleteEmployee: "Are you sure you want to delete employee {name}? All time tracking data will be lost.",
    invalidData: "The entered data is invalid. Check the format and order of dates.",

    // Status
    IN: "IN",
    OUT: "OUT",

    // Event types
    MANUAL_ADD: "MANUAL_ADD",
    MANUAL_DELETE: "MANUAL_DELETE",
    MANUAL_EDIT: "MANUAL_EDIT",
  },
  de: {
    // Login page
    appTitle: "Einfache Zeiterfassung",
    appDescription: "Zeiterfassungsapp für Tablets mit Kiosk- und Admin-Modus.",
    kioskEntry: "Kiosk-Zugang",
    kioskDescription: "Wird am Eingangstablet verwendet.",
    openKiosk: "Kiosk öffnen",
    adminEntry: "Admin-Zugang",
    username: "Benutzername",
    password: "Passwort",
    loginAdmin: "Admin Login",
    invalidCredentials: "Ungültige Anmeldedaten.",

    // Kiosk page
    kioskMode: "Kiosk-Modus",
    back: "Zurück",
    admin: "Admin",
    selectName: "Wählen Sie einen Namen.",
    tapForEntry: "Auf Namen tippen für Ein-/Aus-/Rückkehr.",
    atWork: "Bei der Arbeit",
    away: "Weg",
    enteredWork: "hat die Arbeit begonnen",
    leftWork: "hat die Arbeit verlassen",

    // Admin page
    addEmployee: "Mitarbeiter hinzufügen",
    employeeName: "Mitarbeitername",
    add: "Hinzufügen",
    currentSituation: "Aktuelle Situation",
    name: "Name",
    status: "Status",
    totalHours: "Gesamtstunden",
    lastEvent: "Letztes Ereignis",
    actions: "Aktionen",
    edit: "Bearbeiten",
    delete: "Löschen",
    noEmployees: "Keine Mitarbeiter vorhanden.",
    recentEvents: "Letzte Ereignisse",
    noEvents: "Keine Ereignisse vorhanden.",
    logout: "Abmelden",
    kiosk: "Kiosk",
    sessions: "Sitzungen",

    // Employee detail
    editTimeTracking: "Zeiterfassung bearbeiten",
    backToAdmin: "Zurück zu Admin",
    addManualSession: "Manuelle Sitzung hinzufügen",
    entry: "Eintritt",
    exit: "Austritt (optional)",
    addSession: "Sitzung hinzufügen",
    existingSessions: "Bestehende Sitzungen",
    save: "Speichern",
    noSessions: "Keine Sitzungen vorhanden.",
    confirmDelete: "Sind Sie sicher, dass Sie diese Sitzung löschen möchten?",
    confirmDeleteEmployee: "Sind Sie sicher, dass Sie Mitarbeiter {name} löschen möchten? Alle Zeiterfassungsdaten gehen verloren.",
    invalidData: "Die eingegebenen Daten sind ungültig. Überprüfen Sie Format und Reihenfolge der Daten.",

    // Status
    IN: "EIN",
    OUT: "AUS",

    // Event types
    MANUAL_ADD: "MANUELL_HINZUGEFÜGT",
    MANUAL_DELETE: "MANUELL_GELÖSCHT",
    MANUAL_EDIT: "MANUELL_BEARBEITET",
  }
};

let currentLanguage = 'de'; // German as default

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('preferred_language', lang);
  }
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function t(key, replacements = {}) {
  const translation = translations[currentLanguage]?.[key] || translations.de[key] || key;
  
  // Simple string replacement for placeholders like {name}
  return Object.keys(replacements).reduce((str, placeholder) => {
    return str.replace(`{${placeholder}}`, replacements[placeholder]);
  }, translation);
}

export function initLanguage() {
  const saved = localStorage.getItem('preferred_language');
  // Default to German, only use English if explicitly saved
  setLanguage(saved || 'de');
}

export function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' }
  ];
}