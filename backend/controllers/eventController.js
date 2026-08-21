import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const withAvailability = async (events) => {
  const eventIds = events.map((e) => e._id);
  const counts = await Registration.aggregate([
    { $match: { event: { $in: eventIds }, status: "Registered" } },
    { $group: { _id: "$event", count: { $sum: 1 } } },
  ]);
  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id.toString()] = c.count;
  });

  return events.map((e) => {
    const obj = e.toObject();
    const registered = countMap[e._id.toString()] || 0;
    obj.registeredCount = registered;
    obj.availableSeats = Math.max(e.maxParticipants - registered, 0);
    return obj;
  });
};

export const getEvents = asyncHandler(async (req, res) => {
  const { search, eventType, status, sortBy, order, page = 1, limit = 9 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { eventName: { $regex: search, $options: "i" } },
      { venue: { $regex: search, $options: "i" } },
      { resourcePerson: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (eventType && eventType !== "All") query.eventType = eventType;
  if (status && status !== "All") query.status = status;

  const sortField = sortBy || "eventDate";
  const sortOrder = order === "desc" ? -1 : 1;
  const sortOptions = { [sortField]: sortOrder };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const [events, total] = await Promise.all([
    Event.find(query).sort(sortOptions).skip(skip).limit(limitNum).populate("createdBy", "name email"),
    Event.countDocuments(query),
  ]);

  const eventsWithAvailability = await withAvailability(events);

  res.status(200).json({
    success: true,
    count: eventsWithAvailability.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    events: eventsWithAvailability,
  });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate("createdBy", "name email");
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  const [withCounts] = await withAvailability([event]);
  res.status(200).json({ success: true, event: withCounts });
});

export const createEvent = asyncHandler(async (req, res) => {
  const { eventName, eventType, resourcePerson, eventDate, venue, maxParticipants, description, isPaid, price } =
    req.body;

  const event = await Event.create({
    eventName,
    eventType,
    resourcePerson,
    eventDate,
    venue,
    maxParticipants,
    description,
    isPaid: !!isPaid,
    price: isPaid ? Number(price) || 0 : 0,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Event created successfully", event });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const updatableFields = [
    "eventName",
    "eventType",
    "resourcePerson",
    "eventDate",
    "venue",
    "maxParticipants",
    "description",
    "status",
    "isPaid",
    "price",
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  });

  if (!event.isPaid) event.price = 0;

  await event.save();
  res.status(200).json({ success: true, message: "Event updated successfully", event });
});

export const updateEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  event.status = status;
  await event.save();

  res.status(200).json({ success: true, message: "Event status updated", event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();

  res.status(200).json({ success: true, message: "Event deleted successfully" });
});
