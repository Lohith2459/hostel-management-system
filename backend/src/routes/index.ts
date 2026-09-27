import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import hostelRoutes from './hostel.routes.js';
import allocationRoutes from './allocation.routes.js';
import attendanceRoutes from './attendance.routes.js';
import leaveRoutes from './leave.routes.js';
import complaintRoutes from './complaint.routes.js';
import messRoutes from './mess.routes.js';
import financeRoutes from './finance.routes.js';
import visitorRoutes from './visitor.routes.js';
import announcementRoutes from './announcement.routes.js';

const apiRouter = Router();

apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/hostels', hostelRoutes);
apiRouter.use('/allocations', allocationRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/leaves', leaveRoutes);
apiRouter.use('/complaints', complaintRoutes);
apiRouter.use('/mess', messRoutes);
apiRouter.use('/finance', financeRoutes);
apiRouter.use('/visitors', visitorRoutes);
apiRouter.use('/announcements', announcementRoutes);

export default apiRouter;
