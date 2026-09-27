import { db } from '../db/datastore.js';
import { Announcement, Notification } from '../types/index.js';

export class AnnouncementRepository {
  async getAll(): Promise<Announcement[]> {
    await db.init();
    return [...db.announcements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getForRole(role: string, hostelId?: string | null): Promise<Announcement[]> {
    await db.init();
    return db.announcements
      .filter((a) => {
        const roleMatches = a.targetRole === 'ALL' || a.targetRole === role;
        const hostelMatches = !a.hostelId || a.hostelId === hostelId;
        return roleMatches && hostelMatches;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async create(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    await db.init();
    const id = `anc-${Date.now().toString(36)}`;
    const newAnnouncement: Announcement = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    db.announcements.push(newAnnouncement);
    return newAnnouncement;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    await db.init();
    return db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    await db.init();
    const id = `notif-${Date.now().toString(36)}`;
    const newNotif: Notification = {
      ...data,
      id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.push(newNotif);
    return newNotif;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    await db.init();
    const n = db.notifications.find((notif) => notif.id === id);
    if (!n) return false;
    n.isRead = true;
    return true;
  }
}

export const announcementRepository = new AnnouncementRepository();
