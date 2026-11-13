const fs = require('fs');
const pdf = require('html-pdf');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../html/terms.html'), 'utf8');
const options = {
    format: 'A4',
    border: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
    }
};

pdf.create(html, options).toFile(path.join(__dirname, '../../../terms.pdf'), function(err, res) {
    if (err) return console.log(err);
    console.log('PDF created successfully:', res.filename);
});