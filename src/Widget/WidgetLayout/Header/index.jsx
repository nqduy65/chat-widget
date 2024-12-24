import { Bars3BottomRightIcon } from "@heroicons/react/24/outline"; // Add CheckIcon or any other icon
import { FaSave } from "react-icons/fa"; // Import your icon
import {useContext, useEffect, useState} from "react";
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
import * as Tooltip from '@radix-ui/react-tooltip';
import {ChevronDownIcon} from "@heroicons/react/20/solid";


const roleDescriptions = {
  Default: "Nếu bạn không biết chọn role gì",
  Instructor: "Tìm kiếm khóa học và hỏi đáp nội dung bài học",
  Assistant: "Hỏi đáp thông tin cá nhân",
  Friend: "Trò chuyện vui vẻ, tán gẫu",
  Analyzer: "Phân tích kết quả học tâp"
};


export const Header = () => {
  const dispatch = useDispatch();
  let {role, remindTime, remind, token} = useSelector(
      (state) => state.widgetState
  );
  const appContext = useContext(AppContext);

  const {
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

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRefSelecter = useDetectClickOutside({
    setShowModal: setIsOpen,
  });
  const handleChange = (choseRole) => {
    // Call the parent's handleRoleChange function
    dispatch(setRole(choseRole));
    setIsOpen(false);
  };

  // Retrieve the token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      dispatch(setToken(storedToken));
    }
  }, [dispatch]);

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
          <JellyfishAvatar />
        </div>
        <div className="w-full ">
          <div className="text-xl font-semibold antialiased text-white">{botTitle}</div>
          <button
              onClick={() => setIsOpen(!isOpen)}
              className="select-button mt-2 flex w-48 items-center justify-between rounded-lg border bg-opacity-20 bg-white p-2 text-left text-white hover:bg-opacity-30"
              style={{borderColor: textColor}}
          >
            {role.display}
            <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
          </button>
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
      {isOpen && (
          <Tooltip.Provider>
            <div className="absolute z-[100] w-48 rounded-xl bg-white shadow-lg mt-1 left-20 top-24" ref={dropdownRefSelecter}>
                    {Object.entries(roleMap).map(([key, roleData]) => (
                        <Tooltip.Root key={roleData.value}>
                          <Tooltip.Trigger asChild>
                            <div
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                                    !token && !["default"].includes(key.toLowerCase()) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                onClick={() => {
                                  if (token || ["default"].includes(key.toLowerCase())) {
                                    handleChange(roleData);
                                    setIsOpen(false);
                                  }
                                }}
                            >
                              {roleData.display}
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                                className="rounded-md bg-black px-4 py-2 text-sm text-white animate-fadeIn max-w-[200px] break-words z-[1000]"
                                sideOffset={5}
                            >
                              {roleDescriptions[key]}
                              <Tooltip.Arrow className="fill-black" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                    ))}
                  </div>
          </Tooltip.Provider>
        )}
{
  showDropdown && (
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
