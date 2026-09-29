import { useEffect, useState } from "react";

export function useProctoring(onTabSwitchLimit: () => void) {
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setViolations(v => {
          const newV = v + 1;
          if (newV >= 2) onTabSwitchLimit();
          return newV;
        });
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onTabSwitchLimit]);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.error("Failed to enter fullscreen", e);
    }
  };

  return { violations, isFullscreen, requestFullscreen };
}
