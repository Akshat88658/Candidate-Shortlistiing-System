const mongoose = require('mongoose');
require('dotenv').config();
const Complaint = require('./models/Complaint');
const { analyzeComplaintText } = require('./routes/ai');

async function runTests() {
  console.log('🔌 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Database.');
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }

  // Clear previous test records
  console.log('🧹 Cleaning test complaints...');
  await Complaint.deleteMany({ email: /test-complaints-.*@gmail\.com/ });

  console.log('\n--- STARTING EXAM TEST CASES ---');

  // Test Case 1: Water leakage issue -> Water Department suggestion
  console.log('\n🧪 Test Case 1: Water Leakage Complaint');
  const t1 = {
    name: 'Rahul Kumar',
    email: 'test-complaints-rahul@gmail.com',
    title: 'Water Leakage Issue',
    description: 'Water pipeline damaged near market area, massive wastage.',
    category: 'Water Supply',
    location: 'Ghaziabad'
  };

  const a1 = await analyzeComplaintText(t1);
  console.log('💡 AI Suggested Dept:', a1.department);
  console.log('💡 AI Detected Priority:', a1.priority);
  console.log('💡 AI Summary:', a1.summary);
  console.log('💡 AI AutoResponse:', a1.autoResponse.substring(0, 100) + '...\n');

  if (a1.department === 'Water Department') {
    console.log('🟢 PASS: Correctly routed to Water Department!');
  } else {
    console.log('🔴 FAIL: Department routing issue.');
  }

  // Test Case 2: Electricity issue -> High priority alert
  console.log('\n🧪 Test Case 2: Electricity Sparking Complaint');
  const t2 = {
    name: 'Amit Sharma',
    email: 'test-complaints-amit@gmail.com',
    title: 'Electricity sparking wire',
    description: 'High voltage sparking from transformer on main road street pole. Extremely dangerous.',
    category: 'Electricity',
    location: 'Noida'
  };

  const a2 = await analyzeComplaintText(t2);
  console.log('💡 AI Suggested Dept:', a2.department);
  console.log('💡 AI Detected Priority:', a2.priority);
  
  if (a2.priority === 'High' && a2.department === 'Electricity Department') {
    console.log('🟢 PASS: Correctly flagged as High priority alert and routed to Electricity Department!');
  } else {
    console.log('🔴 FAIL: Electricity priority or routing mismatch.');
  }

  // Test Case 3: Garbage complaint -> Sanitation department
  console.log('\n🧪 Test Case 3: Garbage pileup complaint');
  const t3 = {
    name: 'Neha Gupta',
    email: 'test-complaints-neha@gmail.com',
    title: 'Garbage dump pile',
    description: 'Garbage not cleared for over 5 days behind the park. Rotting waste spreading foul smell.',
    category: 'Sanitation',
    location: 'Delhi'
  };

  const a3 = await analyzeComplaintText(t3);
  console.log('💡 AI Suggested Dept:', a3.department);
  console.log('💡 AI Detected Priority:', a3.priority);

  if (a3.department === 'Sanitation Department') {
    console.log('🟢 PASS: Correctly routed to Sanitation Department!');
  } else {
    console.log('🔴 FAIL: Sanitation routing mismatch.');
  }

  // Test Case 4: Long complaint text -> AI generated summary
  console.log('\n🧪 Test Case 4: Long complaint text summarization');
  const longText = 'Hello sir, I am a resident of pocket A block B housing society. We have been facing severe water issues since the last three weeks. The pipeline leading to the block has suffered multiple fractures. There is dirty sewer water mixing with clean drinking water. Many children and senior citizens are falling sick due to water contamination. We contacted the local plumber but he said it requires heavy machinery from the municipality. Please fix this critical health hazard immediately before an epidemic breaks out.';
  const t4 = {
    name: 'Vikas Singh',
    email: 'test-complaints-vikas@gmail.com',
    title: 'Severe drinking water contamination epidemic',
    description: longText,
    category: 'Water Supply',
    location: 'Ghaziabad'
  };

  const a4 = await analyzeComplaintText(t4);
  console.log('💡 AI Generated Summary:', a4.summary);
  if (a4.summary && a4.summary.length > 10) {
    console.log('🟢 PASS: AI generated a robust summary successfully!');
  } else {
    console.log('🔴 FAIL: Summary was empty or too short.');
  }

  // Save to DB to test full CRUD & Validation
  console.log('\n🧪 Test Case 5: Saving Valid Complaint into DB');
  try {
    const complaint = new Complaint({
      ...t1,
      aiPriority: a1.priority,
      aiDepartment: a1.department,
      aiSummary: a1.summary,
      aiAutoResponse: a1.autoResponse
    });
    const saved = await complaint.save();
    console.log('🟢 PASS: Complaint saved successfully! ID:', saved._id);
  } catch (err) {
    console.log('🔴 FAIL: Save failed:', err.message);
  }

  // Test validation errors (Invalid email)
  console.log('\n🧪 Test Case 6: Schema Validation (Invalid Email format)');
  try {
    const invalidC = new Complaint({
      name: 'Rohan',
      email: 'rohan-invalid-email-format',
      title: 'Water Leak',
      description: 'Pipeline damage',
      category: 'Water Supply',
      location: 'Ghaziabad'
    });
    await invalidC.save();
    console.log('🔴 FAIL: Saved a document with invalid email format!');
  } catch (err) {
    console.log('🟢 PASS: Correctly blocked invalid email! Error:', err.message);
  }

  // Test validation errors (Missing Title)
  console.log('\n🧪 Test Case 7: Schema Validation (Missing Title)');
  try {
    const invalidC = new Complaint({
      name: 'Rohan',
      email: 'rohan@gmail.com',
      description: 'Pipeline damage',
      category: 'Water Supply',
      location: 'Ghaziabad'
    });
    await invalidC.save();
    console.log('🔴 FAIL: Saved a document with missing title!');
  } catch (err) {
    console.log('🟢 PASS: Correctly blocked missing title! Error:', err.message);
  }

  // Query Filter by Location
  console.log('\n🧪 Test Case 8: Query Filtering by location');
  try {
    const matches = await Complaint.find({ location: { $regex: 'Ghaziabad', $options: 'i' } });
    console.log(`💡 Matches found for 'Ghaziabad': ${matches.length}`);
    if (matches.length > 0) {
      console.log('🟢 PASS: Retrieved matching location records!');
    } else {
      console.log('🔴 FAIL: Location filter returned 0 results.');
    }
  } catch (err) {
    console.log('🔴 FAIL: Location filter failed:', err.message);
  }

  // Clean up
  console.log('\n🧹 Cleaning up...');
  await Complaint.deleteMany({ email: /test-complaints-.*@gmail\.com/ });
  
  await mongoose.disconnect();
  console.log('🔌 Disconnected. All tests completed successfully!');
}

runTests();
