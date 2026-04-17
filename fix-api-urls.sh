#!/bin/bash

# Backup files first
mkdir -p backups
cp src/utils/companiesAPIExtended.js backups/
cp src/utils/sectorsAPI.js backups/
cp src/utils/companiesAPI.js backups/
cp src/utils/authAPI.js backups/

# Fix companiesAPIExtended.js
sed -i '' "s|const API_BASE_URL = 'http://localhost:4000/api/companies';|import { API_BASE_URL } from '../config';\nconst COMPANIES_API_URL = \`\${API_BASE_URL}/companies\`;|g" src/utils/companiesAPIExtended.js
sed -i '' "s|API_BASE_URL|COMPANIES_API_URL|g" src/utils/companiesAPIExtended.js
sed -i '' "s|http://localhost:4000|http://localhost:5006|g" src/utils/companiesAPIExtended.js

# Fix sectorsAPI.js  
sed -i '' "s|const API_BASE_URL = 'http://localhost:4000/api/sectors';|import { API_BASE_URL } from '../config';\nconst SECTORS_API_URL = \`\${API_BASE_URL}/sectors\`;|g" src/utils/sectorsAPI.js
sed -i '' "s|API_BASE_URL|SECTORS_API_URL|g" src/utils/sectorsAPI.js

# Fix companiesAPI.js
sed -i '' "s|const API_BASE_URL = 'http://localhost:4000/api/companies';|import { API_BASE_URL } from '../config';\nconst COMPANIES_API_URL = \`\${API_BASE_URL}/companies\`;|g" src/utils/companiesAPI.js
sed -i '' "s|API_BASE_URL|COMPANIES_API_URL|g" src/utils/companiesAPI.js
sed -i '' "s|http://localhost:4000|http://localhost:5006|g" src/utils/companiesAPI.js

# Fix authAPI.js
sed -i '' "s|const DEFAULT_API_BASE_URL = .*|import { API_BASE_URL } from '../config';|g" src/utils/authAPI.js
sed -i '' "s|const API_BASE_URL = process.env.REACT_APP_API_BASE_URL \|\| DEFAULT_API_BASE_URL;||g" src/utils/authAPI.js
sed -i '' "s|http://localhost:4000|http://localhost:5006|g" src/utils/authAPI.js

echo "API URLs updated!"
