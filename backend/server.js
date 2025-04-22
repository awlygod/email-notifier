// server.js
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Paper Schema
const paperSchema = new mongoose.Schema({
  paperId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  domain: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'submit', 'reviewing', 'accepted', 'published'],
    default: 'pending'
  },
  slots: [{
    slotNumber: String,
    email: String,
    isFilled: { type: Boolean, default: false }
  }]
});

const Paper = mongoose.model('Paper', paperSchema);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const getEmailTemplate = (paper, stage) => {
  const templates = {
    submit: {
      subject: 'Paper Submitted for Review',
      html: `
        <h2>Paper Submission Notification</h2>
        <p>Hello,</p>
        <p>The paper "<strong>${paper.title}</strong>" (ID: ${paper.paperId}) has been submitted for review.</p>
        <p>Domain: ${paper.domain}</p>
        <p>Thank you for your participation.</p>
      `
    },
    reviewing: {
      subject: 'Paper Under Review',
      html: `
        <h2>Paper Review Notification</h2>
        <p>Hello,</p>
        <p>The paper "<strong>${paper.title}</strong>" (ID: ${paper.paperId}) is now under review.</p>
        <p>You will be notified when the review is complete.</p>
      `
    },
    accepted: {
      subject: 'Paper Accepted',
      html: `
        <h2>Paper Acceptance Notification</h2>
        <p>Hello,</p>
        <p>We are pleased to inform you that the paper "<strong>${paper.title}</strong>" (ID: ${paper.paperId}) has been accepted.</p>
        <p>Congratulations!</p>
      `
    },
    published: {
      subject: 'Paper Published',
      html: `
        <h2>Paper Publication Notification</h2>
        <p>Hello,</p>
        <p>The paper "<strong>${paper.title}</strong>" (ID: ${paper.paperId}) has been published.</p>
        <p>Thank you for your contribution.</p>
      `
    }
  };
  
  return templates[stage] || templates.submit;
};

// Routes

// Get all papers
app.get('/api/papers', async (req, res) => {
  try {
    const papers = await Paper.find();
    res.json(papers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get papers with all slots filled
app.get('/api/papers/filled-slots', async (req, res) => {
  try {
    const papers = await Paper.find();
    const filteredPapers = papers.filter(paper => 
      paper.slots.length > 0 && paper.slots.every(slot => slot.isFilled)
    );
    res.json(filteredPapers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new paper
app.post('/api/papers', async (req, res) => {
  const paper = new Paper({
    paperId: req.body.paperId,
    title: req.body.title,
    domain: req.body.domain,
    slots: req.body.slots || []
  });

  try {
    const newPaper = await paper.save();
    res.status(201).json(newPaper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update paper stage and send notifications
app.put('/api/papers/:id/update-stage', async (req, res) => {
  try {
    const { stage } = req.body;
    
    if (!['submit', 'reviewing', 'accepted', 'published'].includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage value' });
    }
    
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    
    // Check if all slots are filled
    const allSlotsFilled = paper.slots.every(slot => slot.isFilled);
    if (!allSlotsFilled) {
      return res.status(400).json({ message: 'Not all slots are filled' });
    }
    
    // Update paper status
    paper.status = stage;
    await paper.save();
    
    // Get all user emails from slots
    const emails = paper.slots.map(slot => slot.email);
    
    if (emails.length > 0) {
      // Get email template
      const template = getEmailTemplate(paper, stage);
      
      // Send emails
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails.join(', '),
        subject: template.subject,
        html: template.html
      };
      
      await transporter.sendMail(mailOptions);
      
      res.json({ 
        message: `Paper status updated to ${stage} and notifications sent`,
        paper 
      });
    } else {
      res.json({ 
        message: `Paper status updated to ${stage}, but no users to notify`,
        paper 
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fill a slot
app.put('/api/papers/:id/fill-slot', async (req, res) => {
  try {
    const { slotNumber, email } = req.body;
    
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    
    const slotIndex = paper.slots.findIndex(s => s.slotNumber === slotNumber);
    if (slotIndex === -1) {
      // Create a new slot if it doesn't exist
      paper.slots.push({
        slotNumber,
        email,
        isFilled: true
      });
    } else {
      // Update existing slot
      paper.slots[slotIndex].email = email;
      paper.slots[slotIndex].isFilled = true;
    }
    
    await paper.save();
    res.json(paper);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));