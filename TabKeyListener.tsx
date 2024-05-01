import React, { useEffect } from "react";

interface TabKeyListenerProps {
  onTabPress: () => void;
}

const TabKeyListener: React.FC<TabKeyListenerProps> = ({ onTabPress }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        onTabPress();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTabPress]);

  // This component doesn't render anything directly
  return null;
};

export default TabKeyListener;
