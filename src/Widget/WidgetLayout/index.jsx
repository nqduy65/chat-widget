import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNotify, setToggleWidget, setUserId } from "../widgetSlice";
import AppContext from "../AppContext";
import { Header } from "./Header";
import { Keypad } from "./Keypad";
import { Launcher } from "./Launcher";
import { Messages } from "./Messages";
import { fetchChatHistory } from "./Messages/messageSlice";
import Pusher from "pusher-js";

export const WidgetLayout = (props) => {
  const dispatch = useDispatch();
  let {
    toggleWidget,
    userId: _userId,
    notify,
    token,
  } = useSelector((state) => state.widgetState);

  const { rasaServerUrl } = useSelector((state) => state.appState);

  let { userId, embedded, courseId } = props;
  console.log("userId", userId);
  console.log("courseId", courseId);
  let userIdRef = useRef(_userId);

  const handleNewData = () => {
    dispatch(
      fetchChatHistory({
        rasaServerUrl: `${rasaServerUrl}?chatid=${userId}`,
        token: token,
      })
    );
    if (!toggleWidget) {
      dispatch(setNotify(true));
    }
  };
  useEffect(() => {
    const pusher = new Pusher("9de03240cc8a5c22c658", {
      cluster: "ap1",
      logToConsole: true,
    });

    const channel = pusher.subscribe("moodle-remind");

    channel.bind(userId, handleNewData);

    // Initial fetch of chat history when the component mounts

    return () => {
      channel.unbind(userId, handleNewData);
      pusher.unsubscribe("moodle-remind");
      pusher.disconnect();
    };
  }, []);

  /* AUTO TRIGGER TO HIDE NOTIFICATION */
  // useEffect(() => {
  //   // Set a timeout to hide the notification after 3 seconds (3000 milliseconds)
  //   const timeoutId = setTimeout(() => {
  //     dispatch(setNotify(false));
  //   }, 3000);

  //   // Clear the timeout if the component is unmounted
  //   return () => clearTimeout(timeoutId);
  // }, [notify]);

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
        <AnimatePresence>
          {notify && !toggleWidget && (
            <motion.div
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
        </AnimatePresence>
        <Launcher />
      </AnimatePresence>
    </AppContext.Provider>
  );
};
