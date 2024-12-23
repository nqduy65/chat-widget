import { useEffect, useRef } from "react";
import { debounce } from "lodash";

export const useScrollBottom = (...messageStack) => {
  const bottomRef = useRef(null);
  const isUserScrolling = useRef(false);

  const scrollToBottom = debounce(() => {
    if (bottomRef.current && !isUserScrolling.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, 100); // Debounce time to avoid excessive scrolling

  // Monitor when messages are updated
  useEffect(() => {
    scrollToBottom();
  }, [messageStack, scrollToBottom]);

  // Detect if the user is scrolling manually
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    isUserScrolling.current = scrollTop + clientHeight < scrollHeight - 100;
  };

  return { bottomRef, handleScroll };
};
