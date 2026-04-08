import axios from 'axios';
import { createLogger } from '../utils/logger.js';
const logger = createLogger('CatalogManager');
export class CatalogManager {
    appRepo;
    catalogUrl = 'https://alphaleadership.github.io/appstore/catalog.json';
    constructor(appRepo) {
        this.appRepo = appRepo;
    }
    async fetchCatalog(page, pageSize) {
        try {
            const response = await axios.get(this.catalogUrl);
            const data = response.data;
            // Cache fetched applications
            for (const app of data.applications) {
                this.appRepo.save(app);
            }
            // Simulate pagination on client side if needed
            const allApps = data.applications;
            const start = (page - 1) * pageSize;
            const paginatedApps = allApps.slice(start, start + pageSize);
            return {
                applications: paginatedApps,
                totalCount: data.totalCount,
                pageNumber: page,
                pageSize: pageSize,
                hasMore: start + pageSize < allApps.length
            };
        }
        catch (error) {
            logger.error('Error fetching catalog:', error);
            // Fallback to local cache if offline
            const allApps = this.appRepo.findAll();
            const start = (page - 1) * pageSize;
            const paginatedApps = allApps.slice(start, start + pageSize);
            return {
                applications: paginatedApps,
                totalCount: allApps.length,
                pageNumber: page,
                pageSize: pageSize,
                hasMore: start + pageSize < allApps.length
            };
        }
    }
    async searchApplications(query) {
        const allApps = this.appRepo.findAll();
        const lowerQuery = query.toLowerCase();
        return allApps.filter(app => app.name.toLowerCase().includes(lowerQuery) ||
            app.description.toLowerCase().includes(lowerQuery) ||
            app.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }
    async filterByCategory(category) {
        const allApps = this.appRepo.findAll();
        return allApps.filter(app => app.category === category);
    }
    async getApplicationDetails(appId) {
        const cachedApp = this.appRepo.findById(appId);
        if (cachedApp)
            return cachedApp;
        try {
            const response = await axios.get(`https://alphaleadership.github.io/appstore/applications/${appId}.json`);
            const app = response.data;
            this.appRepo.save(app);
            return app;
        }
        catch (error) {
            throw new Error(`Application ${appId} not found`);
        }
    }
    async refreshCatalog() {
        await this.fetchCatalog(1, 100);
    }
}
//# sourceMappingURL=CatalogManager.js.map