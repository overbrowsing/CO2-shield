var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CO2Shield {
    constructor(formContainerId) {
        this.formContainerId = formContainerId;
    }
    initialize() {
        this.createForm();
    }
    createForm() {
        const appContainer = document.getElementById(this.formContainerId);
        appContainer.innerHTML = `<form id="co2-shield"><input required placeholder="Enter URL"><button>Submit</button></form>`;
        const form = document.querySelector('#co2-shield');
        const input = form.querySelector('input');
        const button = form.querySelector('button');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.generateShield(input.value.trim(), button);
        };
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.generateShield(input.value.trim(), button);
            }
        };
    }
    generateShield(url, button) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.validateUrl(url))
                return alert('Please enter a valid URL');
            url = /^https?:\/\//i.test(url) ? url : `https://${url}`;
            button.disabled = true;
            button.textContent = 'Loading...';
            const loadingInterval = setInterval(() => {
                button.textContent = `Loading${'.'.repeat(((button.textContent || '').split('.').length % 4))}`;
            }, 350);
            try {
                const { co2, rating } = yield this.fetchCO2Data(url);
                const [color, details] = CO2Shield.ratingDetails[rating.toLowerCase()];
                const shieldUrl = `https://img.shields.io/badge/CO₂-${rating.toUpperCase()}_${parseFloat(co2).toFixed(rating === 'a+' ? 3 : 2).replace(/ /g, '_')}g-${color.replace('#', '')}`;
                const markdown = `[![CO₂ Shield](${shieldUrl})](https://overbrowsing.com/projects/co2-shield)`;
                this.updateUI({ shieldUrl, markdown, details }, url);
            }
            catch (_a) {
                alert('Invalid URL. Please try again.');
            }
            finally {
                clearInterval(loadingInterval);
                button.textContent = 'Submit';
                button.disabled = false;
            }
        });
    }
    validateUrl(url) {
        return !!url;
    }
    fetchCO2Data(url) {
        return fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(url)}`).then(res => res.json());
    }
    updateUI({ shieldUrl, markdown, details }, targetUrl) {
        var _a, _b;
        const appContainer = document.getElementById(this.formContainerId);
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
        (_a = document.querySelector('#copy')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', this.copy.bind(this));
        (_b = document.querySelector('#reset')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', this.reset.bind(this));
    }
    copy() {
        var _a;
        const text = ((_a = document.querySelector('pre')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
        navigator.clipboard.writeText(text).then(() => {
            const copyButton = document.querySelector('#copy');
            copyButton.textContent = 'Copied';
            setTimeout(() => copyButton.textContent = 'Copy', 1500);
        });
    }
    reset() {
        const appContainer = document.getElementById(this.formContainerId);
        appContainer.innerHTML = '';
        this.createForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
CO2Shield.ratingDetails = {
    'a+': ['#58C521', 'Less than 0.095g'],
    'a': ['#20AE69', 'Less than 0.185g'],
    'b': ['#2D8EAC', 'Less than 0.34g'],
    'c': ['#C89806', 'Less than 0.49g'],
    'd': ['#C05328', 'Less than 0.65g'],
    'e': ['#B71E1E', 'Less than 0.85g'],
    'f': ['#652A2A', 'Above 0.85g']
};
export default CO2Shield;
