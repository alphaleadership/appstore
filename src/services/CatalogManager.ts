import axios from 'axios';
import { Application, CatalogPage } from '../models/types';
import { IApplicationRepository } from '../repositories/interfaces';

export class CatalogManager {
  private catalogUrl: string = 'https://alphaleadership.github.io/appstore/catalog.json';

  constructor(private appRepo: IApplicationRepository) {}

  async fetchCatalog(page: number, pageSize: number): Promise<CatalogPage> {
    try {
      const response = await axios.get(`${this.catalogUrl}?page=${page}&pageSize=${pageSize}`);
      const data = response.data as CatalogPage;
      
      // Cache fetched applications
      for (const app of data.applications) {
        this.appRepo.save(app);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching catalog:', error);
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

  async searchApplications(query: string): Promise<Application[]> {
    const allApps = this.appRepo.findAll();
    const lowerQuery = query.toLowerCase();
    return allApps.filter(app => 
      app.name.toLowerCase().includes(lowerQuery) || 
      app.description.toLowerCase().includes(lowerQuery) ||
      app.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async filterByCategory(category: string): Promise<Application[]> {
    const allApps = this.appRepo.findAll();
    return allApps.filter(app => app.category === category);
  }

  async getApplicationDetails(appId: string): Promise<Application> {
    const cachedApp = this.appRepo.findById(appId);
    if (cachedApp) return cachedApp;

    try {
      const response = await axios.get(`https://username.github.io/electron-app-downloader/applications/${appId}.json`);
      const app = response.data as Application;
      this.appRepo.save(app);
      return app;
    } catch (error) {
      throw new Error(`Application ${appId} not found`);
    }
  }

  async refreshCatalog(): Promise<void> {
    await this.fetchCatalog(1, 100);
  }
}
