#!/bin/bash
set -e
BASE="/srv/docker/whichrenewables-stage/src/components"

echo "Patching AdminDashboard.js..."
node << 'EOF'
const fs = require('fs');
const path = '/srv/docker/whichrenewables-stage/src/components/admin/AdminDashboard.js';
let c = fs.readFileSync(path, 'utf8');

// Fix 1: Remove localStorage write + QuotaExceededError block from save handler
c = c.replace(
`      const storageKey = section === 'innovations'
        ? 'adminInnovations'
        : \`admin\${section.charAt(0).toUpperCase() + section.slice(1)}\`;

      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedData[section]));

        // Sync with backend
        const synced = await syncContentToBackend(section, updatedData[section]);
        if (!synced) {
          console.error(\`[Admin] Failed to sync \${section} to backend\`);
        } else {
          console.log(\`[Admin] Synced \${section} to backend successfully\`);
        }

      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          alert('Storage quota exceeded. Images are too large for localStorage. Try uploading smaller images or consider using image hosting service.');
        } else {
          console.error('Error saving:', error);
          alert('Failed to save project. Please try again.');
        }
      }`,
`      try {
        // Save to backend only — no localStorage (base64 images exceed ~5MB quota)
        const synced = await syncContentToBackend(section, updatedData[section]);
        if (!synced) {
          console.error(\`[Admin] Failed to sync \${section} to backend\`);
          alert('Failed to save to server. Please check your connection and try again.');
        } else {
          console.log(\`[Admin] Synced \${section} to backend successfully\`);
        }
      } catch (error) {
        console.error('Error saving to backend:', error);
        alert('Failed to save. Please try again.');
      }`
);

// Fix 2: Remove localStorage write from delete handler
c = c.replace(
`      const storageKey = section === 'innovations'
        ? 'adminInnovations'
        : \`admin\${section.charAt(0).toUpperCase() + section.slice(1)}\`;

      localStorage.setItem(storageKey, JSON.stringify(updatedData[section]));

      // Fire and forget sync, since delete should be instantaneous locally
      syncContentToBackend(section, updatedData[section]).catch(console.error);`,
`      // Sync delete to backend only — no localStorage
      syncContentToBackend(section, updatedData[section]).catch(console.error);`
);

