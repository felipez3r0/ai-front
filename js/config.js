const BASE_URL = 'http://localhost:3000';

async function fetchAPI(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || response.statusText);
  }

  return response.json();
}

function showToast(message, type = 'success') {
  const icon = type === 'success' ? '✓' : '✗';
  const bg = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-2 px-4 py-3 rounded shadow-lg text-white text-sm ${bg} opacity-0 transition-opacity duration-300`;
  toast.innerHTML = `<span class="font-bold text-base">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.replace('opacity-0', 'opacity-100'));
  });

  setTimeout(() => {
    toast.classList.replace('opacity-100', 'opacity-0');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}
