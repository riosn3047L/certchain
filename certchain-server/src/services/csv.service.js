/**
 * CSV parsing and validation service for bulk certificate upload.
 * Uses simple splitting instead of Papa Parse to avoid extra dependency.
 */

/**
 * Parse CSV text content into an array of row objects.
 * Expects headers: fullName, studentId, degreeProgramme, graduationYear
 */
export function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return []; // Need at least header + 1 data row

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue; // Skip malformed rows

    const row = {};
    headers.forEach((header, idx) => {
      // Map common header names to standardised keys
      if (header === 'fullname' || header === 'full_name' || header === 'name' || header === 'student_name') {
        row.fullName = values[idx];
      } else if (header === 'studentid' || header === 'student_id' || header === 'roll_number' || header === 'rollno') {
        row.studentId = values[idx];
      } else if (header === 'degreeprogramme' || header === 'degree_programme' || header === 'degree' || header === 'programme') {
        row.degreeProgramme = values[idx];
      } else if (header === 'graduationyear' || header === 'graduation_year' || header === 'year') {
        row.graduationYear = parseInt(values[idx]) || values[idx];
      } else {
        row[header] = values[idx];
      }
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Validate a single certificate row.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateCertificateRow(row) {
  const errors = [];

  if (!row.fullName || row.fullName.length < 2) {
    errors.push('Full name is required and must be at least 2 characters.');
  }

  if (!row.studentId || row.studentId.length < 1) {
    errors.push('Student ID is required.');
  }

  if (!row.degreeProgramme || row.degreeProgramme.length < 2) {
    errors.push('Degree programme is required.');
  }

  const year = parseInt(row.graduationYear);
  if (!year || year < 1900 || year > 2100) {
    errors.push('Graduation year must be a valid year between 1900 and 2100.');
  }

  return { valid: errors.length === 0, errors };
}
