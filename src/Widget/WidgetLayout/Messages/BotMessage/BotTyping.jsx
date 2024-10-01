import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AppContext from "../../../AppContext";

export const BotTyping = () => {
  const theme = useContext(AppContext);

  // Access botTyping and botStream from Redux
  const { botTyping, nextChunk } = useSelector((state) => state.messageState);
  const { botAvatar, botMsgColor, botMsgBackgroundColor } = theme;

  // Local state to manage incremental botStream rendering
  const [displayedStream, setDisplayedStream] = useState("");

  useEffect(() => {
    let animationFrameId;
    //console.log({botTyping, nextChunk});

    // if (botTyping && nextChunk) {
    //   console.log("nextChunk", nextChunk);
    //   let charIndex = 0;
    //   const renderNextChunk = () => {
    //     if (charIndex < nextChunk.length) {
    //       setDisplayedStream(
    //         (prevStream) => prevStream + nextChunk[charIndex] ?? ""
    //       );
    //       charIndex++;
    //       animationFrameId = requestAnimationFrame(renderNextChunk); // Smooth animation rendering
    //     }
    //   };
    //   renderNextChunk();
    // } else {
    //   // Reset displayedStream when bot stops typing
    //   setDisplayedStream("");
    // }
    console.log("nextChunk", nextChunk);
    let charIndex = 0;
    let timeoutId = 0;
    function sleep(ms) {
      return new Promise((res) => setTimeout(res, ms));
    }
    const renderNextChunk = async () => {
      if (charIndex < nextChunk.length) {
        const nextChar = nextChunk[charIndex];

        // Only append to displayedStream if nextChar is defined and not null
        if (nextChar !== undefined && nextChar !== null) {
          setDisplayedStream((prevStream) => prevStream + nextChar);
        }

        charIndex++;
        animationFrameId = requestAnimationFrame(renderNextChunk); // Smooth animation rendering
      }
      await sleep(500);
    };
    //sleep 1 second
    renderNextChunk();

    // Cleanup on unmount or when botTyping changes
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [botTyping, nextChunk]); // Trigger effect on botTyping or nextChunk updates

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
        <div

          className={`flex w-fit space-x-2 self-start whitespace-pre-line break-words rounded-tl-[20px] rounded-br-[25px] rounded-tr-[20px] rounded-bl-[5px] px-5 py-3 text-sm text-white`}

          style={{ backgroundColor: botMsgBackgroundColor }}
        >
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
      </div>
    )
  );
};
