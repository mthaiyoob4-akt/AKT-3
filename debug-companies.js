const fs = require('fs');

async function debugFiltering() {
    try {
        const res = await fetch('http://localhost:4000/api/companies');
        const data = await res.json();
        const companies = data.data; // The array

        console.log(`Total companies: ${companies.length}`);
        let searchQuery = '';
        let selectedRegions = [];

        const filteredCompanies = companies.filter((company) => {
            let matchesSearch = true;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                matchesSearch = company.companyName?.toLowerCase().includes(q) ||
                    company.productsServices?.toLowerCase().includes(q) ||
                    (Array.isArray(company.industrySector) && company.industrySector.join(' ').toLowerCase().includes(q));
            }

            let matchesRegion = true;
            if (selectedRegions.length > 0) {
                matchesRegion = selectedRegions.some(selectedRegion => {
                    const [mainRegion, subRegion] = selectedRegion.split(' - ');

                    let hasRegion = false;
                    if (Array.isArray(company.regions)) {
                        hasRegion = company.regions.some(r =>
                            r?.toLowerCase().includes(subRegion?.toLowerCase() || mainRegion?.toLowerCase()) ||
                            r?.toLowerCase().includes(mainRegion?.toLowerCase())
                        );
                    } else if (typeof company.regions === 'string') {
                        hasRegion = company.regions.toLowerCase().includes(subRegion?.toLowerCase() || mainRegion?.toLowerCase()) ||
                            company.regions.toLowerCase().includes(mainRegion?.toLowerCase());
                    }

                    const inAddress = company.companyAddress?.toLowerCase().includes(subRegion?.toLowerCase() || mainRegion?.toLowerCase());

                    return hasRegion || inAddress;
                });
            }

            return matchesSearch && matchesRegion;
        });

        console.log(`Filtered companies length: ${filteredCompanies.length}`);
        if (filteredCompanies.length > 0) {
            console.log(filteredCompanies.map(c => c.companyName).join(', '));
        }
    } catch (e) {
        console.error(e);
    }
}
debugFiltering();
