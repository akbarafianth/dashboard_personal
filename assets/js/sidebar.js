// sidebar.js
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('aside');
  if (!sidebar) return;

  // Set initial state for responsive
  sidebar.classList.add('-translate-x-full', 'lg:translate-x-0', 'transition-transform', 'duration-300');

  // Create overlay backdrop if not exists
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay fixed inset-0 bg-background/80 backdrop-blur-sm z-40 hidden transition-opacity opacity-0 lg:hidden';
    document.body.appendChild(overlay);
  }

  // Toggle Logic
  let isOpen = false;
  
  const toggleSidebar = () => {
    isOpen = !isOpen;
    if (isOpen) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
      overlay.classList.remove('hidden');
      // small delay to allow display:block to apply before animating opacity
      requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
      });
    } else {
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('-translate-x-full');
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0');
      setTimeout(() => overlay.classList.add('hidden'), 300);
    }
  };

  // Find the hamburger button we injected via HTML
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar);
  }
  
  overlay.addEventListener('click', toggleSidebar);

  // Add Close Button inside Sidebar for mobile header
  const sidebarHeader = sidebar.querySelector('a[href="dashboard_akademik_utama.html"]');
  if (sidebarHeader && !sidebarHeader.querySelector('.sidebar-close-btn')) {
    const closeSidebarBtn = document.createElement('button');
    closeSidebarBtn.className = 'sidebar-close-btn lg:hidden ml-auto p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center';
    closeSidebarBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">close</span>';
    closeSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
    sidebarHeader.appendChild(closeSidebarBtn);
  }
});
