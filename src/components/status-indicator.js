import database from '../utils/database.js';

export function createStatusIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'status-indicator';
  indicator.innerHTML = `
    <div class="status-dot offline"></div>
    <span class="status-text">Local</span>
  `;
  
  updateStatus();
  
  // Check status every 30 seconds
  setInterval(updateStatus, 30000);
  
  // Listen for online/offline events
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  
  async function updateStatus() {
    const dot = indicator.querySelector('.status-dot');
    const text = indicator.querySelector('.status-text');
    
    if (!navigator.onLine) {
      dot.className = 'status-dot offline';
      text.textContent = 'Offline';
      return;
    }
    
    if (!database.shouldUseDatabase()) {
      dot.className = 'status-dot local';
      text.textContent = 'Local';
      return;
    }
    
    try {
      // Quick health check
      await database.getEmployees();
      dot.className = 'status-dot online';
      text.textContent = 'Online';
    } catch (error) {
      dot.className = 'status-dot error';
      text.textContent = 'Error';
    }
  }
  
  return indicator;
}

// Add status indicator to page
export function addStatusIndicator() {
  const indicator = createStatusIndicator();
  document.body.appendChild(indicator);
}