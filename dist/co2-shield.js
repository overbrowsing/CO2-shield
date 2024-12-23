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
        const container = document.getElementById(this.formContainerId);
        if (!container) {
            throw new Error(`Container with ID '${this.formContainerId}' not found.`);
        }
        container.innerHTML = `
      <form id="co2ShieldForm">
        <input id="websiteUrl" type="text" placeholder="Enter website URL" required>
        <button id="generateShieldButton" type="submit">Submit</button>
      </form>
    `;
        const form = document.getElementById("co2ShieldForm");
        form.addEventListener("submit", (e) => {
            e.preventDefault(); // Prevent form submission
            this.generateShield();
        });
    }
    generateShield() {
        return __awaiter(this, void 0, void 0, function* () {
            const urlInput = document.getElementById("websiteUrl");
            const url = this.validateUrl(urlInput.value.trim());
            if (!url)
                return;
            const generateButton = document.getElementById("generateShieldButton");
            generateButton.textContent = "Loading...";
            generateButton.disabled = true;
            try {
                const { co2, rating } = yield this.fetchCO2Data(url);
                const { color, details } = this.getRatingDetails(rating);
                const reportUrl = "https://overbrowsing.com/co2-shield";
                this.updateUI(this.generateShieldData(rating, co2, color, details, reportUrl), reportUrl, url);
            }
            catch (error) {
                alert("Error fetching data. Please try again later.");
            }
            finally {
                generateButton.textContent = "Generate Shield";
                generateButton.disabled = false;
            }
        });
    }
    validateUrl(url) {
        if (!url) {
            alert("Please enter a valid website URL.");
            return null;
        }
        return /^https?:\/\//i.test(url) ? url : `https://${url}`;
    }
    fetchCO2Data(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(url)}`);
            if (!response.ok)
                throw new Error("Failed to fetch CO2 data.");
            return response.json();
        });
    }
    getRatingDetails(rating) {
        const details = {
            "a+": { color: "#4CAF50", details: "Less than 0.095g" },
            a: { color: "#8BC34A", details: "Less than 0.185g" },
            b: { color: "#FFC107", details: "Less than 0.34g" },
            c: { color: "#FF9800", details: "Less than 0.49g" },
            d: { color: "#FF5722", details: "Less than 0.65g" },
            e: { color: "#F44336", details: "Less than 0.85g" },
            f: { color: "#D32F2F", details: "Above 0.85g" },
        };
        return (details[rating.toLowerCase()] || {
            color: "#000",
            details: "Unknown rating",
        });
    }
    generateShieldData(rating, co2, color, details, reportUrl) {
        const co2Message = `${parseFloat(co2).toFixed(2)}g`;
        const shieldUrl = `https://img.shields.io/badge/CO₂-${rating.toUpperCase()}_${co2Message.replace(/ /g, "_")}-${color.replace("#", "")}`;
        const markdown = `[![CO₂ Shield](${shieldUrl})](${reportUrl})`;
        return {
            shieldUrl,
            markdown,
            details,
            rating,
            detailsList: this.generateDetailsList(),
        };
    }
    generateDetailsList() {
        return ["a+", "a", "b", "c", "d", "e", "f"]
            .map((rating) => {
            const { color, details } = this.getRatingDetails(rating);
            return `<div class="rating-detail"><span style="color: ${color};">●</span> ${rating.toUpperCase()} • ${details}</div>`;
        })
            .join("");
    }
    updateUI({ shieldUrl, markdown, details, detailsList, rating }, reportUrl, targetUrl) {
        const resultContainer = document.getElementById("result");
        if (resultContainer)
            resultContainer.remove();
        const container = document.createElement("div");
        container.id = "result";
        container.innerHTML = `
    <div>
      <h2>Results</h2>
      <p>${targetUrl} • ${rating.toUpperCase()} ${details}</p>
      <img src="${shieldUrl}">
      <pre>${markdown}</pre>
      <button id="copyMarkdown">Copy Markdown</button>
      <h2>Ratings</h2>
      <div class="rating-details">${detailsList}</div>
      <button id="resetButton">Reset</button>
    </div>
    `;
        const formContainer = document.getElementById(this.formContainerId);
        // Check if the form container exists and insert the result container after it
        if (formContainer) {
            formContainer.insertAdjacentElement("afterend", container);
        }
        const copyButton = document.getElementById("copyMarkdown");
        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(markdown).then(() => {
                copyButton.textContent = "Copied!";
                setTimeout(() => (copyButton.textContent = "Copy Markdown"), 2000);
            });
        });
        const resetButton = document.getElementById("resetButton");
        resetButton.addEventListener("click", () => window.location.reload());
    }
}
export default CO2Shield;