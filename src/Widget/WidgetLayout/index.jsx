import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setNotify,
  setToggleWidget,
  setToken,
  setUserId,
} from "../widgetSlice";
import AppContext from "../AppContext";
import { Header } from "./Header";
import { Keypad } from "./Keypad";
import { Launcher } from "./Launcher";
import { Messages } from "./Messages";
import {
  fetchChatHistory,
  getToken,
  getRemind,
  toggleBotTyping,
  toggleUserTyping,
} from "./Messages/messageSlice";
import Pusher from "pusher-js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const WidgetLayout = (props) => {
  const dispatch = useDispatch();
  let {
    toggleWidget,
    userId: _userId,
    notify,
    token,
  } = useSelector((state) => state.widgetState);

  const { rasaServerUrl } = useSelector((state) => state.appState);

  let { userId, embedded } = props;
  let userIdRef = useRef(_userId);
  useEffect(() => {
    const initializeTokenAndFetchHistory = async () => {
      let tokenResponse;
      if (!token) {
        tokenResponse = await dispatch(
          getToken({
            rasaServerUrl: `${rasaServerUrl}/token?userId=${userId}`,
          })
        ).unwrap();
        dispatch(setToken(tokenResponse));
      }
      // Token fetched successfully, now fetch chat history
      await dispatch(
        fetchChatHistory({
          rasaServerUrl: `${rasaServerUrl}/chat?chatid=${userId}`,
          token: token,
        })
      );

      // If widget is not open, set notify state
      if (!toggleWidget) {
        dispatch(setNotify(true));
      }
    };

    initializeTokenAndFetchHistory();
  }, [token]);

  useEffect(() => {
    const pusher = new Pusher("9de03240cc8a5c22c658", {
      cluster: "ap1",
      logToConsole: true,
    });

    pusher.subscribe("moodle-remind");

    // Initial fetch of chat history when the component mounts

    return () => {
      pusher.unsubscribe("moodle-remind");
      pusher.disconnect();
    };
  }, []);

  useEffect(() => {
    dispatch(toggleBotTyping(false));
    dispatch(toggleUserTyping(true));
    dispatch(
      getRemind({
        rasaServerUrl: `${rasaServerUrl}/gettime`,
        token: token,
      })
    );
  }, []);

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
  }, [userId]);

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
  }, []);
  if (embedded) {
    return (
      <AppContext.Provider value={{ userId: userIdRef.current, ...props }}>
        <AnimatePresence>
          <div
            className="fixed    flex h-full w-full  flex-col rounded-[1.8rem]   bg-white  font-lato   shadow-md"
            key="widget"
          >
            <Header />
            <Messages />
            <Keypad />
          </div>
        </AnimatePresence>
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={{ userId: userIdRef.current, ...props }}>
      <AnimatePresence>
        <ToastContainer />
        {toggleWidget && (
          <motion.div
            className="fixed bottom-5 right-5 z-50 flex h-[579px] w-[400px]  flex-col rounded-[1.8rem]  bg-white font-lato  ring-1  ring-black/5    xs:right-0 xs:h-[calc(100%-100px)] xs:w-full"
            animate={{ y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            key="widget"
          >
            <Header />
            <Messages />
            <Keypad />
          </motion.div>
        )}
        {notify && !toggleWidget && (
          <motion.div
            key="notification"
            initial={{ opacity: 1, scale: 0.9, x: 300 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 300 }}
            transition={{
              duration: 3,
              ease: [0.4, 0.0, 0.2, 1], // Smooth cubic-bezier
            }}
            className="fixed bottom-10 right-5 flex items-center justify-center rounded-full bg-blue-600 p-6 text-white shadow-lg"
            style={{
              backgroundColor: "#bb99ff",
              color: "#fff",
              width: "160px",
              height: "160px",
            }}
            onClick={handleNotificationClick}
          >
            <div style={{ textAlign: "center" }}>
              <h5 className="white-text" style={{ margin: 0 }}>
                Hey there 👋
              </h5>
              <p className="white-text" style={{ margin: 0 }}>
                A new message comes!
              </p>
            </div>
          </motion.div>
        )}
        {/*<Launcher />*/}
      </AnimatePresence>
    </AppContext.Provider>
  );
};
