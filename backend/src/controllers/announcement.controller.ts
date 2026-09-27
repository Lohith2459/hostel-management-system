import { Response } from 'express';
import { announcementService } from '../services/announcement.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const getAnnouncements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const role = req.user?.role || 'ALL';
    const data = await announcementService.getForUser(role);
    res.status(200).json({
      success: true,
      message: 'Announcements retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching announcements',
      error: { code: err.code || 'ANNOUNCEMENT_ERROR' },
    });
  }
};

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const publishedBy = req.user?.email || 'Administrator';
    const data = await announcementService.createAnnouncement({
      ...req.body,
      publishedBy,
    });
    res.status(201).json({
      success: true,
      message: 'Announcement published',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error publishing announcement',
      error: { code: err.code || 'ANNOUNCEMENT_CREATE_ERROR' },
    });
  }
};

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: { code: 'UNAUTHORIZED' },
      });
      return;
    }

    const data = await announcementService.getUserNotifications(userId);
    res.status(200).json({
      success: true,
      message: 'Notifications retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching notifications',
      error: { code: err.code || 'NOTIFICATION_ERROR' },
    });
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await announcementService.markNotificationRead(id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: { code: 'NOTIFICATION_ERROR' },
    });
  }
};
