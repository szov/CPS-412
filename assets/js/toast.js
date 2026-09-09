import { elements } from './dom.js';

export function showToast(message, type = 'info', duration = 3000) {
  if (!elements.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const dot = document.createElement('span');
  dot.className = 'toast-dot';
  dot.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'toast-message';
  text.textContent = message;

  const close = document.createElement('button');
  close.className = 'toast-close';
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Dismiss');
  close.addEventListener('click', () => toast.remove());

  toast.append(dot, text, close);
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
