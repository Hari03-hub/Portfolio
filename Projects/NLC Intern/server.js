const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configure multer to preserve original file extensions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Optionally, prefix the filename with a timestamp to prevent name collisions
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Middleware for serving static files and parsing JSON
app.use(express.static('public'));
// Serve the 'uploads' directory as a static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// Excel file path
const EXCEL_FILE = 'files_data.xlsx';

// Ensure the Excel file exists
if (!fs.existsSync(EXCEL_FILE)) {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet([]);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Files');
  xlsx.writeFile(workbook, EXCEL_FILE);
}

// Endpoint to upload file
app.post('/upload', upload.single('file'), (req, res) => {
  const { fileName, fileDescription } = req.body;

  // Construct the file path with the `/uploads/` prefix
  const filePath = `/uploads/${req.file.filename}`;

  // Read the existing Excel file
  const workbook = xlsx.readFile(EXCEL_FILE);
  const worksheet = workbook.Sheets['Files'];

  // Append new data
  const existingData = xlsx.utils.sheet_to_json(worksheet);
  const newData = {
    FileName: fileName,
    FileDescription: fileDescription,
    FilePath: filePath,
  };
  existingData.push(newData);

  // Write back to the Excel file
  const updatedWorksheet = xlsx.utils.json_to_sheet(existingData);
  workbook.Sheets['Files'] = updatedWorksheet;
  xlsx.writeFile(workbook, EXCEL_FILE);

  res.json({ message: 'File uploaded successfully!' });
});

// Endpoint to fetch file data
app.get('/files', (req, res) => {
  const workbook = xlsx.readFile(EXCEL_FILE);
  const worksheet = workbook.Sheets['Files'];
  const data = xlsx.utils.sheet_to_json(worksheet);
  res.json(data);
});

// Remove or comment out the '/view/:filePath' route
// app.get('/view/:filePath', (req, res) => {
//   const filePath = req.params.filePath;
//   res.sendFile(path.resolve(filePath));
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
