// Import dynamically to allow module reset
let initializeAudio: typeof import('../notification-service').initializeAudio;
let playNotificationSound: typeof import('../notification-service').playNotificationSound;
let isAudioAvailable: typeof import('../notification-service').isAudioAvailable;
let setupAudioOnUserInteraction: typeof import('../notification-service').setupAudioOnUserInteraction;

beforeAll(() => {
  // Initial import
  const module = require('../notification-service');
  initializeAudio = module.initializeAudio;
  playNotificationSound = module.playNotificationSound;
  isAudioAvailable = module.isAudioAvailable;
  setupAudioOnUserInteraction = module.setupAudioOnUserInteraction;
});

// Mock AudioContext
const mockAudioContext = {
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  createBufferSource: jest.fn().mockReturnValue({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn(),
  }),
  decodeAudioData: jest.fn().mockResolvedValue({}),
  destination: {},
};

// Mock Audio
const mockAudio = {
  volume: 0.5,
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
};

describe('notification-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Reset module state including isAudioInitialized flag
    
    // Re-import after reset
    const module = require('../notification-service');
    initializeAudio = module.initializeAudio;
    playNotificationSound = module.playNotificationSound;
    isAudioAvailable = module.isAudioAvailable;
    setupAudioOnUserInteraction = module.setupAudioOnUserInteraction;
    
    (global.AudioContext as jest.Mock) = jest.fn().mockImplementation(() => mockAudioContext);
    (global.Audio as jest.Mock) = jest.fn().mockImplementation(() => mockAudio);
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
  });

  describe('isAudioAvailable', () => {
    it('should return true when AudioContext is available', () => {
      expect(isAudioAvailable()).toBe(true);
    });

    it('should return false when AudioContext is not available', () => {
      // In Jest, window is always defined, so we test the AudioContext availability check
      // by temporarily removing AudioContext
      const originalAudioContext = (global.window as any).AudioContext;
      delete (global.window as any).AudioContext;
      delete (global.window as any).webkitAudioContext;
      
      const result = isAudioAvailable();
      
      // Restore
      if (originalAudioContext) {
        (global.window as any).AudioContext = originalAudioContext;
      }
      
      expect(result).toBe(false);
    });
  });

  describe('initializeAudio', () => {
    it('should initialize audio context', async () => {
      // Mock successful fetch for preloading
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      });
      
      const result = await initializeAudio();
      
      expect(result).toBe(true);
      expect(global.AudioContext).toHaveBeenCalled();
    });

    it('should resume suspended audio context', async () => {
      // Create a new mock with suspended state
      const resumeFn = jest.fn().mockResolvedValue(undefined);
      const suspendedMock = {
        state: 'suspended',
        resume: resumeFn,
        createBufferSource: jest.fn().mockReturnValue({
          buffer: null,
          connect: jest.fn(),
          start: jest.fn(),
        }),
        decodeAudioData: jest.fn().mockResolvedValue({}),
        destination: {},
      };
      (global.AudioContext as jest.Mock) = jest.fn().mockImplementation(() => suspendedMock);
      
      // Mock successful fetch for preloading
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      });
      
      await initializeAudio();
      
      expect(resumeFn).toHaveBeenCalled();
      
      // Restore original mock
      (global.AudioContext as jest.Mock) = jest.fn().mockImplementation(() => mockAudioContext);
    });

    it('should return true if already initialized', async () => {
      // Mock successful fetch for preloading
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      });
      
      await initializeAudio();
      jest.clearAllMocks();
      
      const result = await initializeAudio();
      
      expect(result).toBe(true);
      expect(global.AudioContext).not.toHaveBeenCalled();
    });

    it('should handle AudioContext errors gracefully', async () => {
      // Test error handling by making AudioContext throw
      const originalAudioContext = global.AudioContext;
      let callCount = 0;
      (global.AudioContext as jest.Mock) = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('AudioContext not available');
        }
        // Return valid mock for subsequent calls
        return mockAudioContext;
      });
      
      // Mock fetch to fail so preload fails
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });
      
      const result = await initializeAudio();
      
      expect(result).toBe(false);
      
      // Restore
      global.AudioContext = originalAudioContext;
      (global.AudioContext as jest.Mock) = jest.fn().mockImplementation(() => mockAudioContext);
    });

    it('should handle initialization errors gracefully', async () => {
      const originalAudioContext = global.AudioContext;
      let callCount = 0;
      (global.AudioContext as jest.Mock) = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('AudioContext not supported');
        }
        return mockAudioContext;
      });
      
      const result = await initializeAudio();
      
      expect(result).toBe(false);
      
      // Restore
      global.AudioContext = originalAudioContext;
      (global.AudioContext as jest.Mock) = jest.fn().mockImplementation(() => mockAudioContext);
    });
  });

  describe('playNotificationSound', () => {
    beforeEach(async () => {
      // Pre-initialize audio
      mockAudioContext.state = 'running';
      // Mock successful fetch for preloading
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      });
      await initializeAudio();
    });

    it('should play sound using AudioContext', async () => {
      const result = await playNotificationSound();
      
      expect(result).toBe(true);
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    it('should resume suspended audio context', async () => {
      mockAudioContext.state = 'suspended';
      
      await playNotificationSound();
      
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should fallback to Audio element when AudioContext unavailable', async () => {
      mockAudioContext.createBufferSource.mockImplementationOnce(() => {
        throw new Error('Buffer source error');
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      });
      
      const result = await playNotificationSound();
      
      expect(result).toBe(true);
      expect(global.Audio).toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      // Make sure audio is initialized first
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      });
      await initializeAudio();
      
      // Now test error handling - make createBufferSource throw
      mockAudioContext.createBufferSource.mockImplementationOnce(() => {
        throw new Error('Play error');
      });
      
      // Make Audio constructor throw for both URLs to ensure fallback fails completely
      let audioCallCount = 0;
      (global.Audio as jest.Mock) = jest.fn().mockImplementation(() => {
        audioCallCount++;
        throw new Error('Audio not supported');
      });
      
      const result = await playNotificationSound();
      
      // Should return false when both primary and fallback fail
      expect(result).toBe(false);
      expect(audioCallCount).toBeGreaterThan(0); // Verify fallback was attempted
    });
  });

  describe('setupAudioOnUserInteraction', () => {
    it('should set up event listeners', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      setupAudioOnUserInteraction();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), { once: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { once: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), { once: true });
    });

    it('should initialize audio on user interaction', async () => {
      // Reset module state by clearing the initialization flag
      // We'll test by verifying the event listener setup and that it calls initializeAudio
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      // Mock successful fetch for preloading
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      });
      
      setupAudioOnUserInteraction();
      
      // Verify listeners were added
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), { once: true });
      
      // Get the handler function that was registered
      const clickHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'click'
      )?.[1] as () => void;
      
      expect(clickHandler).toBeDefined();
      
      // Call the handler directly to test initialization
      if (clickHandler) {
        await clickHandler();
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(global.AudioContext).toHaveBeenCalled();
      }
    });

    it('should remove listeners after first interaction', async () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      setupAudioOnUserInteraction();
      
      const clickEvent = new MouseEvent('click');
      window.dispatchEvent(clickEvent);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});
