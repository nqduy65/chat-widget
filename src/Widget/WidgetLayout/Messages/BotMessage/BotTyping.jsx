import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AppContext from "../../../AppContext";

export const BotTyping = () => {
  const theme = useContext(AppContext);
  // Access botTyping and botStream from Redux
  const { botTyping, nextChunk } = useSelector((state) => state.messageState);
  const { botAvatar, botMsgColor } = theme;

  // Local state to manage incremental botStream rendering
  const [displayedStream, setDisplayedStream] = useState("");

  // useEffect(() => {
  //   let animationFrameId;
  //   let charIndex = 0;
  //   const renderNextChunk = async () => {
  //     if (charIndex < nextChunk.length) {
  //       const nextChar = nextChunk[charIndex];
  //
  //       // Only append to displayedStream if nextChar is defined and not null
  //       if (nextChar !== undefined && nextChar !== null) {
  //         setDisplayedStream((prevStream) => prevStream + nextChar);
  //       }
  //
  //       charIndex++;
  //       animationFrameId = requestAnimationFrame(renderNextChunk); // Smooth animation rendering
  //     }
  //   };
  //   renderNextChunk();
  //
  //   return () => {
  //     if (animationFrameId) {
  //       cancelAnimationFrame(animationFrameId);
  //     }
  //   };
  // }, [botTyping, nextChunk]);


  // useEffect(() => {
  //   if (!nextChunk) return;
  //
  //   let timeoutId;
  //   const chars = nextChunk.split('');
  //
  //   const renderNextChar = (index) => {
  //     if (index >= chars.length) return;
  //
  //     setDisplayedStream(prevStream => prevStream + chars[index]);
  //
  //     // Reduce timeout to make it faster
  //     timeoutId = setTimeout(() => renderNextChar(index + 1), 0);
  //   };
  //
  //   renderNextChar(0);
  //
  //   return () => {
  //     if (timeoutId) clearTimeout(timeoutId);
  //   };
  // }, [nextChunk]);

  useEffect(() => {
    if (!nextChunk) return;

    let timeoutId;
    const chars = Array.from(nextChunk); // Use Array.from to handle multi-byte characters properly.

    const renderNextChar = (index) => {
      if (index >= chars.length) return;
      setDisplayedStream(prevStream => prevStream + nextChunk);

      // Reduce timeout to make it faster
      timeoutId = setTimeout(() => renderNextChar(index + 1), 30);
    };

    renderNextChar(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [nextChunk]);
  return (
    botTyping && (
      <div className="flex space-x-1">
        <div className={`flex w-5 items-end`}>
          <img
            className={`h-5 w-5 rounded-full`}
            src={botAvatar}
            alt="Bot Logo"
          />
        </div>
        {displayedStream ? (
          <div
            className="w-fit whitespace-pre-line break-words rounded-2xl px-4 py-2 text-sm"
            dir="auto"
            style={{
              color: "rgb(75, 85, 99)",
              backgroundColor: "rgb(243, 244, 246)",
            }}
          >
            <p>{displayedStream}</p>
          </div>
        ) : (
          <>
            {/* Loading animation while bot is typing */}
            <div
              className="animation-delay-32 h-2 w-2 animate-bounce rounded-full bg-white p-1"
              style={{ backgroundColor: botMsgColor }}
            ></div>
            <div
              className="animation-delay-16 h-2 w-2 animate-bounce rounded-full bg-white p-1"
              style={{ backgroundColor: botMsgColor }}
            ></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-white p-1"
              style={{ backgroundColor: botMsgColor }}
            ></div>
          </>
        )}
      </div>
    )
  );
};
