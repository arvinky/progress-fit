const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all packages (with client details and sessions)
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await prisma.clientPackage.findMany({
      include: {
        client: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        sessions: {
          orderBy: { sessionDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new package for a client
exports.createPackage = async (req, res) => {
  try {
    const { clientId, packageType, totalSessions } = req.body;

    if (!clientId || !packageType || !totalSessions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPackage = await prisma.clientPackage.create({
      data: {
        clientId: parseInt(clientId),
        packageType,
        totalSessions: parseInt(totalSessions),
      },
      include: {
        client: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        sessions: true
      }
    });

    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Log a new completed session
exports.addSession = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { sessionDate, trainingSplit } = req.body;

    if (!sessionDate || !trainingSplit) {
      return res.status(400).json({ message: 'Date and training split are required' });
    }

    const clientPackage = await prisma.clientPackage.findUnique({
      where: { id: parseInt(packageId) },
      include: { sessions: true }
    });

    if (!clientPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Check if package is already complete
    if (clientPackage.sessions.length >= clientPackage.totalSessions) {
      return res.status(400).json({ message: 'Package already completed its total sessions' });
    }

    const newSession = await prisma.packageSession.create({
      data: {
        clientPackageId: parseInt(packageId),
        sessionDate: new Date(sessionDate),
        trainingSplit,
        status: 'COMPLETED'
      }
    });

    // Check if this was the last session, if so, deactivate package automatically
    if (clientPackage.sessions.length + 1 >= clientPackage.totalSessions) {
      await prisma.clientPackage.update({
        where: { id: parseInt(packageId) },
        data: { isActive: false }
      });
    }

    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a package session (e.g. accidental input)
exports.deleteSession = async (req, res) => {
  try {
    const { packageId, sessionId } = req.params;

    const session = await prisma.packageSession.findUnique({
      where: { id: parseInt(sessionId) }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await prisma.packageSession.delete({
      where: { id: parseInt(sessionId) }
    });

    // If package was marked inactive because it was full, re-activate it since we removed a session
    await prisma.clientPackage.update({
      where: { id: parseInt(packageId) },
      data: { isActive: true }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a package entirely
exports.deletePackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    await prisma.clientPackage.delete({
      where: { id: parseInt(packageId) }
    });

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
