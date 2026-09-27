import { announcementRepository } from '../repositories/announcement.repository.js';
import { Priority } from '../types/index.js';

export class AnnouncementService {
  async getAll() {
    return announcementRepository.getAll();
  }

  async getForUser(role: string, hostelId?: string | null) {
    return announcementRepository.getForRole(role, hostelId);
  }

  async createAnnouncement(data: {
    hostelId: string | null;
    title: string;
    content: string;
    priority: Priority;
    targetRole: string;
    publishedBy: string;
  }) {
    return announcementRepository.create(data);
  }

  async getUserNotifications(userId: string) {
    return announcementRepository.getNotificationsByUser(userId);
  }

  async markNotificationRead(id: string) {
    return announcementRepository.markNotificationAsRead(id);
  }
}

export const announcementService = new AnnouncementService();
