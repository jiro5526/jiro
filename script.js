(() => {
  const modal = document.getElementById('modal');
  const panel = modal?.querySelector('.modal__panel');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  let lastFocus = null;

  if (!modal || !panel || !title || !body) return;

  const openModal = (trigger) => {
    lastFocus = trigger;
    title.textContent = trigger.dataset.modalTitle || '準備中です';
    body.textContent = trigger.dataset.modalBody || 'リンク先は準備中です。';
    modal.hidden = false;
    document.body.classList.add('modal-open');
    panel.focus({ preventScroll: true });
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
    }
  };

  document.querySelectorAll('[data-modal-title], [data-modal-body]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const href = trigger.getAttribute('href');
      if (href && href.startsWith('#')) {
        event.preventDefault();
      }
      openModal(trigger);
    });
  });

  modal.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.hasAttribute('data-close-modal')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
})();
