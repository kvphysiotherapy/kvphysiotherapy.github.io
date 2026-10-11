(() => {
  const config = window.KV_CONFIG?.reviews;
  const dialog = document.querySelector('#review-dialog');
  const form = document.querySelector('#review-form');
  const status = document.querySelector('#review-status');
  const submit = form.querySelector('[type=submit]');
  const listStatus = document.querySelector('#reviews-load-status');
  const enabled = Boolean(config?.url && config?.publishableKey);
  let opener, saving = false, requestId = null, visitorId, mutationVersion = 0;
  try { visitorId = localStorage.getItem('kv-review-visitor'); } catch {}
  if (!visitorId || !/^[0-9a-f-]{36}$/i.test(visitorId)) {
    visitorId = crypto.randomUUID();
    try { localStorage.setItem('kv-review-visitor', visitorId); } catch {}
  }
  async function rpc(name, data) {
    const headers = { 'Content-Type': 'application/json', apikey: config.publishableKey };
    // Legacy anon JWTs need Authorization; new publishable keys must not be used as bearer tokens.
    if (config.publishableKey.startsWith('eyJ')) headers.Authorization = `Bearer ${config.publishableKey}`;
    const response = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
      method: 'POST', headers, body: JSON.stringify(data), signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result?.message || 'Request failed'); error.code = result?.code; throw error;
    }
    if (!Array.isArray(result)) throw new Error('Unexpected response');
    return result;
  }
  async function refresh() {
    if (!enabled || document.hidden || saving) return;
    const version = mutationVersion;
    try {
      const rows = await rpc('get_patient_reviews', {});
      if (saving || version !== mutationVersion) return;
      // Reconcile deletions as well as additions, so removed reviews leave open visitors' pages.
      const ids = new Set(rows.map(row => row.id));
      document.querySelectorAll('[data-review-id]').forEach(card => {
        if (!ids.has(card.dataset.reviewId)) window.KV_REVIEWS.remove(card.dataset.reviewId);
      });
      window.KV_REVIEWS.add(rows); listStatus.textContent = '';
    } catch { listStatus.textContent = 'New patient stories are temporarily unavailable. Existing stories are still available.'; }
  }
  document.querySelectorAll('[data-add-review]').forEach(button => button.addEventListener('click', () => {
    opener = button; dialog.showModal();
    if (!enabled) { status.textContent = 'Online reviews are awaiting setup. Please check back soon.'; submit.disabled = true; }
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => { if (!saving) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (saving) event.preventDefault(); });
  dialog.addEventListener('close', () => opener?.focus());
  form.addEventListener('input', () => { if (!saving) requestId = null; });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (!enabled || saving || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const name = data.display_name.trim(), body = data.body.trim();
    if (name.length < 2 || body.length < 20) { status.textContent = 'Please enter a display name of at least 2 characters and a review of at least 20 characters.'; return; }
    if (data.website) { status.textContent = 'Your review could not be submitted. Please try again.'; return; }
    requestId ||= crypto.randomUUID(); saving = true; submit.disabled = true;
    const fields = [...form.querySelectorAll('input, textarea')]; fields.forEach(field => field.disabled = true);
    status.textContent = 'Saving your review…';
    try {
      const rows = await rpc('submit_patient_review', {
        p_id: requestId, p_visitor: visitorId, p_name: name, p_body: body,
        p_consent: data.consent === 'on', p_website: data.website || ''
      });
      if (rows.length !== 1 || rows[0].id !== requestId) throw new Error('Review not confirmed');
      mutationVersion++; window.KV_REVIEWS.add(rows); window.KV_REVIEWS.showLatest();
      status.textContent = 'Thank you! Your review is published in Stories of Recovery.';
      form.reset(); requestId = null;
    } catch (error) {
      status.textContent = error.code === 'P0001' && /wait/i.test(error.message)
        ? 'Please wait one minute before posting another review.'
        : 'We could not confirm your review was saved. Your text is still here; please try again.';
    } finally { saving = false; fields.forEach(field => field.disabled = false); submit.disabled = false; }
  });
  refresh();
  setInterval(refresh, 30000);
  document.addEventListener('visibilitychange', refresh);
})();
