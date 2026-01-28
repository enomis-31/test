/**
 * Audio notification service.
 * Handles playing notification sounds using HTML5 Audio API.
 */

import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('NotificationService');

let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let isAudioInitialized = false;

/**
 * Initializes the audio context for notification sounds.
 * Must be called after user interaction due to browser autoplay policies.
 */
export async function initializeAudio(): Promise<boolean> {
  logger.debug('Initializing audio', {
    function: 'initializeAudio',
    isAlreadyInitialized: isAudioInitialized,
  });

  if (isAudioInitialized) {
    logger.debug('Audio already initialized', {
      function: 'initializeAudio',
    });
    return true;
  }

  try {
    if (typeof window === 'undefined') {
      logger.warn('Window is undefined, cannot initialize audio', {
        function: 'initializeAudio',
      });
      return false;
    }

    // Create or resume audio context
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    logger.debug('Audio context created', {
      function: 'initializeAudio',
      state: audioContext.state,
    });
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      logger.debug('Audio context resumed', {
        function: 'initializeAudio',
        newState: audioContext.state,
      });
    }

    // Preload the notification sound
    await preloadNotificationSound();
    
    isAudioInitialized = true;
    
    logger.info('Audio initialized successfully', {
      function: 'initializeAudio',
    });
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize audio', error, {
      function: 'initializeAudio',
    });
    return false;
  }
}

/**
 * Preloads the notification sound file.
 * Tries multiple formats for compatibility.
 */
async function preloadNotificationSound(): Promise<void> {
  logger.debug('Preloading notification sound', {
    function: 'preloadNotificationSound',
  });

  if (!audioContext) {
    logger.warn('Audio context not available for preloading', {
      function: 'preloadNotificationSound',
    });
    return;
  }

  const soundUrls = ['/sounds/notification.wav', '/sounds/notification.mp3'];
  
  for (const url of soundUrls) {
    try {
      logger.debug('Attempting to load sound', {
        function: 'preloadNotificationSound',
        url,
      });

      const response = await fetch(url);
      if (!response.ok) {
        logger.debug('Sound file not found or not accessible', {
          function: 'preloadNotificationSound',
          url,
          status: response.status,
        });
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      logger.info('Notification sound preloaded successfully', {
        function: 'preloadNotificationSound',
        url,
      });
      return; // Success, exit loop
    } catch (error) {
      logger.warn('Failed to load sound from URL', {
        function: 'preloadNotificationSound',
        url,
      });
      logger.debug('Sound loading error details', {
        function: 'preloadNotificationSound',
        url,
        error,
      });
    }
  }
  
  logger.warn('Could not load any notification sound from available URLs', {
    function: 'preloadNotificationSound',
    attemptedUrls: soundUrls,
  });
}

/**
 * Plays the notification sound.
 * @returns true if sound was played, false otherwise
 */
export async function playNotificationSound(): Promise<boolean> {
  logger.debug('Playing notification sound', {
    function: 'playNotificationSound',
  });

  try {
    // Try to initialize audio if not already done
    if (!isAudioInitialized) {
      logger.debug('Audio not initialized, initializing now', {
        function: 'playNotificationSound',
      });
      await initializeAudio();
    }

    if (!audioContext || !audioBuffer) {
      logger.warn('Audio context or buffer not available, using fallback', {
        function: 'playNotificationSound',
        hasContext: !!audioContext,
        hasBuffer: !!audioBuffer,
      });
      // Fallback: try using simple Audio element
      return playFallbackSound();
    }

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      logger.debug('Audio context suspended, resuming', {
        function: 'playNotificationSound',
      });
      await audioContext.resume();
    }

    // Create and play the sound
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);

    logger.info('Notification sound played successfully', {
      function: 'playNotificationSound',
    });

    return true;
  } catch (error) {
    logger.error('Failed to play notification sound', error, {
      function: 'playNotificationSound',
    });
    // Try fallback
    return playFallbackSound();
  }
}

/**
 * Fallback method using simple Audio element.
 */
function playFallbackSound(): boolean {
  logger.debug('Attempting fallback sound playback', {
    function: 'playFallbackSound',
  });

  try {
    if (typeof window === 'undefined') {
      logger.warn('Window is undefined, cannot play fallback sound', {
        function: 'playFallbackSound',
      });
      return false;
    }

    // Try WAV first, then MP3
    const soundUrls = ['/sounds/notification.wav', '/sounds/notification.mp3'];
    
    for (const url of soundUrls) {
      try {
        logger.debug('Trying fallback sound URL', {
          function: 'playFallbackSound',
          url,
        });

        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch((playError) => {
          logger.debug('Failed to play fallback audio element', {
            function: 'playFallbackSound',
            url,
            error: playError,
          });
        });
        
        logger.info('Fallback sound playback initiated', {
          function: 'playFallbackSound',
          url,
        });
        return true;
      } catch (error) {
        logger.debug('Error creating fallback audio element', {
          function: 'playFallbackSound',
          url,
          error,
        });
        continue;
      }
    }
    
    logger.warn('All fallback sound URLs failed', {
      function: 'playFallbackSound',
      attemptedUrls: soundUrls,
    });
    return false;
  } catch (error) {
    logger.error('Fallback sound playback failed', error, {
      function: 'playFallbackSound',
    });
    return false;
  }
}

/**
 * Checks if audio is available.
 */
export function isAudioAvailable(): boolean {
  const available = typeof window !== 'undefined' &&
    !!(window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  
  logger.debug('Audio availability check', {
    function: 'isAudioAvailable',
    available,
  });
  
  return available;
}

/**
 * Sets up user interaction listener to enable audio.
 * Call this once on app initialization.
 */
export function setupAudioOnUserInteraction(): void {
  logger.info('Setting up audio on user interaction', {
    function: 'setupAudioOnUserInteraction',
  });

  if (typeof window === 'undefined') {
    logger.warn('Window is undefined, cannot setup audio listeners', {
      function: 'setupAudioOnUserInteraction',
    });
    return;
  }

  const enableAudio = () => {
    logger.debug('User interaction detected, enabling audio', {
      function: 'setupAudioOnUserInteraction',
    });
    initializeAudio();
    // Remove listeners after first interaction
    window.removeEventListener('click', enableAudio);
    window.removeEventListener('touchstart', enableAudio);
    window.removeEventListener('keydown', enableAudio);
  };

  window.addEventListener('click', enableAudio, { once: true });
  window.addEventListener('touchstart', enableAudio, { once: true });
  window.addEventListener('keydown', enableAudio, { once: true });

  logger.debug('Audio interaction listeners registered', {
    function: 'setupAudioOnUserInteraction',
  });
}
