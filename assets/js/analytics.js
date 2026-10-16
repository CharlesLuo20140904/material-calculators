const MEASUREMENT_ID = 'G-554TWQ868E';
const CONSENT_KEY = 'project-matter-analytics-consent';
const PANEL_ID = 'analytics-consent-panel';

function siteRoot() {
  const repositoryPath = '/material-calculators/';
  return window.location.pathname.startsWith(repositoryPath) ? repositoryPath : '/';
}

function consentState(analyticsStorage) {
  return {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsStorage,
  };
}

function prepareGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', consentState('denied'));
}

function readConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    return;
  }
}

function loadGoogleTag() {
  if (document.querySelector(`[data-google-tag="${MEASUREMENT_ID}"]`)) return;
  window.gtag('consent', 'update', consentState('granted'));
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.dataset.googleTag = MEASUREMENT_ID;
  document.head.append(script);
}

function clearAnalyticsCookies() {
  const paths = ['/', siteRoot()];
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0].trim();
    if (!name.startsWith('_ga')) return;
    paths.forEach((path) => {
      document.cookie = `${name}=; Max-Age=0; Path=${path}; SameSite=Lax`;
    });
  });
}

function closePanel() {
  document.getElementById(PANEL_ID)?.remove();
}

function applyChoice(choice) {
  saveConsent(choice);
  window.gtag('consent', 'update', consentState(choice));
  closePanel();
  if (choice === 'granted') loadGoogleTag();
  if (choice === 'denied') clearAnalyticsCookies();
}

function panelMarkup() {
  return `
    <div class="consent-copy">
      <p class="consent-kicker">Private by default</p>
      <h2 id="analytics-consent-title">Help us improve Project Matter?</h2>
      <p>With your permission, Google Analytics records visits and anonymous interactions. Calculator measurements are never sent.</p>
      <a href="${siteRoot()}privacy/">Read privacy details</a>
    </div>
    <div class="consent-actions">
      <button type="button" data-consent-choice="granted">Allow analytics</button>
      <button type="button" class="consent-secondary" data-consent-choice="denied">Decline</button>
      <button type="button" class="consent-later" data-consent-close>Not now</button>
    </div>`;
}

function showConsentPanel() {
  const existing = document.getElementById(PANEL_ID);
  if (existing) {
    existing.querySelector('button')?.focus();
    return;
  }
  const panel = document.createElement('aside');
  panel.id = PANEL_ID;
  panel.className = 'consent-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'analytics-consent-title');
  panel.innerHTML = panelMarkup();
  panel.querySelectorAll('[data-consent-choice]').forEach((button) => {
    button.addEventListener('click', () => applyChoice(button.dataset.consentChoice));
  });
  panel.querySelector('[data-consent-close]').addEventListener('click', closePanel);
  document.body.append(panel);
}

function bindConsentSettings() {
  document.querySelectorAll('[data-consent-settings]').forEach((button) => {
    button.addEventListener('click', showConsentPanel);
  });
}

export function trackAnalytics(eventName, parameters = {}) {
  if (readConsent() !== 'granted') return;
  window.gtag('event', eventName, parameters);
}

function initializeAnalytics() {
  prepareGtag();
  bindConsentSettings();
  const choice = readConsent();
  if (choice === 'granted') loadGoogleTag();
  if (!choice) showConsentPanel();
}

initializeAnalytics();
