const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Import Paper model - assuming your model is defined in a separate file
// If not, copy your schema definition here
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

// Sample data
const samplePapers = [
  {
    paperId: "PAPER001",
    title: "Advanced Neural Networks",
    domain: "AI",
    status: "pending",
    slots: [
      {slotNumber: "S1", email: "", isFilled: false},
      {slotNumber: "S2", email: "", isFilled: false},
      {slotNumber: "S3", email: "", isFilled: false},
      {slotNumber: "S4", email: "", isFilled: false},
      {slotNumber: "S5", email: "", isFilled: false}
    ]
  },
  {
    paperId: "PAPER002",
    title: "Climate Change Impacts",
    domain: "Environmental Science",
    status: "pending",
    slots: [
      {slotNumber: "S1", email: "", isFilled: false},
      {slotNumber: "S2", email: "", isFilled: false},
      {slotNumber: "S3", email: "", isFilled: false},
      {slotNumber: "S4", email: "", isFilled: false},
      {slotNumber: "S5", email: "", isFilled: false}
    ]
  }
];

// Function to seed the database
const seedDB = async () => {
  try {
    // Clear existing data
    await Paper.deleteMany({});
    console.log('Database cleared');
    
    // Insert new data
    await Paper.insertMany(samplePapers);
    console.log('Sample papers added to database');
    
    // Close connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
  }
};

// Run the seed function
seedDB();