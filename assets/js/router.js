// router.js
// A lightweight PJAX implementation for seamless navigation

document.addEventListener('DOMContentLoaded', () => {
  // Listen for link clicks
  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    
    const href = a.getAttribute('href');
    // Ignore external links, anchor links, or links with target="_blank"
    if (!href || href.startsWith('http') || href.startsWith('#') || a.target === '_blank') return;
    
    e.preventDefault();
    navigate(href);
  });
});

async function navigate(url, push = true) {
  try {
    // Optional: show a tiny loading indicator
    document.body.style.cursor = 'wait';
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    const html = await res.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 1. Swap <title>
    document.title = doc.title;
    
    // 2. Swap <main> content
    const newMain = doc.querySelector('main');
    const oldMain = document.querySelector('main');
    if (newMain && oldMain) {
      oldMain.replaceWith(newMain);
    }
    
    // 3. Diff and add missing scripts from <head>
    const oldHeadScripts = Array.from(document.head.querySelectorAll('script'));
    const newHeadScripts = Array.from(doc.head.querySelectorAll('script'));
    
    newHeadScripts.forEach(newScript => {
      // Check if we already have this script
      const exists = oldHeadScripts.some(old => old.src && old.src === newScript.src);
      if (!exists && newScript.src) {
        const s = document.createElement('script');
        Array.from(newScript.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
        s.textContent = newScript.textContent;
        document.head.appendChild(s);
      }
    });

    // 4. Execute scripts inside the new <main> if any
    const mainScripts = document.querySelector('main').querySelectorAll('script');
    mainScripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
    
    // 5. Update Sidebar Active State
    updateSidebar(url);
    
    // 6. Update History
    if (push) {
      history.pushState({ url }, '', url);
    }
    
    // 7. Fire custom event to re-initialize page-specific JS
    window.dispatchEvent(new Event('pageChanged'));
    
  } catch (err) {
    console.error('Navigation error, falling back to full reload:', err);
    window.location.href = url;
  } finally {
    document.body.style.cursor = 'default';
  }
}

// Handle Browser Back/Forward buttons
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.url) {
    navigate(e.state.url, false);
  } else {
    navigate(location.pathname, false);
  }
});

function updateSidebar(url) {
  const links = document.querySelectorAll('aside nav a');
  // Get just the filename
  const targetUrl = url.split('/').pop() || 'dashboard_akademik_utama.html';
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === targetUrl) {
      // Active class
      link.className = "flex items-center gap-space-sm px-space-sm py-space-xs rounded-xl transition-all duration-200 bg-primary-container text-on-primary-container font-semibold shadow-[0_0_24px_-4px_rgba(128,131,255,0.35)]";
      link.setAttribute('aria-current', 'page');
    } else {
      // Inactive class
      link.className = "flex items-center gap-space-sm px-space-sm py-space-xs rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200";
      link.removeAttribute('aria-current');
    }
  });
}
