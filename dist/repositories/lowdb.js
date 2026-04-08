import { db } from './db.js';
export class LowdbApplicationRepository {
    save(app) {
        const existing = db.get('applications').find({ id: app.id }).value();
        if (existing) {
            db.get('applications').find({ id: app.id }).assign(app).write();
        }
        else {
            db.get('applications').push(app).write();
        }
    }
    findById(id) {
        const app = db.get('applications').find({ id }).value();
        return app || null;
    }
    findAll() {
        return db.get('applications').value() || [];
    }
    delete(id) {
        db.get('applications').remove({ id }).write();
    }
    update(app) {
        this.save(app);
    }
}
export class LowdbDownloadedAppRepository {
    save(app) {
        const existing = db.get('downloaded_apps').find({ id: app.id }).value();
        if (existing) {
            db.get('downloaded_apps').find({ id: app.id }).assign(app).write();
        }
        else {
            db.get('downloaded_apps').push(app).write();
        }
    }
    findById(id) {
        const app = db.get('downloaded_apps').find({ id }).value();
        return app || null;
    }
    findAll() {
        return db.get('downloaded_apps').value() || [];
    }
    delete(id) {
        db.get('downloaded_apps').remove({ id }).write();
    }
    update(app) {
        this.save(app);
    }
}
export class LowdbPreferencesRepository {
    save(prefs) {
        db.get('preferences').assign(prefs).write();
    }
    load() {
        return db.get('preferences').value();
    }
}
//# sourceMappingURL=lowdb.js.map