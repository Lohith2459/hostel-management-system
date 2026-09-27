import { db } from '../db/datastore.js';
import { FoodMenu, FoodWastage } from '../types/index.js';

export class MessRepository {
  async getMenuByHostel(hostelId?: string): Promise<FoodMenu[]> {
    await db.init();
    if (hostelId) {
      return db.foodMenus.filter((m) => m.hostelId === hostelId);
    }
    return [...db.foodMenus];
  }

  async updateMenuItem(
    id: string,
    itemsDescription: string
  ): Promise<FoodMenu | null> {
    await db.init();
    const item = db.foodMenus.find((m) => m.id === id);
    if (!item) return null;
    item.itemsDescription = itemsDescription;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  async getWastageLogs(hostelId?: string): Promise<FoodWastage[]> {
    await db.init();
    let logs = [...db.foodWastages];
    if (hostelId) {
      logs = logs.filter((l) => l.hostelId === hostelId);
    }
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async addWastageLog(data: Omit<FoodWastage, 'id' | 'createdAt'>): Promise<FoodWastage> {
    await db.init();
    const id = `fw-${Date.now().toString(36)}`;
    const newLog: FoodWastage = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    db.foodWastages.push(newLog);
    return newLog;
  }
}

export const messRepository = new MessRepository();
