import { hostelRepository } from '../repositories/hostel.repository.js';
import { userRepository } from '../repositories/user.repository.js';

export class HostelService {
  async getHostelOverview() {
    const hostels = await hostelRepository.getAllHostels();
    const rooms = await hostelRepository.getAllRooms();
    const students = await userRepository.getAllStudents();
    const wardens = await userRepository.getAllWardens();

    // Map enriched hostel structures
    const detailedHostels = await Promise.all(
      hostels.map(async (hostel) => {
        const blocks = await hostelRepository.getBlocksByHostelId(hostel.id);
        const assignedWarden = wardens.find((w) => w.assignedHostelId === hostel.id);
        
        let totalRooms = 0;
        let totalBeds = 0;
        let occupiedBeds = 0;

        for (const block of blocks) {
          const floors = await hostelRepository.getFloorsByBlockId(block.id);
          for (const floor of floors) {
            const floorRooms = await hostelRepository.getRoomsByFloorId(floor.id);
            totalRooms += floorRooms.length;
            for (const rm of floorRooms) {
              const beds = await hostelRepository.getBedsByRoomId(rm.id);
              totalBeds += beds.length;
              occupiedBeds += beds.filter((b) => b.isOccupied).length;
            }
          }
        }

        return {
          ...hostel,
          blocksCount: blocks.length,
          totalRooms,
          totalBeds,
          occupiedBeds,
          availableBeds: totalBeds - occupiedBeds,
          warden: assignedWarden
            ? {
                name: `${assignedWarden.firstName} ${assignedWarden.lastName}`,
                phone: assignedWarden.phone,
                employeeId: assignedWarden.employeeId,
              }
            : null,
        };
      })
    );

    return {
      hostels: detailedHostels,
      totalStudents: students.length,
      totalWardens: wardens.length,
      totalRooms: rooms.length,
    };
  }

  async getAllHostels() {
    return hostelRepository.getAllHostels();
  }

  async getHostelHierarchy(hostelId: string) {
    const hostel = await hostelRepository.findHostelById(hostelId);
    if (!hostel) {
      throw {
        statusCode: 404,
        code: 'HOSTEL_NOT_FOUND',
        message: 'Hostel not found',
      };
    }

    const blocks = await hostelRepository.getBlocksByHostelId(hostelId);
    const enrichedBlocks = await Promise.all(
      blocks.map(async (block) => {
        const floors = await hostelRepository.getFloorsByBlockId(block.id);
        const enrichedFloors = await Promise.all(
          floors.map(async (floor) => {
            const rooms = await hostelRepository.getRoomsByFloorId(floor.id);
            const enrichedRooms = await Promise.all(
              rooms.map(async (room) => {
                const beds = await hostelRepository.getBedsByRoomId(room.id);
                return {
                  ...room,
                  beds,
                  occupiedCount: beds.filter((b) => b.isOccupied).length,
                };
              })
            );
            return {
              ...floor,
              rooms: enrichedRooms,
            };
          })
        );
        return {
          ...block,
          floors: enrichedFloors,
        };
      })
    );

    return {
      ...hostel,
      blocks: enrichedBlocks,
    };
  }

  async createHostel(data: { name: string; code: string; type: 'MALE' | 'FEMALE' | 'COED'; address: string; totalCapacity: number }) {
    return hostelRepository.createHostel(data);
  }
}

export const hostelService = new HostelService();
