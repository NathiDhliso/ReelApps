const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getVersion: () => process.env.npm_package_version,
  getPlatform: () => process.platform,
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Theme detection
  isDarkMode: () => ipcRenderer.invoke('dark-mode:toggle'),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // File operations (for future use)
  selectFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
});

// Add custom styling for desktop app
document.addEventListener('DOMContentLoaded', () => {
  // Add desktop-specific CSS class
  document.body.classList.add('desktop-app');
  
  // Add custom styles for desktop
  const style = document.createElement('style');
  style.textContent = `
    .desktop-app {
      /* Custom scrollbar for desktop */
      scrollbar-width: thin;
      scrollbar-color: var(--border-primary) transparent;
    }
    
    .desktop-app ::-webkit-scrollbar {
      width: 8px;
    }
    
    .desktop-app ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .desktop-app ::-webkit-scrollbar-thumb {
      background-color: var(--border-primary);
      border-radius: 4px;
    }
    
    .desktop-app ::-webkit-scrollbar-thumb:hover {
      background-color: var(--text-muted);
    }
    
    /* Desktop-specific navigation adjustments */
    .desktop-app .navbar {
      -webkit-app-region: drag;
    }
    
    .desktop-app .navbar button,
    .desktop-app .navbar a {
      -webkit-app-region: no-drag;
    }
  `;
  document.head.appendChild(style);
});