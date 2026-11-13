const runTests = require('../../test/api/api.test');

if (require.main === module) {
  runTests().catch(() => {
    process.exitCode = 1;
  });
}

module.exports = runTests;
