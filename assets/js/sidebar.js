// sidebar.js
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('aside');
  if (!sidebar) return;

  // Set initial state for responsive
  sidebar.classList.add('-translate-x-full', 'lg:translate-x-0', 'transition-transform', 'duration-300');

  // Find or create header for hamburger button in mobile
  let mainContent = document.querySelector('main');
  if (!mainContent) {
    const mainWrapper = document.querySelector('.min-w-0.flex-1.flex.flex-col');
    if (mainWrapper) mainContent = mainWrapper.querySelector('.relative.w-full.overflow-hidden') || mainWrapper;
  }

  // Create hamburger toggle button container for mobile
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'lg:hidden p-4 flex items-center justify-between bg-surface-container-lowest border-b border-surface-container sticky top-0 z-40 shadow-sm';
  
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center';
  toggleBtn.innerHTML = '<span class="material-symbols-outlined text-[24px]">menu</span>';
  
  const brandLabel = document.createElement('span');
  brandLabel.className = 'font-headline-sm text-headline-sm text-on-surface font-semibold';
  brandLabel.textContent = 'AcademIQ';

  toggleContainer.appendChild(toggleBtn);
  toggleContainer.appendChild(brandLabel);

  // Insert at the top of the content area
  if (mainContent && mainContent.parentElement) {
    mainContent.parentElement.insertBefore(toggleContainer, mainContent);
  } else {
    document.body.insertBefore(toggleContainer, document.body.firstChild);
  }

  // Create overlay backdrop
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm z-40 hidden transition-opacity opacity-0 lg:hidden';
  document.body.appendChild(overlay);

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

  toggleBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);

  // Add Close Button inside Sidebar for mobile
  const sidebarHeader = sidebar.querySelector('a[href="dashboard_akademik_utama.html"]');
  if (sidebarHeader) {
    const closeSidebarBtn = document.createElement('button');
    closeSidebarBtn.className = 'lg:hidden ml-auto p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center';
    closeSidebarBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">close</span>';
    closeSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
    sidebarHeader.appendChild(closeSidebarBtn);
  }
});