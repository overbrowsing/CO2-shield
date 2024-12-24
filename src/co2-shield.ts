export default class CO2Shield {
  private formContainerId: string;
  private static ratingDetails: { [key: string]: [string, string] } = {
    'a+': ['#58C521', 'Less than 0.095g'],
    'a': ['#20AE69', 'Less than 0.185g'],
    'b': ['#2D8EAC', 'Less than 0.34g'],
    'c': ['#C89806', 'Less than 0.49g'],
    'd': ['#C05328', 'Less than 0.65g'],
    'e': ['#B71E1E', 'Less than 0.85g'],
    'f': ['#652A2A', 'Above 0.85g']
  };

  constructor(formContainerId: string) {
    this.formContainerId = formContainerId;
  }

  initialize(): void {
    this.createForm();
  }

  private createForm(): void {
    const appContainer = document.getElementById(this.formContainerId) as HTMLElement;
    appContainer.innerHTML = `<form id="co2-shield"><input required placeholder="Enter URL"><button>Submit</button></form>`;
    const form = document.querySelector('#co2-shield') as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const button = form.querySelector('button') as HTMLButtonElement;

    form.onsubmit = (e: Event) => {
      e.preventDefault();
      this.generateShield(input.value.trim(), button);
    };
    input.onkeypress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.generateShield(input.value.trim(), button);
      }
    };
  }

  private async generateShield(url: string, button: HTMLButtonElement): Promise<void> {
    if (!this.validateUrl(url)) return alert('Please enter a valid URL');
    url = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    button.disabled = true;
    button.textContent = 'Loading...';
    const loadingInterval = setInterval(() => {
      button.textContent = `Loading${'.'.repeat(((button.textContent || '').split('.').length % 4))}`;
    }, 350);

    try {
      const { co2, rating } = await this.fetchCO2Data(url);
      const [color, details] = CO2Shield.ratingDetails[rating.toLowerCase()];
      const shieldUrl = `https://img.shields.io/badge/CO₂-${rating.toUpperCase()}_${parseFloat(co2).toFixed(rating === 'a+' ? 3 : 2).replace(/ /g, '_')}g-${color.replace('#', '')}`;
      const markdown = `[![CO₂ Shield](${shieldUrl})](https://overbrowsing.com/projects/co2-shield)`;
      this.updateUI({ shieldUrl, markdown, details }, url);
    } catch {
      alert('Invalid URL. Please try again.');
    } finally {
      clearInterval(loadingInterval);
      button.textContent = 'Submit';
      button.disabled = false;
    }
  }

  private validateUrl(url: string): boolean {
    return !!url;
  }

  private fetchCO2Data(url: string): Promise<{ co2: string, rating: string }> {
    return fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(url)}`).then(res => res.json());
  }

  private updateUI({ shieldUrl, markdown, details }: { shieldUrl: string, markdown: string, details: string }, targetUrl: string): void {
    const appContainer = document.getElementById(this.formContainerId) as HTMLElement;

    appContainer.innerHTML = `
        <div id="result">
            <h2>Results</h2>
            <p>${targetUrl} • ${details} • Scroll down to see the ratings.</p>
            <img src="${shieldUrl}" alt="CO₂ Shield" style="height:20px">
            <pre>${markdown}</pre>
            <button id="copy">Copy</button>
        </div>
        <div>
            <h2>Ratings</h2>
            <p>These measurements are for new visitors. Returning visitors have a lower footprint due to caching.</p>
            <table>
                <thead><tr><th>Rating</th><th>Color</th><th>CO₂e Emissions per View</th></tr></thead>
                <tbody>${Object.keys(CO2Shield.ratingDetails).map(rating => {
      const [color, details] = CO2Shield.ratingDetails[rating];
      return `<tr><td style="text-align:center;">${rating.toUpperCase()}</td><td style="text-align:center;color:${color}">●</td><td>${details}</td></tr>`;
    }).join('')}</tbody>
            </table>
            <button id="reset">Reset</button>
        </div>`;
    document.querySelector('#copy')?.addEventListener('click', this.copy.bind(this));
    document.querySelector('#reset')?.addEventListener('click', this.reset.bind(this));
  }

  private copy(): void {
    const text = document.querySelector('pre')?.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      const copyButton = document.querySelector('#copy') as HTMLButtonElement;
      copyButton.textContent = 'Copied';
      setTimeout(() => copyButton.textContent = 'Copy', 1500);
    });
  }

  private reset(): void {
    const appContainer = document.getElementById(this.formContainerId) as HTMLElement;
    appContainer.innerHTML = '';
    this.createForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}