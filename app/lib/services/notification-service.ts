/**
 * Audio notification service.
 * Handles playing notification sounds using HTML5 Audio API.
 */

let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let isAudioInitialized = false;

/**
 * Initializes the audio context for notification sounds.
 * Must be called after user interaction due to browser autoplay policies.
 */
export async function initializeAudio(): Promise<boolean> {
  if (isAudioInitialized) {
    return true;
  }

  try {
    if (typeof window === 'undefined') {
      return false;
    }

    // Create or resume audio context
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Preload the notification sound
    await preloadNotificationSound();
    
    isAudioInitialized = true;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotificationService] Audio initialized successfully');
    }
    
    return true;
  } catch (error) {
    console.warn('[NotificationService] Failed to initialize audio:', error);
    return false;
  }
}

/**
 * Preloads the notification sound file.
 * Tries multiple formats for compatibility.
 */
async function preloadNotificationSound(): Promise<void> {
  if (!audioContext) {
    return;
  }

  const soundUrls = ['/sounds/notification.wav', '/sounds/notification.mp3'];
  
  for (const url of soundUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[NotificationService] Notification sound preloaded from:', url);
      }
      return; // Success, exit loop
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[NotificationService] Failed to load sound from:', url, error);
      }
    }
  }
  
  console.warn('[NotificationService] Could not load any notification sound');
}

/**
 * Plays the notification sound.
 * @returns true if sound was played, false otherwise
 */
export async function playNotificationSound(): Promise<boolean> {
  try {
    // Try to initialize audio if not already done
    if (!isAudioInitialized) {
      await initializeAudio();
    }

    if (!audioContext || !audioBuffer) {
      // Fallback: try using simple Audio element
      return playFallbackSound();
    }

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Create and play the sound
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);

    if (process.env.NODE_ENV === 'development') {
      console.log('[NotificationService] Playing notification sound');
    }

    return true;
  } catch (error) {
    console.warn('[NotificationService] Failed to play notification sound:', error);
    // Try fallback
    return playFallbackSound();
  }
}

/**
 * Fallback method using simple Audio element.
 */
function playFallbackSound(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    // Try WAV first, then MP3
    const soundUrls = ['/sounds/notification.wav', '/sounds/notification.mp3'];
    
    for (const url of soundUrls) {
      try {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Silently fail and try next format
        });
        return true;
      } catch {
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('[NotificationService] Fallback sound failed:', error);
    return false;
  }
}

/**
 * Checks if audio is available.
 */
export function isAudioAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!(window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
}

/**
 * Sets up user interaction listener to enable audio.
 * Call this once on app initialization.
 */
export function setupAudioOnUserInteraction(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const enableAudio = () => {
    initializeAudio();
    // Remove listeners after first interaction
    window.removeEventListener('click', enableAudio);
    window.removeEventListener('touchstart', enableAudio);
    window.removeEventListener('keydown', enableAudio);
  };

  window.addEventListener('click', enableAudio, { once: true });
  window.addEventListener('touchstart', enableAudio, { once: true });
  window.addEventListener('keydown', enableAudio, { once: true });
}
