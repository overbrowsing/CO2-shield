declare class CO2Shield {
    private formContainerId;
    constructor(formContainerId: string);
    initialize(): void;
    private createForm;
    private generateShield;
    private validateUrl;
    private fetchCO2Data;
    private getRatingDetails;
    private generateShieldData;
    private generateDetailsList;
    private updateUI;
}
export default CO2Shield;
