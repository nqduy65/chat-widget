import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppContext from "../AppContext";
import { setToggleWidget, setUserId } from "../widgetSlice";
import { Header } from "./Header";
import { Keypad } from "./Keypad";
import { Launcher } from "./Launcher";
import { Messages } from "./Messages";

export const WidgetLayout = (props) => {
  const dispatch = useDispatch();
  let { toggleWidget, userId: _userId } = useSelector(
    (state) => state.widgetState
  );
  let { userId, embedded } = props;
  console.log(embedded);
  let userIdRef = useRef(_userId);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the notification after 3 seconds (3000 milliseconds)
    const timeoutId = setTimeout(() => {
      setShowNotification(false);
    }, 3000);

    // Clear the timeout if the component is unmounted
    return () => clearTimeout(timeoutId);
  }, [toggleWidget]);

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
  }, [dispatch, embedded, props.userId, toggleWidget, userId]);
  const handleNotificationClick = () => {
    setShowNotification(false);
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
          {showNotification && !toggleWidget && (
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
