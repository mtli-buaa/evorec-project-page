const copy = document.querySelector('#copy');
copy.addEventListener('click', async () => {
  await navigator.clipboard.writeText(document.querySelector('#bibtex').innerText);
  const old = copy.textContent; copy.textContent = 'Copied!';
  setTimeout(() => copy.textContent = old, 1400);
});

const progressBar = document.querySelector('#scroll-progress-bar');
const backToTop = document.querySelector('#back-to-top');
const updateScrollUI = () => {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const ratio = scrollable > 0 ? scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${ratio})`;
  backToTop.classList.toggle('visible', scrollY > 640);
};
addEventListener('scroll', updateScrollUI, { passive: true });
addEventListener('resize', updateScrollUI);
updateScrollUI();
backToTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

const revealTargets = document.querySelectorAll('section, .hero-figure');
revealTargets.forEach((node) => node.classList.add('reveal'));
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
  revealTargets.forEach((node) => observer.observe(node));
} else {
  revealTargets.forEach((node) => node.classList.add('revealed'));
}

const sectionLinks = [...document.querySelectorAll('.section-nav a')];
const linkedSections = sectionLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
  }, { rootMargin: '-18% 0px -65%', threshold: [0, 0.2, 0.5] });
  linkedSections.forEach((section) => navObserver.observe(section));
}

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
const lightboxClose = document.querySelector('#lightbox-close');
let previousFocus = null;
const closeLightbox = () => {
  lightbox.classList.remove('open');
  document.body.classList.remove('lightbox-open');
  setTimeout(() => { lightbox.hidden = true; lightboxImage.src = ''; }, 180);
  previousFocus?.focus();
};
document.querySelectorAll('.figure > a').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    previousFocus = link;
    const image = link.querySelector('img');
    const caption = link.closest('.figure')?.querySelector('figcaption');
    lightboxImage.src = link.getAttribute('href');
    lightboxImage.alt = image?.alt || 'Full-resolution figure';
    lightboxCaption.textContent = caption?.textContent || '';
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    requestAnimationFrame(() => lightbox.classList.add('open'));
    lightboxClose.focus();
  });
});
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
addEventListener('keydown', (event) => { if (event.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

const caseFlow = document.querySelector('#case-flow');
const reasoningCanvas = document.querySelector('#reasoning-canvas');
const caseAction = document.querySelector('#case-action');
const caseReset = document.querySelector('#case-reset');
const caseStageCaption = document.querySelector('#case-stage-caption');
const shortTermMemory = document.querySelector('#short-term-memory');
const shortTermToggle = document.querySelector('#short-term-toggle');
const longTermMemory = document.querySelector('#long-term-memory');
const reasoningLines = reasoningCanvas.querySelector('.reasoning-lines');
const inferenceHub = reasoningCanvas.querySelector('.inference-hub');
const needNodes = [...reasoningCanvas.querySelectorAll('.need-node')];
const needBudgetPaths = [...reasoningLines.querySelectorAll('.need-budget-paths path')];
const needSatisfactionRoute = reasoningCanvas.querySelector('.ns-route');
const memoryInputs = [
  [reasoningCanvas.querySelector('.lt-memory-v2'), reasoningLines.querySelector('.long-input')],
  [reasoningCanvas.querySelector('.st-memory-v2'), reasoningLines.querySelector('.short-input')],
  [reasoningCanvas.querySelector('.wm-memory-v2'), reasoningLines.querySelector('.working-input')]
];

const updateMemoryConnectors = () => {
  const canvasRect = reasoningCanvas.getBoundingClientRect();
  const hubRect = inferenceHub.getBoundingClientRect();
  if (!canvasRect.width || !canvasRect.height) return;
  const scaleX = 1000 / canvasRect.width;
  const scaleY = 900 / canvasRect.height;
  const targetX = (hubRect.left - canvasRect.left + 2) * scaleX;
  const targetY = (hubRect.top - canvasRect.top + hubRect.height / 2) * scaleY;
  memoryInputs.forEach(([card, path]) => {
    const rect = card.getBoundingClientRect();
    const startX = (rect.right - canvasRect.left - 2) * scaleX;
    const startY = (rect.top - canvasRect.top + rect.height / 2) * scaleY;
    const bend = Math.max(28, (targetX - startX) * 0.48);
    path.setAttribute('d', `M${startX.toFixed(1)} ${startY.toFixed(1)} C${(startX + bend).toFixed(1)} ${startY.toFixed(1)} ${(targetX - bend).toFixed(1)} ${targetY.toFixed(1)} ${targetX.toFixed(1)} ${targetY.toFixed(1)}`);
  });
  const routeRect = needSatisfactionRoute.getBoundingClientRect();
  const routeX = (routeRect.left - canvasRect.left + routeRect.width * .72) * scaleX;
  const routeY = (routeRect.top - canvasRect.top + 2) * scaleY;
  needNodes.forEach((node, index) => {
    const rect = node.getBoundingClientRect();
    const startX = (rect.right - canvasRect.left - 3) * scaleX;
    const startY = (rect.top - canvasRect.top + rect.height / 2) * scaleY;
    const spreadX = routeX + (index - 2.5) * 5;
    const controlY = startY + Math.max(35, (routeY - startY) * .48);
    needBudgetPaths[index].setAttribute('d', `M${startX.toFixed(1)} ${startY.toFixed(1)} C${(startX + 38).toFixed(1)} ${startY.toFixed(1)} ${spreadX.toFixed(1)} ${controlY.toFixed(1)} ${spreadX.toFixed(1)} ${routeY.toFixed(1)}`);
  });
};

addEventListener('resize', updateMemoryConnectors);
if ('ResizeObserver' in window) {
  const connectorObserver = new ResizeObserver(() => requestAnimationFrame(updateMemoryConnectors));
  connectorObserver.observe(reasoningCanvas);
  connectorObserver.observe(shortTermMemory);
  connectorObserver.observe(longTermMemory);
}
let caseStep = 0;
let caseTransitioning = false;
const caseActions = [
  { button: 'Infer Needs', title: 'Memory context', detail: 'Long-term profile, short-term behavior, and working context jointly support need inference.' },
  { button: 'Open Recall Routes', title: 'Needs inferred from memory', detail: 'The Need Agent combines stable traits with recent timestamped P3S interactions.' },
  { button: 'Call Tools', title: 'Two recall routes', detail: 'Behavior evidence flows to BC; six inferred needs flow to NS.' },
  { button: 'Run Retrieval', title: 'Tools are assigned to each route', detail: 'Item-CF, User-CF, and Embedding flow to BC; Embedding, BM25, and OneReason flow to NS.' },
  { button: 'Merge & Rank', title: 'Two-route retrieval completes', detail: 'BC recalls 1,800 candidates and NS recalls 1,200 candidates.' },
  { button: 'Enter Reflection Tree', title: '3,000 candidates returned', detail: 'The ranked recommendation list still misses the converted phone-rental item.' },
  { button: 'Match Error Type', title: 'Feedback enters the Dynamic Reflection Tree', detail: 'The tree compares the observed miss with memory, need, planning, and execution error families.' },
  { button: 'Match Leaf Pattern', title: 'ERROR-NEED is selected', detail: 'The converted item is absent because a supported user need never entered the retrieval plan.' },
  { button: 'Generate Repair', title: 'ERROR-NEED-001 is matched', detail: 'The leaf pattern states: supporting evidence is present, but the corresponding need was omitted.' },
  { button: 'Re-run Recommendation', title: 'Repair reinserted into the pipeline', detail: 'The missing phone-rental need is added back to Need Agent output, and the Plan Agent reallocates retrieval budget for replay.' },
  { button: 'Restart', title: 'Reflection repair closes the loop', detail: 'The reflection node enters Working Memory, triggers Need Agent reasoning again, and the rerun returns the correct phone-rental result at Rank 23.' }
];

const showCaseStep = (index) => {
  caseStep = Math.max(0, Math.min(index, caseActions.length - 1));
  // Standalone budget (stage 3) and rank-only (stage 6) pages were removed.
  // Preserve the later visual-stage numbers used by the existing stylesheet.
  reasoningCanvas.dataset.stage = caseStep >= 5 ? caseStep + 2 : caseStep >= 3 ? caseStep + 1 : caseStep;
  caseStageCaption.innerHTML = `<b>${caseActions[caseStep].title}</b><span>${caseActions[caseStep].detail}</span>`;
  caseAction.innerHTML = `${caseActions[caseStep].button} <span>→</span>`;
  caseReset.disabled = caseStep === 0;
  if (caseStep > 0) {
    longTermMemory.removeAttribute('open');
    shortTermMemory.classList.remove('is-open');
    shortTermToggle.setAttribute('aria-expanded', 'false');
  }
};
longTermMemory.addEventListener('toggle', () => {
  if (longTermMemory.open) {
    shortTermMemory.classList.remove('is-open');
    shortTermToggle.setAttribute('aria-expanded', 'false');
  }
  requestAnimationFrame(updateMemoryConnectors);
});
shortTermToggle.addEventListener('click', () => {
  const open = shortTermMemory.classList.toggle('is-open');
  shortTermToggle.setAttribute('aria-expanded', String(open));
  if (open) {
    longTermMemory.removeAttribute('open');
  }
  requestAnimationFrame(updateMemoryConnectors);
});
const advanceCase = () => {
  if (caseTransitioning) return;
  if (caseStep === caseActions.length - 1) {
    showCaseStep(0);
    return;
  }
  caseTransitioning = true;
  caseAction.disabled = true;
  showCaseStep(caseStep + 1);
  setTimeout(() => { caseAction.disabled = false; caseTransitioning = false; }, 900);
};
caseAction.addEventListener('click', advanceCase);
caseReset.addEventListener('click', () => { caseTransitioning = false; caseAction.disabled = false; showCaseStep(0); });
showCaseStep(0);
requestAnimationFrame(updateMemoryConnectors);
