import { Bars3BottomRightIcon } from "@heroicons/react/24/outline"; // Add CheckIcon or any other icon
import { FaSave, FaSync } from "react-icons/fa"; // Import your icon
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
  fetchChatHistory,
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
import { toast } from "react-toastify";

export const mapRole = ["Default", "Professor", "Assistant", "Friend"];

const models = ["Chat GPT 3.5", "Chat GPT 4"];

export const Header = () => {
  const dispatch = useDispatch();
  let { role, remindTime, remind, token } = useSelector(
    (state) => state.widgetState
  );
  const appContext = useContext(AppContext);

  const {
    botSubTitle,
    botTitle,
    botAvatar,
    chatHeaderCss,
    rasaServerUrl,
    userId,
  } = appContext;

  const { textColor, backgroundColor, enableBotAvatarBorder } = chatHeaderCss;
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedModel, setSelectedModel] = useState("Chat GPT 3.5");
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

  const handleTokenChange = (event) => {
    const tokenValue = event.target.value;
    dispatch(setToken(tokenValue)); // Update the Redux store
    localStorage.setItem("token", tokenValue); // Store the token in localStorage
  };

  const handleRemindToggle = () => {
    setRemindState((prev) => !prev);
  };

  const handleRemindTimeChange = (event) => {
    setRemindTimeState(event.target.value); // Update the context
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleClearChatButton = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
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

  const handleSyncChatHistory = async () => {
    const res = await dispatch(
      fetchChatHistory({
        rasaServerUrl: `${rasaServerUrl}/chat?chatid=${userId}`,
        token: token,
      })
    );
    if (res.payload.error) {
      toast.error("Sync Chat failed!")
    }
    if (res.payload.message) {
      toast.success("Sync Chat successfully!")
    }
  };

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
          <p className="">{`${mapRole[role]} ${botSubTitle}`}</p>
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
              <label htmlFor="model" className="mr-2">
                Model:
              </label>
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
            <li className="p-2">
              <label htmlFor="role" className="mr-2">
                Role:
              </label>
              <select
                id="role"
                value={role}
                onChange={handleRoleChange}
                className="rounded-lg border p-1"
                style={{ color: textColor, borderColor: textColor }}
              >
                {Object.entries(roleMap).map((key, role) => (
                  <option key={key} value={key[1]}>
                    {key[0]}
                  </option>
                ))}
              </select>
            </li>
            <li className="p-2">
              <label htmlFor="token" className="mr-2">
                Token:
              </label>
              <div className="flex items-center">
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={handleTokenChange}
                  className="rounded-lg border p-1"
                  style={{ color: textColor, borderColor: textColor }}
                />
                <div className="group relative inline-block">
                  <IconButton
                    icon={FaSync}
                    onClick={handleSyncChatHistory}
                    disabled={!token}
                    tooltip={"Sync Chat History"}
                  />
                  <span className="absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 transform rounded-md bg-gray-700 p-1 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {"Sync Chat history"}
                  </span>
                </div>
              </div>
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
                  <span className="block py-2 px-2">{"Clear Chat"}</span>
                </div>
              </div>

              {/* Add Save button below Clear Chat */}
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
