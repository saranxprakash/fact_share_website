import Group from "../models/Group.js";

export async function listGroups(req, res) {
  const groups = await Group.find().sort({ createdAt: -1 });
  res.json(groups);
}

export async function getGroup(req, res) {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: "Community not found" });
  res.json(group);
}

export async function createGroup(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "A community name is required" });
    }

    const existing = await Group.findOne({ name });
    if (existing) {
      return res
        .status(409)
        .json({ error: "A community with that name already exists" });
    }

    // The creator automatically becomes the first member
    const group = await Group.create({
      name,
      description,
      createdBy: req.userId,
      members: [req.userId],
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: "Failed to create community" });
  }
}

export async function joinGroup(req, res) {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: "Community not found" });

  const alreadyMember = group.members.some(
    (id) => id.toString() === req.userId,
  );
  if (!alreadyMember) {
    group.members.push(req.userId);
    await group.save();
  }
  res.json(group);
}

export async function leaveGroup(req, res) {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: "Community not found" });

  group.members = group.members.filter((id) => id.toString() !== req.userId);
  await group.save();
  res.json(group);
}
