describe('Constants Index', () => {
    it('should export constants', () => {
      // Fix the path to use the correct relative path
      const constants = require('../../src/constants/index');
      expect(constants).toBeDefined();
    });
  });