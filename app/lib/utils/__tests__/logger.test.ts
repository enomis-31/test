import { createLogger, logDebug, logInfo, logWarn, logError } from '../logger';

describe('logger', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logDebug', () => {
    it('should log debug message in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      logDebug('Test debug message', { function: 'test' });
      
      expect(consoleSpy.debug).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      logDebug('Test debug message');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('logInfo', () => {
    it('should log info message', () => {
      logInfo('Test info message', { function: 'test' });
      
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('logWarn', () => {
    it('should log warning message', () => {
      logWarn('Test warning message', { function: 'test' });
      
      expect(consoleSpy.warn).toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    it('should log error message', () => {
      logError('Test error message', undefined, { function: 'test' });
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log error with Error object', () => {
      const error = new Error('Test error');
      logError('Test error message', error, { function: 'test' });
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('createLogger', () => {
    it('should create logger with component name', () => {
      const logger = createLogger('TestComponent');
      
      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
    });

    it('should include component name in logs', () => {
      const logger = createLogger('TestComponent');
      logger.info('Test message', { function: 'test' });
      
      expect(consoleSpy.log).toHaveBeenCalled();
      const callArgs = consoleSpy.log.mock.calls[0][0];
      expect(callArgs).toContain('TestComponent');
    });
  });
});
