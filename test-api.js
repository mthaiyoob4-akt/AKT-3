async function testAPI() {
    const urls = [
        'https://stage.whichrenewables.com/api/companies',
        'http://localhost:4000/api/companies'
    ];

    for (const url of urls) {
        try {
            console.log(`\nFetching ${url}...`);
            const res = await fetch(url);
            const data = await res.json();
            console.log(`Success! Found ${data.data.length} companies.`);

            let invalidSector = 0;
            let invalidRegion = 0;
            let nullSector = 0;
            let nonStringSector = 0;

            data.data.forEach(c => {
                if (c.industrySector && Array.isArray(c.industrySector)) {
                    if (c.industrySector.length > 0 && typeof c.industrySector[0] !== 'string') {
                        nonStringSector++;
                        console.log(`- ${c.companyName} has weird sector format:`, typeof c.industrySector[0]);
                    }
                } else if (c.industrySector !== null && c.industrySector !== undefined) {
                    invalidSector++;
                    console.log(`- ${c.companyName} has NON-ARRAY sector format:`, typeof c.industrySector);
                } else {
                    nullSector++;
                }

                if (c.regions && !Array.isArray(c.regions)) {
                    invalidRegion++;
                }
            });
            console.log(`Invalid Sectors: ${invalidSector}, Null Sectors: ${nullSector}, NonString Sectors: ${nonStringSector}, Invalid Regions: ${invalidRegion}`);
        } catch (e) {
            console.log(`Failed to fetch ${url}: ${e.message}`);
        }
    }
}
testAPI();
