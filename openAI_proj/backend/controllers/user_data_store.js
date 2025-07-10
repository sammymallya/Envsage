const fs = require('fs');

function updateFile(data) {
  const filePath = '/Users/sammy/Desktop/Coding/GitHub/Envsage/openAI_proj/backend/storage/data.txt'; // relative to your project root
  fs.writeFile(filePath, data, (err) => {
    if (err) throw err;
    console.log('File updated!');
  });
}
module.exports = updateFile;