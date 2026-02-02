const WorkTransparency = require('../models/WorkTransparency');

exports.getAll = async (req, res) => {
  try {
    const posts = await WorkTransparency.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { date, hostelName, caption, workType } = req.body;
    const post = new WorkTransparency({
      date: date ? new Date(date) : new Date(),
      hostelName,
      caption,
      workType
    });

    if (req.file) {
      post.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const post = await WorkTransparency.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const { date, hostelName, caption, workType } = req.body;
    if (date) post.date = new Date(date);
    if (hostelName) post.hostelName = hostelName;
    if (caption) post.caption = caption;
    if (workType) post.workType = workType;

    if (req.file) {
      post.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const post = await WorkTransparency.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
