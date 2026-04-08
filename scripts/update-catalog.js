import fs from 'fs';
import path from 'path';
import axios from 'axios';

const CATALOG_PATH = path.join(process.cwd(), 'docs', 'catalog.json');
const PACKAGE_PATH = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));

// GitHub Token for higher rate limits in CI
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const axiosConfig = GITHUB_TOKEN ? { headers: { Authorization: `token ${GITHUB_TOKEN}` } } : {};

async function getLatestGitHubRelease(repoUrl) {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    
    const [_, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    
    const response = await axios.get(apiUrl, axiosConfig);
    const release = response.data;
    
    // Find a suitable Windows asset (exe, msi, zip)
    const asset = release.assets.find(a => 
      a.name.endsWith('.exe') || 
      a.name.endsWith('.msi') || 
      (a.name.includes('win') && a.name.endsWith('.zip'))
    );

    return {
      version: release.tag_name.replace(/^v/, ''),
      downloadUrl: asset ? asset.browser_download_url : release.html_url,
      releaseDate: release.published_at.split('T')[0]
    };
  } catch (error) {
    console.warn(`Could not fetch updates for ${repoUrl}: ${error.message}`);
    return null;
  }
}

async function updateCatalog() {
  try {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    let updatedCount = 0;

    console.log('Checking for updates for all applications...');

    for (let i = 0; i < catalog.applications.length; i++) {
      const app = catalog.applications[i];
      
      // Special case: update our own app if env vars are provided (from CI release)
      if (app.id === (process.env.APP_ID || pkg.name) && process.env.APP_VERSION) {
        app.version = process.env.APP_VERSION.replace(/^v/, '');
        app.downloadUrl = process.env.DOWNLOAD_URL || app.downloadUrl;
        app.releaseDate = new Date().toISOString().split('T')[0];
        console.log(`Self-updated ${app.name} to ${app.version}`);
        updatedCount++;
        continue;
      }

      // Check remote updates for apps with GitHub repos
      if (app.repository && app.repository.includes('github.com')) {
        console.log(`Checking ${app.name} (${app.repository})...`);
        const latest = await getLatestGitHubRelease(app.repository);
        
        if (latest && latest.version !== app.version) {
          console.log(`Found new version for ${app.name}: ${app.version} -> ${latest.version}`);
          app.version = latest.version;
          app.downloadUrl = latest.downloadUrl;
          app.releaseDate = latest.releaseDate;
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      catalog.totalCount = catalog.applications.length;
      fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
      console.log(`Successfully updated ${updatedCount} applications in catalog.json`);
    } else {
      console.log('All applications are up to date.');
    }

  } catch (error) {
    console.error('Error updating catalog:', error);
    process.exit(1);
  }
}

updateCatalog();
