const prisma = require('../lib/prisma');

// GET /api/reminders
// Client fetches their reminders, Admin fetches all reminders they sent
const getReminders = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;

    let where = {};
    if (req.user.role === 'ADMIN') {
      where.senderId = userId;
    } else {
      where.receiverId = userId;
    }

    if (status) {
      where.status = status;
    }

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reminders });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/reminders (Admin only)
const createReminder = async (req, res) => {
  try {
    const { receiverId, title, message, scheduledAt } = req.body;
    const senderId = req.user.id;

    // Check receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: parseInt(receiverId) } });
    if (!receiver) {
      return res.status(404).json({ message: 'Penerima tidak ditemukan' });
    }

    const reminder = await prisma.reminder.create({
      data: {
        senderId,
        receiverId: parseInt(receiverId),
        title,
        message,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'UNREAD',
      },
    });

    res.status(201).json({ message: 'Reminder berhasil dibuat', reminder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PATCH /api/reminders/:id/read
const markAsRead = async (req, res) => {
  try {
    const reminderId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check ownership
    const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder tidak ditemukan' });
    }

    if (reminder.receiverId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: { status: 'READ', readAt: new Date() },
    });

    res.json({ message: 'Reminder ditandai sudah dibaca', reminder: updated });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/reminders/:id (Admin only)
const deleteReminder = async (req, res) => {
  try {
    const reminderId = parseInt(req.params.id);
    await prisma.reminder.delete({ where: { id: reminderId } });
    res.json({ message: 'Reminder berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { getReminders, createReminder, markAsRead, deleteReminder };