// Fix 3: Replace load useEffect to use backend only + clear old localStorage
c = c.replace(
`  // Load persisted data from localStorage on mount
  useEffect(() => {
    const fetchData = async () => {
      const backendContent = await getAllContent();

      const storedEvents = backendContent.events || (localStorage.getItem('adminEvents') ? JSON.parse(localStorage.getItem('adminEvents')) : []);
      const storedWebinars = backendContent.webinars || (localStorage.getItem('adminWebinars') ? JSON.parse(localStorage.getItem('adminWebinars')) : []);
      const storedNews = backendContent.news || (localStorage.getItem('adminNews') ? JSON.parse(localStorage.getItem('adminNews')) : []);
      const storedAwards = backendContent.awards || (localStorage.getItem('adminAwards') ? JSON.parse(localStorage.getItem('adminAwards')) : []);
      const storedRegional = backendContent.regional || (localStorage.getItem('adminRegional') ? JSON.parse(localStorage.getItem('adminRegional')) : []);
      const storedShowcase = backendContent.showcase || (localStorage.getItem('adminShowcase') ? JSON.parse(localStorage.getItem('adminShowcase')) : []);
      const storedInnovations = backendContent.innovations || (localStorage.getItem('adminInnovations') ? JSON.parse(localStorage.getItem('adminInnovations')) : []);
      const storedCaseStudies = backendContent['case-studies'] || (localStorage.getItem('adminCaseStudies') ? JSON.parse(localStorage.getItem('adminCaseStudies')) : []);
      const storedBlogs = backendContent.blogs || (localStorage.getItem('adminBlogs') ? JSON.parse(localStorage.getItem('adminBlogs')) : []);
      const storedWhichWomen = backendContent['which-women'] || (localStorage.getItem('adminWhich-women') ? JSON.parse(localStorage.getItem('adminWhich-women')) : []);
      const storedAdvertisement = backendContent.advertisement || (localStorage.getItem('adminAdvertisement') ? JSON.parse(localStorage.getItem('adminAdvertisement')) : []);
      const storedHomeNews = backendContent['home-news'] || (localStorage.getItem('adminHome-news') ? JSON.parse(localStorage.getItem('adminHome-news')) : []);
      const storedHomeTestimonials = backendContent['home-testimonials'] || (localStorage.getItem('adminHome-testimonials') ? JSON.parse(localStorage.getItem('adminHome-testimonials')) : []);
      const storedHomeShowcase = backendContent['home-showcase'] || (localStorage.getItem('adminHome-showcase') ? JSON.parse(localStorage.getItem('adminHome-showcase')) : []);

      const loadedData = {
        events: storedEvents,
        webinars: storedWebinars,
        news: storedNews,
        awards: storedAwards,
        regional: storedRegional,
        showcase: storedShowcase,
        innovations: storedInnovations,
        "case-studies": storedCaseStudies,
        blogs: storedBlogs,
        "which-women": storedWhichWomen,
        advertisement: storedAdvertisement,
        "home-news": storedHomeNews,
        "home-testimonials": storedHomeTestimonials,
        "home-showcase": storedHomeShowcase
      };

      setUploadedData(loadedData);

      const storedSpotlightCompanies = localStorage.getItem('adminCompany-spotlight');
      const storedSpotlightPS = localStorage.getItem('adminProduct-service-spotlight');
      if (storedSpotlightCompanies) setSpotlightCompanies(JSON.parse(storedSpotlightCompanies));
      if (storedSpotlightPS) setSpotlightPSItems(JSON.parse(storedSpotlightPS));
    };

    fetchData();
  }, []);`,
`  // Load data from backend API on mount — clear old localStorage content to free quota
  useEffect(() => {
    const fetchData = async () => {
      ['adminEvents','adminWebinars','adminNews','adminAwards','adminRegional',
       'adminShowcase','adminInnovations','adminCaseStudies','adminCase-studies',
       'adminBlogs','adminWhich-women','adminAdvertisement','adminHome-news',
       'adminHome-testimonials','adminHome-showcase'].forEach(k => localStorage.removeItem(k));

      const backendContent = await getAllContent();

      setUploadedData({
        events: backendContent.events || [],
        webinars: backendContent.webinars || [],
        news: backendContent.news || [],
        awards: backendContent.awards || [],
        regional: backendContent.regional || [],
        showcase: backendContent.showcase || [],
        innovations: backendContent.innovations || [],
        'case-studies': backendContent['case-studies'] || [],
        blogs: backendContent.blogs || [],
        'which-women': backendContent['which-women'] || [],
        advertisement: backendContent.advertisement || [],
        'home-news': backendContent['home-news'] || [],
        'home-testimonials': backendContent['home-testimonials'] || [],
        'home-showcase': backendContent['home-showcase'] || [],
      });

      const storedSpotlightCompanies = localStorage.getItem('adminCompany-spotlight');
      const storedSpotlightPS = localStorage.getItem('adminProduct-service-spotlight');
      if (storedSpotlightCompanies) setSpotlightCompanies(JSON.parse(storedSpotlightCompanies));
      if (storedSpotlightPS) setSpotlightPSItems(JSON.parse(storedSpotlightPS));
    };

    fetchData();
  }, []);`
);

fs.writeFileSync(path, c);
const remaining = (c.match(/localStorage.setItem\(storageKey/g) || []).length;
console.log('AdminDashboard patched. Remaining localStorage.setItem(storageKey) calls:', remaining);
EOF

echo "Done! Now rebuilding..."
cd /srv/docker/whichrenewables-stage
docker compose up -d --build
