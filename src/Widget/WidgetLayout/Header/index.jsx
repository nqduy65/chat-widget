import { Bars3BottomRightIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import AppContext from "../../AppContext";
import { motion } from "framer-motion";
import { useDetectClickOutside } from "../../../hooks/useDetectClickOutside";
import { useDispatch } from "react-redux";
import { setToggleWidget } from "../../widgetSlice";
import {
  removeAllMessages,
  resetBot,
  resetMessageState,
  setUserTypingPlaceholder,
  toggleBotTyping,
  toggleUserTyping,
} from "../Messages/messageSlice";
import { Icon } from "./Icons";

const dropdownMenu = [
  {
    title: "Restart",
  },
  {
    title: "Clear Chat",
  },
  {
    title: "Close",
  },
];

const roles = ["Professor", "Assistant", "Friend"];
const models = ["Chat GPT 3.5", "Chat GPT 4"];

export const Header = () => {
  const dispatch = useDispatch();
  const appContext = useContext(AppContext);
  const {
    botSubTitle,
    botTitle,
    botAvatar,
    chatHeaderCss,
    rasaServerUrl,
    userId,
    metadata,
  } = appContext;
  
  const { textColor, backgroundColor, enableBotAvatarBorder } = chatHeaderCss;
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Professor");
  const [remind, setRemind] = useState(false);
  const [remindTime, setRemindTime] = useState("");
  const [selectedModel, setSelectedModel] = useState("Chat GPT 3.5");
  const dropdownRef = useDetectClickOutside({
    setShowModal: setShowDropdown,
  });

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleRemindToggle = () => {
    setRemind(!remind);
  };

  const handleRemindTimeChange = (event) => {
    setRemindTime(event.target.value);
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleCloseButton = () => {
    dispatch(setToggleWidget(false));
    setShowDropdown(!showDropdown);
  };

  const handleClearChatButton = () => {
    dispatch(removeAllMessages());
    dispatch(toggleBotTyping(false));
    dispatch(toggleUserTyping(true));
    dispatch(setUserTypingPlaceholder("Type your message..."));
    setShowDropdown(!showDropdown);
  };

  const handleRestartButton = () => {
    dispatch(resetMessageState());
    setShowDropdown(!showDropdown);
    dispatch(
      resetBot({
        rasaServerUrl,
        message: "/restart",
        sender: userId,
        metadata,
      })
    );
  };

  return (
    <>
      <div
        className="relative flex h-[20%] cursor-default items-center space-x-4 rounded-t-[1.8rem] p-2 shadow-lg drop-shadow"
        style={{ backgroundColor, color: textColor }}
      >
        <div
          className="shrink-0 rounded-full border-[1px] p-2"
          style={{ borderColor: textColor, borderWidth: enableBotAvatarBorder }}
        >
          <img className="h-12 w-12" src={botAvatar} alt="Bot Logo" />
        </div>
        <div className="w-full ">
          <div className="text-xl font-semibold antialiased">{botTitle}</div>
          <p className="">{botSubTitle}</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="flex"
          onClick={() => {
            setShowDropdown(!showDropdown);
          }}
        >
          <Bars3BottomRightIcon className="h-7 w-7" />
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
              <label htmlFor="role" className="mr-2">Role:</label>
              <select
                id="role"
                value={selectedRole}
                onChange={handleRoleChange}
                className="rounded-lg border p-1"
                style={{ color: textColor, borderColor: textColor }}
              >
                {roles.map((role, idx) => (
                  <option key={idx} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </li>
            <li className="p-2">
              <div className="flex items-center">
                <label htmlFor="remind" className="mr-2">Remind:</label>
                <input
                  type="checkbox"
                  id="remind"
                  checked={remind}
                  onChange={handleRemindToggle}
                />
                {remind && (
                  <input
                    type="time"
                    value={remindTime}
                    onChange={handleRemindTimeChange}
                    className="ml-2 rounded-lg border p-1"
                    style={{ color: textColor, borderColor: textColor }}
                  />
                )}
              </div>
            </li>
            <li className="p-2">
              <label htmlFor="model" className="mr-2">Model:</label>
              <select
                id="model"
                value={selectedModel}
                onChange={handleModelChange}
                className="rounded-lg border p-1"
                style={{ color: textColor, borderColor: textColor }}
              >
                {models.map((model, idx) => (
                  <option key={idx} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </li>
            {dropdownMenu.map((item, idx) => {
              const { title } = item;
              return (
                <div
                  key={idx}
                  className="flex hover:opacity-70"
                  onClick={() => {
                    if (title === "Close") {
                      handleCloseButton();
                    } else if (title === "Clear Chat") {
                      handleClearChatButton();
                    } else {
                      handleRestartButton();
                    }
                  }}
                >
                  <div className="flex items-center justify-center pl-2">
                    <Icon name={title} />
                  </div>
                  <div>
                    <span className="block py-2 px-2">{title}</span>
                  </div>
                </div>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};
