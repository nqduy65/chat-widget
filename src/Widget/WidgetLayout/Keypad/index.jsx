import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { createUserMessage } from "../../../utils/helpers";
import {
  addMessage,
  fetchBotResponse,
  toggleBotTyping,
  toggleUserTyping,
} from "../Messages/messageSlice";
import AppContext from "../../AppContext";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';


const Textarea = styled.textarea`
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Keypad = () => {
  const dispatch = useDispatch();
  const appContext = useContext(AppContext);

  const [userInput, setUserInput] = useState("");
  let { role, token } = useSelector((state) => state.widgetState);


    const [isRecording, setIsRecording] = useState(false);

    // Add speech recognition
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

  const userTypingPlaceholder = useSelector(
    (state) => state.messageState.userTypingPlaceholder
  );

  const userTyping = useSelector((state) => state.messageState.userTyping);
  const { rasaServerUrl, userId, courseId, textColor } = appContext;

  const handleSubmit = async () => {
      const message = isRecording ? transcript : userInput;

      if (message.length > 0) {
          dispatch(addMessage(createUserMessage(message.trim())));
          setUserInput("");
          dispatch(toggleUserTyping(false));
          dispatch(toggleBotTyping(true));
          dispatch(
            fetchBotResponse({
              rasaServerUrl: `${rasaServerUrl}/chat`,
              message: message.trim(),
              role: role,
              sender: userId,
              courseId: courseId,
              token: token,
            })
          );
        }
      };

    const handleVoiceRecording =  () => {
        console.log("Voice Recording");
        if (!isRecording) {
            console.log("HUHUHU");
            setIsRecording(true);
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
        } else {
            // Stop recording and process the transcript
            setIsRecording(false);
            SpeechRecognition.stopListening();
            console.log("TRANSCRIPT: ", transcript);
            if (transcript) {
                console.log("TRANSCRIPT - 2: ", transcript);
                setUserInput(transcript);
                console.log("user input: ", userInput);
                handleSubmit();
            }
        }
    };

  return (
      <div className="mt-auto flex  h-[12%] items-center   rounded-t-3xl rounded-b-[2rem]  bg-slate-50">
          {/* Voice recording button */}
          <button
              onClick={handleVoiceRecording}
              className={`ml-2 inline-flex justify-center rounded-full p-2 hover:bg-slate-100 ${
                  isRecording ? 'bg-red-100' : ''
              }`}
              style={{color: textColor}}
          >
              {isRecording ? (
                  <StopIcon className="h-6 w-6 stroke-[1.1px]"/>
              ) : (
                  <MicrophoneIcon className="h-6 w-6 stroke-[1.1px]"/>
              )}
          </button>
          <Textarea
              rows="1"
              className={` mx-4 block w-full resize-none bg-slate-50 p-2.5 text-sm text-gray-900 outline-none ${
                  userTyping ? "cursor-text" : "cursor-not-allowed"
              }`}
              placeholder={userTypingPlaceholder}
              value={userInput}
              onChange={(e) => {
                  setUserInput(e.target.value);
              }}
              onKeyDown={(e) => {
                  if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                  }
              }}
              readOnly={!userTyping}
          />
          <button
              type="submit"
              className={`${
                  (userInput.trim().length > 1 || (isRecording && transcript.trim().length > 1))
                      ? "cursor-default"
                      : "cursor-not-allowed"
              } inline-flex justify-center rounded-full p-2 hover:bg-slate-100`}
              style={{color: textColor}}
              onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
              }}
          >
              <PaperAirplaneIcon className="h-6 w-6 -rotate-45 stroke-[1.1px]"/>
          </button>
      </div>
  );
};
