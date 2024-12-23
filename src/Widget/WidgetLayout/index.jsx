import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {setNotify, setToggleWidget, setUserId} from "../widgetSlice";
import AppContext from "../AppContext";
import { Header } from "./Header";
import { Keypad } from "./Keypad";
import { Messages } from "./Messages";
import {
  addMessage,
  fetchBotResponse,
  fetchChatHistory,
  getRemind,
  getToken,
  toggleBotTyping,
  toggleUserTyping,
} from "./Messages/messageSlice";
import Pusher from "pusher-js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createUserMessage } from "../../utils/helpers";

export const WidgetLayout = (props) => {
  const dispatch = useDispatch();
  let {
    toggleWidget,
    userId: _userId,
    notify,
    token,
    role,
  } = useSelector((state) => state.widgetState);
  const { messages } = useSelector((state) => state.messageState);
  const { rasaServerUrl } = useSelector((state) => state.appState);
  console.log("url: ", rasaServerUrl);
  let { userId, embedded } = props;
  let userIdRef = useRef(_userId);

  const handleNewData = () => {
    dispatch(
      fetchChatHistory({
        rasaServerUrl: `${rasaServerUrl}/chat?chatid=${userId}`,
        token: token,
      })
    );
    // if (!toggleWidget) {
      dispatch(setNotify(true));
    //}
  };

  useEffect( () => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const moodleSession = getCookie('MoodleSession');
    const initializeTokenAndFetchHistory = () => {
      dispatch(
          getToken({
            rasaServerUrl: `${rasaServerUrl}/token?userId=${userId}`,
            token: moodleSession
          })
      );
    };
    initializeTokenAndFetchHistory();
    if (token) {
      dispatch(
          fetchChatHistory({
            rasaServerUrl: `${rasaServerUrl}/chat?chatid=${userId}`,
            token: token,
          })
      );
    }
    dispatch(toggleBotTyping(false));
    dispatch(toggleUserTyping(true));
    dispatch(
        getRemind({
          rasaServerUrl: `${rasaServerUrl}/gettime`,
          token: token,
        })
    );
    // Token fetched successfully, now fetch chat history
  }, [dispatch, rasaServerUrl, token, userId, toggleWidget]);

  useEffect(() => {
    const pusher = new Pusher("9de03240cc8a5c22c658", {
      cluster: "ap1",
      logToConsole: true,
    });

    const channel = pusher.subscribe("moodle-remind");

    channel.bind(userId, (data) => {
      // Send message to parent window
      window.parent.postMessage({
        type: 'NOTIFICATION',
        data: {
          message: 'New message arrived',
          // any other data you want to pass
        }
      }, '*');
          fetchChatHistory({
            rasaServerUrl: `${rasaServerUrl}/chat?chatid=${userId}`,
            token: token,
          })
    }
    );

    // Initial fetch of chat history when the component mounts

    return () => {
      channel.unbind(userId, handleNewData);
      pusher.unsubscribe("moodle-remind");
      pusher.disconnect();
    };
  }, [token]);


  useEffect(() => {
    if (userId) {
      userIdRef.current = userId;
    } else {
      if (!userIdRef.current) {
        userIdRef.current = nanoid();
        console.log(userIdRef.current);
        dispatch(setUserId(userIdRef.current));
      }
    }
  }, [dispatch, userId]);
  const handleNotificationClick = () => {
    dispatch(setNotify(false));
    dispatch(setToggleWidget(true)); // Open the widget
  };
  useEffect(() => {
    const handleParentMessage = (event) => {
      if (event.data.type === 'TOGGLE_WIDGET') {
        dispatch(setToggleWidget(event.data.data.isOpen));
      }
    };

    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, [dispatch]);
  if (embedded) {
    return (
      <AppContext.Provider value={{ userId: userIdRef.current, ...props }}>
        <AnimatePresence>
          <div
            className="fixed flex h-full w-full  flex-col rounded-[1.8rem]   bg-white  font-lato   shadow-md"
            key="widget"
          >
            <Header />
            {token && <Messages />}
            <Keypad />
          </div>
        </AnimatePresence>
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={{ userId: userIdRef.current, ...props }}>
      <AnimatePresence>
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="flex-shrink-0">
            <div className="rounded-xl bg-purple-100 p-3">
              <svg className="h-7 w-7 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="mb-1 text-lg font-semibold text-gray-900">New Message</h5>
            <p className="text-sm text-gray-600">A new message has arrived!</p>
          </div>

          <button
              className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-500 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <ToastContainer/>

        {toggleWidget && (
            <motion.div
                className="fixed bottom-5 right-5 z-50 flex h-[579px] w-[400px]  flex-col rounded-[1.8rem]  bg-white font-lato  ring-1  ring-black/5    xs:right-0 xs:h-[calc(100%-100px)] xs:w-full"
                animate={{y: -60}}
                exit={{opacity: 0}}
                transition={{type: "spring", stiffness: 100}}
                key="widget"
            >
              <Header/>
              {!messages.length && (
                  <div
                      className="flex h-full flex-col items-center justify-center px-4 text-center font-semibold font-sans">
                    Chào mừng bạn đến với hệ thống Moodle Chacochi! Trợ lý ảo đồng
                    hành cùng bạn trên hành trình chinh phục tri thức tại Chacochi.
                    Hiện tại bạn đang trò chuyện với mình thông qua chế độ mặc định.
                    Để có thể trò chuyện với các chế độ nâng cao, vui lòng liên hệ
                    với admin nhé.
                    <button
                        className="mt-4 rounded bg-[#a78bfa] px-6 py-2 text-black hover:bg-[#8b5cf6]"
                        onClick={() => {
                          dispatch(addMessage(createUserMessage("Xin chào")));
                          dispatch(toggleUserTyping(false));
                          dispatch(toggleBotTyping(true));
                          dispatch(
                              fetchBotResponse({
                                rasaServerUrl: `${rasaServerUrl}/chat`,
                                message: "Xin chào",
                                role: role,
                                sender: userId,
                                courseId: 1,
                                token: token,
                              })
                          );
                        }}
                    >
                      Xin chào
                    </button>
                  </div>
              )}
              {messages.length > 0 && <Messages/>}
              {messages.length > 0 && <Keypad/>}
            </motion.div>
        )}
        {notify && (
            <motion.div
                key="notification"
                initial={{opacity: 0, y: -20, x: 20}}
                animate={{opacity: 1, y: 0, x: 0}}
                exit={{opacity: 0, y: -20, x: 20}}
                transition={{
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="fixed top-5 right-5 flex items-center gap-3 rounded-lg bg-white p-4 shadow-lg"
                style={{
                  minWidth: "300px",
                  zIndex: 1000
                }}
                onClick={handleNotificationClick}
            >
              <div className="flex-shrink-0">
                <div className="rounded-full bg-blue-100 p-2">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">New Message</h5>
                <p className="text-sm text-gray-600">A new message has arrived!</p>
              </div>
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add your close handler here
                  }}
                  className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"/>
                </svg>
              </button>
            </motion.div>
        )}
      </AnimatePresence>
    </AppContext.Provider>
  );
};
