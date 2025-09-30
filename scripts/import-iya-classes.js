#!/usr/bin/env node

/**
 * Import IYA Classes from CSV files
 * 
 * This script processes the CSV files containing IYA class data and populates
 * the classes table with unique courses and their instructors.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Handle CSV parsing with quoted fields that may contain commas
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 3) {
      data.push({
        course: values[0],
        instructors: values[1],
        semester: values[2]
      });
    }
  }
  
  return data;
}

// Function to extract course code and title from course string
function parseCourseInfo(courseString) {
  // Examples: "IDSN 505 - Intensive", "ACAD 174 - Innovators Forum"
  const match = courseString.match(/^([A-Z]+ \d+)\s*-\s*(.+)$/);
  if (match) {
    return {
      code: match[1],
      title: match[2]
    };
  }
  
  // Fallback for courses that don't match the pattern
  return {
    code: courseString,
    title: courseString
  };
}

// Function to process instructors string
function parseInstructors(instructorsString) {
  if (!instructorsString || instructorsString.trim() === 'TBA') {
    return [];
  }
  
  // Split by comma and clean up
  return instructorsString
    .split(',')
    .map(instructor => instructor.trim())
    .filter(instructor => instructor && instructor !== 'TBA');
}

// Main function to process and import classes
async function importClasses() {
  try {
    console.log('Starting IYA classes import...');
    
    // Read CSV files
    const idsnPath = path.join(__dirname, '../../iya_classes/usc_idsn_courses_all.csv');
    const acadPath = path.join(__dirname, '../../iya_classes/usc_acad_courses_all.csv');
    
    if (!fs.existsSync(idsnPath) || !fs.existsSync(acadPath)) {
      console.error('CSV files not found. Please ensure the files exist in the iya_classes directory.');
      process.exit(1);
    }
    
    const idsnContent = fs.readFileSync(idsnPath, 'utf8');
    const acadContent = fs.readFileSync(acadPath, 'utf8');
    
    // Parse CSV data
    const idsnData = parseCSV(idsnContent);
    const acadData = parseCSV(acadContent);
    
    console.log(`Found ${idsnData.length} IDSN courses and ${acadData.length} ACAD courses`);
    
    // Process all courses
    const allCourses = [...idsnData, ...acadData];
    const courseMap = new Map();
    
    for (const row of allCourses) {
      const courseInfo = parseCourseInfo(row.course);
      const instructors = parseInstructors(row.instructors);
      
      const courseKey = courseInfo.code;
      
      if (!courseMap.has(courseKey)) {
        courseMap.set(courseKey, {
          code: courseInfo.code,
          title: courseInfo.title,
          instructors: new Set()
        });
      }
      
      // Add instructors to the set
      instructors.forEach(instructor => {
        courseMap.get(courseKey).instructors.add(instructor);
      });
    }
    
    console.log(`Processing ${courseMap.size} unique courses...`);
    
    // Clear existing classes (optional - comment out if you want to keep existing data)
    console.log('Clearing existing classes...');
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all classes
    
    if (deleteError) {
      console.error('Error clearing existing classes:', deleteError);
      return;
    }
    
    // Insert classes into database
    const classesToInsert = Array.from(courseMap.values()).map(course => ({
      school: 'USC',
      code: course.code,
      title: course.title,
      description: `IYA course: ${course.title}`,
      created_at: new Date().toISOString()
    }));
    
    console.log('Inserting classes into database...');
    const { data: insertedClasses, error: insertError } = await supabase
      .from('classes')
      .insert(classesToInsert)
      .select();
    
    if (insertError) {
      console.error('Error inserting classes:', insertError);
      return;
    }
    
    console.log(`Successfully imported ${insertedClasses.length} classes!`);
    
    // Show some examples
    console.log('\nSample imported classes:');
    insertedClasses.slice(0, 5).forEach(course => {
      console.log(`- ${course.code}: ${course.title} (Instructors: ${course.instructors})`);
    });
    
  } catch (error) {
    console.error('Error importing classes:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importClasses();
}

module.exports = { importClasses };
