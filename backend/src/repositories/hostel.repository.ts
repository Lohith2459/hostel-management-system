import { db } from '../db/datastore.js';
import { Hostel, Block, Floor, Room, Bed } from '../types/index.js';

export class HostelRepository {
  async getAllHostels(): Promise<Hostel[]> {
    await db.init();
    return [...db.hostels];
  }

  async findHostelById(id: string): Promise<Hostel | null> {
    await db.init();
    return db.hostels.find((h) => h.id === id) || null;
  }

  async createHostel(data: Omit<Hostel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hostel> {
    await db.init();
    const id = `hst-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newHostel: Hostel = { ...data, id, createdAt: now, updatedAt: now };
    db.hostels.push(newHostel);
    return newHostel;
  }

  async getBlocksByHostelId(hostelId: string): Promise<Block[]> {
    await db.init();
    return db.blocks.filter((b) => b.hostelId === hostelId);
  }

  async getFloorsByBlockId(blockId: string): Promise<Floor[]> {
    await db.init();
    return db.floors.filter((f) => f.blockId === blockId);
  }

  async getRoomsByFloorId(floorId: string): Promise<Room[]> {
    await db.init();
    return db.rooms.filter((r) => r.floorId === floorId);
  }

  async getAllRooms(): Promise<Room[]> {
    await db.init();
    return [...db.rooms];
  }

  async findRoomById(id: string): Promise<Room | null> {
    await db.init();
    return db.rooms.find((r) => r.id === id) || null;
  }

  async getBedsByRoomId(roomId: string): Promise<Bed[]> {
    await db.init();
    return db.beds.filter((b) => b.roomId === roomId);
  }

  async findBedById(id: string): Promise<Bed | null> {
    await db.init();
    return db.beds.find((b) => b.id === id) || null;
  }

  async updateBedOccupancy(bedId: string, isOccupied: boolean): Promise<Bed | null> {
    await db.init();
    const bed = db.beds.find((b) => b.id === bedId);
    if (!bed) return null;
    bed.isOccupied = isOccupied;
    bed.updatedAt = new Date().toISOString();
    return bed;
  }

  async findBlockById(id: string): Promise<Block | null> {
    await db.init();
    return db.blocks.find((b) => b.id === id) || null;
  }

  async findFloorById(id: string): Promise<Floor | null> {
    await db.init();
    return db.floors.find((f) => f.id === id) || null;
  }
}

export const hostelRepository = new HostelRepository();
