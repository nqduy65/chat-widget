import { Bars3BottomRightIcon } from "@heroicons/react/24/outline"; // Add CheckIcon or any other icon
import { FaSave } from "react-icons/fa"; // Import your icon
import { useContext, useEffect, useState } from "react";
import AppContext from "../../AppContext";
import { motion } from "framer-motion";
import { useDetectClickOutside } from "../../../hooks/useDetectClickOutside";
import { useDispatch, useSelector } from "react-redux";
import {
  roleMap,
  setRole,
  setToken,
} from "../../widgetSlice";
import {
  removeAllMessages,
  resetBot,
  setRemindApi,
  setUserTypingPlaceholder,
  toggleBotTyping,
  toggleUserTyping,
} from "../Messages/messageSlice";
import { Icon } from "./Icons";
import { IconButton } from "./IconButton";
import Swal from "sweetalert2";
import JellyfishAvatar from "./avatar";

export const mapRole = ["Default", "Instructor", "Assistant", "Friend", "Analyzer (alpha)"];

export const Header = () => {
  const dispatch = useDispatch();
  let { role, remindTime, remind, token } = useSelector(
    (state) => state.widgetState
  );
  const appContext = useContext(AppContext);

  const {
    botSubTitle,
    botTitle,
    chatHeaderCss,
    rasaServerUrl,
    userId,
  } = appContext;

  const { textColor, backgroundColor, enableBotAvatarBorder } = chatHeaderCss;
  const [showDropdown, setShowDropdown] = useState(false);

  const [remindState, setRemindState] = useState(remind);
  const [remindTimeState, setRemindTimeState] = useState(remindTime);
  const dropdownRef = useDetectClickOutside({
    setShowModal: setShowDropdown,
  });

  const handleRoleChange = (event) => {
    const roleKey = event.target.value;
    dispatch(setRole(roleKey)); // Store the key (1, 2, 3) in context
  };

  // Retrieve the token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      dispatch(setToken(storedToken));
    }
  }, []);

  const handleRemindToggle = () => {
    setRemindState((prev) => !prev);
  };

  const handleRemindTimeChange = (event) => {
    setRemindTimeState(event.target.value); // Update the context
  };
  const handleClearChatButton = () => {
    Swal.fire({
      title: "Bạn chắc chứ?",
      text: "Dữ liệu bị xoá sẽ không thể khôi phục lại đuợc!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ok, xóa!",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        setShowDropdown(!showDropdown);
        dispatch(removeAllMessages());
        dispatch(toggleBotTyping(false));
        dispatch(toggleUserTyping(true));
        dispatch(setUserTypingPlaceholder("Type your message..."));
        dispatch(
          resetBot({
            rasaServerUrl: `${rasaServerUrl}/chat?chatid=${userId}`,
            token: token,
          })
        );
      }
    });
  };
  useEffect(() => {
    setRemindState(remind);
    setRemindTimeState(remindTime);
  }, [remind, remindTime]);

  const handleSaveRemind = async () => {
    await dispatch(
      setRemindApi({
        rasaServerUrl: `${rasaServerUrl}/settime`,
        token: token,
        userId: userId,
        status: remindState,
        remindTime: remindTimeState,
      })
    );
  };

  const display = (value) =>{
    return value != "Analyzer" ? value : "Analyzer (alpha)";
  }
  console.log("Role: ", role);
  return (
    <>
      <div
        className="relative flex h-[20%] cursor-default items-center space-x-4 rounded-t-[1.8rem] p-2 shadow-lg drop-shadow"
        style={{ backgroundColor, color: textColor }}
      >
        <div
            className="shrink-0 rounded-full border-[1px] h-16 w-16"
            style={{borderColor: textColor, borderWidth: enableBotAvatarBorder}}
        >
          {/*<img className="h-12 w-12" src={botAvatar} alt="Bot Logo" />*/}
          <JellyfishAvatar />
        </div>
        <div className="w-full ">
          <div className="text-xl font-semibold antialiased text-white" >{botTitle}</div>
          <p className="text-amber-50">
             {mapRole[role]} {botSubTitle}
          </p>
        </div>
        <motion.div
            whileHover={{scale: 1.2}}
            className="flex"
            onClick={() => {
              setShowDropdown(!showDropdown);
            }}
        >
          <Bars3BottomRightIcon className="h-7 w-7"/>
        </motion.div>
      </div>
      {showDropdown && (
        <div
          id="dropdown"
          className="absolute right-5 top-16 z-50 w-fit cursor-default divide-y divide-gray-100 rounded-xl bg-white shadow-lg"
          ref={dropdownRef}
        >
          <ul
            className="rounded-lg py-1 text-sm"
            aria-labelledby="dropdownDefault"
            style={{
              backgroundColor,
              color: textColor,
              border: `1px solid ${textColor}`,
            }}
          >
            <li className="p-2">
              <label htmlFor="role" className="mr-2">
                Role:
              </label>
              <select
                id="role"
                value={token ? role: "Default"}
                onChange={handleRoleChange}
                className="rounded-lg border p-1"
                style={{ color: textColor, borderColor: textColor }}
              >
                {Object.entries(roleMap).map((key, role) => (
                    <>
                  <option key={key} value={key[1]} disabled={!token && !["default"].includes(key[0].toLowerCase())}
                  >
                    {display(key[0])}
                  </option>
                  </>
                ))}
              </select>
            </li>
            <li className="p-2">
              <div className="flex items-center">
                <label htmlFor="remind" className="mr-2">
                  Remind:
                </label>
                <input
                  type="checkbox"
                  id="remind"
                  checked={remindState}
                  onChange={handleRemindToggle}
                />
                {remindState && userId === "2" && (
                  <input
                    type="time"
                    value={remindTimeState}
                    onChange={handleRemindTimeChange}
                    className="ml-2 rounded-lg border p-1"
                    style={{ color: textColor, borderColor: textColor }}
                  />
                )}
                <div className="ml-2">
                  <IconButton
                    icon={FaSave} // You can change this to your actual save icon
                    onClick={handleSaveRemind}
                    disabled={false} // Adjust this based on your logic
                    tooltip={"Save"}
                  />
                </div>
              </div>
            </li>

              <li className="p-2">
                <div
                    className="flex cursor-pointer hover:opacity-70"
                    onClick={() => handleClearChatButton()}
                >
                  <div className="flex items-center justify-center pl-2">
                    <Icon name={"Clear Chat"} />
                  </div>
                  <div>
                    <span className="block py-2 px-2">{"Xóa đoạn Chat"}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
      )}
    </>
  );
};
