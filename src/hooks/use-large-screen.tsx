import * as React from "react"

const LARGE_SCREEN_BREAKPOINT = 1536; // Corresponds to Tailwind's 2xl breakpoint

export function useIsLargeScreen() {
  const [isLargeScreen, setIsLargeScreen] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LARGE_SCREEN_BREAKPOINT}px)`);
    const onChange = () => {
      setIsLargeScreen(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsLargeScreen(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isLargeScreen;
}
