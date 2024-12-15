const form = document.querySelector('#co2-shield');
const input = form.querySelector('input');
const button = form.querySelector('button');

form.onsubmit = e => { e.preventDefault(); generate(); };
input.onkeypress = e => { if (e.key === 'Enter') { e.preventDefault(); generate(); } };

const ratingDetails = {
  'a+': ['#58C521', 'Less than 0.095g'],
  'a': ['#20AE69', 'Less than 0.185g'],
  'b': ['#2D8EAC', 'Less than 0.34g'],
  'c': ['#C89806', 'Less than 0.49g'],
  'd': ['#C05328', 'Less than 0.65g'],
  'e': ['#B71E1E', 'Less than 0.85g'],
  'f': ['#652A2A', 'Above 0.85g']
};

async function generate() {
  let url = input.value.trim();
  if (!url) return alert('Please enter a valid URL');
  url = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  button.disabled = 1;
  let dots = 0;
  button.innerHTML = 'Loading...';
  const loadingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    button.innerHTML = `Loading${'.'.repeat(dots)}`;
  }, 350);

  try {
    const { co2, rating } = await fetchCO2(url);
    const [color, details] = ratingDetails[rating.toLowerCase()];
    const shieldUrl = `https://img.shields.io/badge/CO₂-${rating.toUpperCase()}_${parseFloat(co2).toFixed(rating === 'a+' ? 3 : 2).replace(/ /g, '_')}g-${color.replace('#', '')}`;
    const markdown = `[![CO₂ Shield](${shieldUrl})](https://overbrowsing.com/projects/co2-shield)`;
    updateUI({ shieldUrl, markdown, details }, url);
  } catch {
    alert('Invalid URL. Please try again.');
  } finally {
    clearInterval(loadingInterval);
    button.innerHTML = 'Submit';
    button.disabled = 0;
    input.value = '';
  }
}

async function fetchCO2(url) {
  const res = await fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(url)}`);
  return res.ok ? res.json() : Promise.reject();
}

function updateUI({ shieldUrl, markdown, details }, targetUrl) {
  const formSection = form.closest('section');
  formSection.insertAdjacentHTML('beforeend', `
    <div id="result">
      <h2>Results</h2>
      <p>${targetUrl} • ${details}</p>
      <img src="${shieldUrl}" alt="CO₂ Shield" style="display:block;width:auto;height:20px">
      <pre>${markdown}</pre>
      <button onclick="copy()">Copy</button>
    </div>`);
  form.style.display = 'none';
  if (!document.getElementById('ratings')) {
    formSection.insertAdjacentHTML('afterend', `
    <section id="ratings">
      <h2>Ratings</h2>
      ${Object.keys(ratingDetails).map(rating => {
        const [color, details] = ratingDetails[rating];
        return `<div><span style="color:${color};">●</span> ${rating.toUpperCase()} • ${details}</div>`;
      }).join('')}
      <button onclick="reset()">Reset</button>
    </section>`);
  }
}

function copy() {
  navigator.clipboard.writeText(document.querySelector('pre').textContent).then(() => {
    const copyButton = document.querySelector('button[onclick="copy()"]');
    copyButton.textContent = 'Copied';
    setTimeout(() => copyButton.textContent = 'Copy', 1500);
  });
}

function reset() {
  form.style.display = 'flex';
  document.getElementById('result')?.remove();
  document.getElementById('ratings')?.remove();
}