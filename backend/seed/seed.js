require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('../models/Department');
const Admin = require('../models/Admin');
const Officer = require('../models/Officer');

const departments = [
  {
    name: 'Andhra Pradesh Southern Power Distribution Company Limited',
    shortName: 'APSPDCL',
    description: 'Manages electricity supply, street lighting, transformer faults and all power-related infrastructure in Guntur district.',
    categories: ['Broken / Non-functioning Street Light', 'Power Outage', 'Electrical Hazard / Exposed Wiring', 'Transformer Fault'],
    contactEmail: 'se.guntur@apspdcl.in',
    headName: 'Superintending Engineer – Guntur Circle, APSPDCL',
    colorHex: '#F59E0B',
  },
  {
    name: 'Guntur Municipal Corporation – Roads Division',
    shortName: 'GMC Roads',
    description: 'Responsible for construction, repair and maintenance of all roads, footpaths and pavements within Guntur Municipal limits.',
    categories: ['Pothole / Road Damage', 'Damaged Footpath / Sidewalk', 'Road Flooding / Waterlogging', 'Illegal Encroachment on Footpath'],
    contactEmail: 'ee.roads@gunturcorporation.in',
    headName: 'Executive Engineer – Roads, Guntur Municipal Corporation',
    colorHex: '#6B7280',
  },
  {
    name: 'Guntur Municipal Corporation – Sanitation Division',
    shortName: 'GMC Sanitation',
    description: 'Handles solid waste collection, public cleanliness, garbage disposal and sanitation drives across Guntur city.',
    categories: ['Garbage Accumulation on Road', 'Illegal Dumping of Waste', 'Public Toilet Issue', 'Burning of Garbage / Waste'],
    contactEmail: 'healthofficer@gunturcorporation.in',
    headName: 'Health Officer, Guntur Municipal Corporation',
    colorHex: '#10B981',
  },
  {
    name: 'Guntur Water Supply & Sewerage Board',
    shortName: 'GWSSB',
    description: 'Oversees drinking water supply, sewerage systems, drainage networks and pipeline infrastructure across Guntur.',
    categories: ['Water Supply Disruption', 'Water Pipeline Leak', 'Sewage / Drainage Overflow', 'Open Manhole Cover', 'Contaminated Water Supply'],
    contactEmail: 'ee.water@gunturcorporation.in',
    headName: 'Executive Engineer – Water Supply, GWSSB Guntur',
    colorHex: '#3B82F6',
  },
  {
    name: 'Animal Husbandry & Veterinary Department',
    shortName: 'Animal Husbandry',
    description: 'Addresses stray animal menace, animal welfare, capture and vaccination drives in Guntur district.',
    categories: ['Stray Dogs / Animals Menace', 'Animal Attack Incident', 'Dead Animal on Road / Public Area', 'Stray Cattle Blocking Traffic'],
    contactEmail: 'daho.guntur@ap.gov.in',
    headName: 'District Animal Husbandry Officer, Guntur',
    colorHex: '#8B5CF6',
  },
  {
    name: 'AP Roads & Buildings Department',
    shortName: 'R&B Department',
    description: 'Maintains state highways, major arterial roads, flyovers, bridges and government buildings in Guntur region.',
    categories: ['Major Road / Highway Damage', 'Bridge or Overbridge Issue', 'Fallen Tree Blocking Road', 'Traffic Signal Malfunction'],
    contactEmail: 'de.rnb.guntur@ap.gov.in',
    headName: 'Divisional Engineer – R&B, Guntur',
    colorHex: '#EF4444',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Seed departments
    await Department.deleteMany({});
    const depts = await Department.insertMany(departments);
    console.log(`✅ ${depts.length} departments seeded`);

    // Seed admin
    await Admin.deleteMany({});
    const admin = new Admin({
      name: process.env.ADMIN_NAME || 'GMC Admin',
      email: process.env.ADMIN_EMAIL || 'admin@gunturcorporation.in',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
    });
    await admin.save();
    console.log(`✅ Admin seeded — Email: ${admin.email}  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

    // Seed sample officers
    await Officer.deleteMany({});
    const officerData = [
      { name: 'P. Venkata Rao', email: 'officer.apspdcl1@guntur.in', phone: '9848012345', password: 'Officer@123', designation: 'Junior Lineman', department: depts[0]._id },
      { name: 'K. Srinivas Reddy', email: 'officer.apspdcl2@guntur.in', phone: '9848023456', password: 'Officer@123', designation: 'Assistant Engineer – Electricity', department: depts[0]._id },
      { name: 'M. Rambabu', email: 'officer.roads1@guntur.in', phone: '9848034567', password: 'Officer@123', designation: 'Junior Engineer – Roads', department: depts[1]._id },
      { name: 'G. Lakshmi Prasad', email: 'officer.roads2@guntur.in', phone: '9848045678', password: 'Officer@123', designation: 'Assistant Engineer – Roads', department: depts[1]._id },
      { name: 'T. Suresh Kumar', email: 'officer.sanitation1@guntur.in', phone: '9848056789', password: 'Officer@123', designation: 'Sanitation Inspector', department: depts[2]._id },
      { name: 'B. Naga Raju', email: 'officer.water1@guntur.in', phone: '9848067890', password: 'Officer@123', designation: 'Junior Engineer – Water Supply', department: depts[3]._id },
      { name: 'Ch. Durga Prasad', email: 'officer.animal1@guntur.in', phone: '9848078901', password: 'Officer@123', designation: 'Veterinary Assistant', department: depts[4]._id },
      { name: 'V. Krishna Murthy', email: 'officer.rnb1@guntur.in', phone: '9848089012', password: 'Officer@123', designation: 'Junior Engineer – R&B', department: depts[5]._id },
    ];
    for (const o of officerData) {
      const officer = new Officer(o);
      await officer.save();
    }
    console.log(`✅ ${officerData.length} officers seeded`);
    console.log('\n🎉 Seed complete! All officers have password: Officer@123');

    mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

seed();
