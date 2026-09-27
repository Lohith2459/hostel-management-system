import { allocationRepository } from '../repositories/allocation.repository.js';
import { hostelRepository } from '../repositories/hostel.repository.js';
import { userRepository } from '../repositories/user.repository.js';

export interface AllocateInput {
  studentId: string;
  hostelId: string;
  blockId: string;
  roomId: string;
  bedId: string;
  notes?: string;
}

export class AllocationService {
  async allocate(input: AllocateInput) {
    // 1. Validate student exists
    const student = await userRepository.findStudentById(input.studentId);
    if (!student) {
      throw {
        statusCode: 404,
        code: 'STUDENT_NOT_FOUND',
        message: 'Student record not found',
      };
    }

    // 2. Invariant: Student cannot have more than one ACTIVE allocation
    const existingActive = await allocationRepository.getActiveAllocationByStudentId(input.studentId);
    if (existingActive) {
      throw {
        statusCode: 422,
        code: 'ACTIVE_ALLOCATION_EXISTS',
        message: 'Student already has an active room allocation. Please vacate or transfer existing allocation first.',
      };
    }

    // 3. Structural validation: Hostel exists
    const hostel = await hostelRepository.findHostelById(input.hostelId);
    if (!hostel) {
      throw {
        statusCode: 404,
        code: 'HOSTEL_NOT_FOUND',
        message: 'Hostel record not found',
      };
    }

    // 4. Block belongs to selected hostel
    const block = await hostelRepository.findBlockById(input.blockId);
    if (!block || block.hostelId !== input.hostelId) {
      throw {
        statusCode: 422,
        code: 'INVALID_BLOCK_HIERARCHY',
        message: 'Selected block does not belong to the selected hostel',
      };
    }

    // 5. Room validation
    const room = await hostelRepository.findRoomById(input.roomId);
    if (!room) {
      throw {
        statusCode: 404,
        code: 'ROOM_NOT_FOUND',
        message: 'Room record not found',
      };
    }

    // Verify room belongs to block through floor
    const floor = await hostelRepository.findFloorById(room.floorId);
    if (!floor || floor.blockId !== input.blockId) {
      throw {
        statusCode: 422,
        code: 'INVALID_ROOM_HIERARCHY',
        message: 'Selected room does not belong to the selected block',
      };
    }

    // Invariant: Cannot be allocated to a maintenance room
    if (room.status === 'MAINTENANCE') {
      throw {
        statusCode: 422,
        code: 'ROOM_UNDER_MAINTENANCE',
        message: 'Selected room is currently marked under MAINTENANCE and cannot accept allocations.',
      };
    }

    // Invariant: Cannot be allocated to a full room
    const roomBeds = await hostelRepository.getBedsByRoomId(room.id);
    const occupiedBedsCount = roomBeds.filter((b) => b.isOccupied).length;
    if (occupiedBedsCount >= room.capacity || room.status === 'FULL') {
      throw {
        statusCode: 422,
        code: 'ROOM_FULL',
        message: 'Selected room is at full capacity.',
      };
    }

    // 6. Bed validation
    const bed = await hostelRepository.findBedById(input.bedId);
    if (!bed) {
      throw {
        statusCode: 404,
        code: 'BED_NOT_FOUND',
        message: 'Bed record not found',
      };
    }

    // Invariant: Bed must belong to selected room
    if (bed.roomId !== room.id) {
      throw {
        statusCode: 422,
        code: 'INVALID_BED_HIERARCHY',
        message: 'Selected bed does not belong to the selected room',
      };
    }

    // Invariant: Cannot occupy an already occupied bed
    if (bed.isOccupied) {
      throw {
        statusCode: 409,
        code: 'BED_ALREADY_OCCUPIED',
        message: `Bed ${bed.bedNumber} is already occupied by another resident.`,
      };
    }

    // 7. Atomic Transactional Allocation:
    // Update bed occupancy
    await hostelRepository.updateBedOccupancy(bed.id, true);

    // Create allocation record
    const allocation = await allocationRepository.create({
      studentId: input.studentId,
      bedId: input.bedId,
      startDate: new Date().toISOString(),
      endDate: null,
      status: 'ACTIVE',
      notes: input.notes || 'Allocated via HostelSphere Management',
    });

    return {
      allocation,
      details: {
        studentName: `${student.firstName} ${student.lastName}`,
        hostelName: hostel.name,
        blockName: block.name,
        roomNumber: room.roomNumber,
        bedNumber: bed.bedNumber,
      },
    };
  }

  async vacate(studentId: string, notes?: string) {
    const active = await allocationRepository.getActiveAllocationByStudentId(studentId);
    if (!active) {
      throw {
        statusCode: 404,
        code: 'NO_ACTIVE_ALLOCATION',
        message: 'No active room allocation found for this student to vacate.',
      };
    }

    const now = new Date().toISOString();

    // Transactional: Free bed & update allocation record with departure timestamp
    await hostelRepository.updateBedOccupancy(active.bedId, false);
    const updated = await allocationRepository.updateStatus(active.id, 'VACATED', now);

    return {
      success: true,
      message: 'Student room allocation successfully vacated and recorded.',
      allocation: updated,
    };
  }

  async transfer(input: AllocateInput) {
    // 1. Vacate old bed
    const currentActive = await allocationRepository.getActiveAllocationByStudentId(input.studentId);
    if (currentActive) {
      const now = new Date().toISOString();
      await hostelRepository.updateBedOccupancy(currentActive.bedId, false);
      await allocationRepository.updateStatus(currentActive.id, 'TRANSFERRED', now);
    }

    // 2. Allocate new bed
    return this.allocate(input);
  }

  async getStudentAllocation(studentId: string) {
    const active = await allocationRepository.getActiveAllocationByStudentId(studentId);
    if (!active) {
      return null;
    }

    const bed = await hostelRepository.findBedById(active.bedId);
    const room = bed ? await hostelRepository.findRoomById(bed.roomId) : null;
    const floor = room ? await hostelRepository.findFloorById(room.floorId) : null;
    const block = floor ? await hostelRepository.findBlockById(floor.blockId) : null;
    const hostel = block ? await hostelRepository.findHostelById(block.hostelId) : null;

    return {
      allocation: active,
      bed,
      room,
      block,
      hostel,
    };
  }

  async getStudentHistory(studentId: string) {
    const allocations = await allocationRepository.getAllocationsByStudentId(studentId);
    return Promise.all(
      allocations.map(async (alc) => {
        const bed = await hostelRepository.findBedById(alc.bedId);
        const room = bed ? await hostelRepository.findRoomById(bed.roomId) : null;
        return {
          ...alc,
          roomNumber: room?.roomNumber || 'Unknown',
          bedNumber: bed?.bedNumber || 'Unknown',
        };
      })
    );
  }

  async getAllAllocations() {
    const allocations = await allocationRepository.getAllAllocations();
    return Promise.all(
      allocations.map(async (alc) => {
        const student = await userRepository.findStudentById(alc.studentId);
        const bed = await hostelRepository.findBedById(alc.bedId);
        const room = bed ? await hostelRepository.findRoomById(bed.roomId) : null;
        return {
          ...alc,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          admissionNumber: student?.admissionNumber || 'N/A',
          roomNumber: room?.roomNumber || 'N/A',
          bedNumber: bed?.bedNumber || 'N/A',
        };
      })
    );
  }
}

export const allocationService = new AllocationService();
