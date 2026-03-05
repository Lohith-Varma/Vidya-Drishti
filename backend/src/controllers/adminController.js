// Re-export from focused controllers for backwards compatibility
const userController = require('./userController')
const testController = require('./testController')

module.exports = {
  ...userController,
  ...testController
}
