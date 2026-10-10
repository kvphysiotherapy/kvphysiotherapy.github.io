const reviews = [
  { text: 'I attended physiotherapy sessions for one month after my knee replacement surgery, and I’m really happy with the progress. The therapist was patient, supportive, and explained every exercise clearly. I can now walk more confidently and my knee movement has improved a lot compared to the beginning. The staff was also friendly and motivating throughout the recovery process. Thank you for the care and support during my rehabilitation.', title: 'Knee replacement recovery', by: 'Patient feedback' },
  { text: "Thank you so much Vijaya ma'am...your physiotherapy session was best...my father is recovering fast and we can see daily improvements in his activity....Thanks alot", title: 'Progress in everyday activity', by: 'Patient’s family' },
  { text: 'The physio session was really helpful and well-guided. She felt comfortable throughout, and the exercises were explained clearly. Thank you for the support and care!', title: 'Comfort through guided care', by: 'Patient’s family' },
  { text: 'Thank you so much for your guidance, support, and care throughout the sessions. We truly appreciate the time and effort you have invested in her recovery. Thank you!', title: 'Support at every step', by: 'Patient’s family' },
  { text: "It's really nice and worth it ... You worked on all needed point and overall strength and developement", title: 'Strength and movement', by: 'Patient feedback' },
  { text: "The physiotherapy sessions after my mother's knee replacement surgery were very good and helpful. The therapist was supportive, patient, and guided her properly throughout the recovery. We saw good improvement in her knee movement, strength, and walking. Overall, we are very satisfied with the treatment and would highly recommend the therapist.", title: 'A mother’s recovery', by: 'Patient’s family' }
];
const track = document.querySelector('#review-track');
for (const review of reviews) {
    const card = document.createElement('article'); card.className = 'review-card';
    const quote = document.createElement('span'); quote.className = 'quote-mark'; quote.textContent = '“'; quote.setAttribute('aria-hidden', 'true');
    const text = document.createElement('blockquote'); text.textContent = review.text;
    const footer = document.createElement('footer');
    const title = document.createElement('strong'); title.textContent = review.title;
    footer.append(title, document.createTextNode(review.by)); card.append(quote, text, footer); track.append(card);
}
document.querySelector('#year').textContent = new Date().getFullYear();
const menu = document.querySelector('.menu-toggle'); const nav = document.querySelector('#navigation');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
const pause = document.querySelector('#review-pause');
const viewport = document.querySelector('.review-viewport');
const cards = [...track.children];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let reviewIndex = 0, reviewTimer, reviewPaused = reducedMotion.matches, reviewVisible = false, reviewHovered = false;
const controls = document.createElement('div'); controls.className = 'review-controls';
const previous = document.createElement('button'); previous.type = 'button'; previous.textContent = '←'; previous.setAttribute('aria-label', 'Previous patient review');
const position = document.createElement('span');
const next = document.createElement('button'); next.type = 'button'; next.textContent = '→'; next.setAttribute('aria-label', 'Next patient review');
controls.append(previous, position, next); viewport.after(controls);
function showReview(index) {
  reviewIndex = (index + cards.length) % cards.length;
  cards.forEach((card, i) => { card.hidden = i !== reviewIndex; card.setAttribute('aria-hidden', String(i !== reviewIndex)); });
  position.textContent = `${reviewIndex + 1} / ${cards.length}`;
}
function scheduleReview() {
  clearTimeout(reviewTimer);
  if (!reviewPaused && reviewVisible && !reviewHovered && !document.hidden && !viewport.matches(':focus-within')) {
    reviewTimer = setTimeout(() => { showReview(reviewIndex + 1); scheduleReview(); }, 1500);
  }
}
function updatePause() {
  pause.setAttribute('aria-pressed', String(reviewPaused));
  pause.textContent = reviewPaused ? 'Play stories ▷' : 'Pause stories Ⅱ';
  viewport.setAttribute('aria-live', reviewPaused ? 'polite' : 'off');
  scheduleReview();
}
pause.addEventListener('click', () => { reviewPaused = !reviewPaused; updatePause(); });
previous.addEventListener('click', () => { showReview(reviewIndex - 1); scheduleReview(); });
next.addEventListener('click', () => { showReview(reviewIndex + 1); scheduleReview(); });
viewport.addEventListener('mouseenter', () => { reviewHovered = true; scheduleReview(); });
viewport.addEventListener('mouseleave', () => { reviewHovered = false; scheduleReview(); });
viewport.addEventListener('focusin', scheduleReview);
viewport.addEventListener('focusout', () => setTimeout(scheduleReview, 0));
document.addEventListener('visibilitychange', scheduleReview);
reducedMotion.addEventListener('change', () => { reviewPaused = reducedMotion.matches; updatePause(); });
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { reviewVisible = entries[0].isIntersecting; scheduleReview(); }, { threshold: 0.25 }).observe(viewport);
} else { reviewVisible = true; }
showReview(0); updatePause();
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(section => { section.classList.add('js-reveal'); observer.observe(section); });
}
const dialog = document.querySelector('#callback-dialog'); const form = document.querySelector('#callback-form');
const status = document.querySelector('#form-status'); const submit = form.querySelector('[type=submit]'); let opener;
document.querySelectorAll('[data-callback]').forEach(button => button.addEventListener('click', () => {
  opener = button; dialog.showModal();
  if (!window.KV_CONFIG?.callbackEndpoint) { status.textContent = 'Online callback requests are awaiting setup. Please call Dr. Vijaya on 93098 13423 to arrange your visit.'; submit.disabled = true; }
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
dialog.addEventListener('close', () => opener?.focus());
form.addEventListener('submit', async event => {
  event.preventDefault(); const endpoint = window.KV_CONFIG?.callbackEndpoint;
  if (!endpoint || !form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form)); const digits = data.phone.replace(/\D/g, '');
  if (data.website) { status.textContent = 'Please try again or call Dr. Vijaya directly.'; return; }
  if (digits.length < 10 || digits.length > 15) { status.textContent = 'Please enter a valid phone number with 10–15 digits.'; return; }
  submit.disabled = true; status.textContent = 'Sending your request…';
  try {
    const isFormSubmit = window.KV_CONFIG.callbackProvider === 'formsubmit';
    const payload = isFormSubmit ? {
      name: data.name, phone: data.phone, area: data.area,
      'Preferred call time (India)': data.time,
      message: data.message || 'Not provided',
      consent: 'Client agreed to be contacted about this enquiry.',
      _subject: 'KV Physiotherapy — new callback request',
      _template: 'table', _honey: data.website
    } : data;
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Request failed');
    const result = await response.json();
    if (isFormSubmit && result.success !== true && result.success !== 'true') throw new Error('Submission not accepted');
    if (!isFormSubmit && result.ok !== true) throw new Error('Submission not accepted');
    status.textContent = 'Your request has been submitted. For time-sensitive enquiries, please call 93098 13423 directly.'; form.reset();
  } catch { status.textContent = 'We could not confirm delivery. Please call 93098 13423, or try again later.'; }
  finally { submit.disabled = false; }
});
