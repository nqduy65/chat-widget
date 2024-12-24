import { createSlice } from "@reduxjs/toolkit";

export const roleMap = {
  Default: { value: "Default", display: "Default", number: 0 },
  Instructor: { value: "Instructor", display: "Instructor", number:1 },
  Assistant: { value: "Assistant", display: "Assistant", number:2 },
  Friend: { value: "Friend", display: "Friend", number:3 },
  Analyzer: { value: "Analyzer", display: "Analyzer (beta)", number:4 },
};

const initialState = {
  toggleWidget: false,
  notify: false,
  userId: null,
  remind: false,
  remindTime: "",
  role: roleMap.Default,
  token: "",
};
debugger;
export const widgetSlice = createSlice({
  name: "widget",
  initialState,
  reducers: {
    setToggleWidget: (state, action) => {
      state.toggleWidget = action.payload;
    },
    setNotify: (state, action) => {
      state.notify = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setRemindTime: (state, action) => {
      state.remindTime = action.payload;
    },
    setRemind: (state, action) => {
      state.remind = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export const {
  setToggleWidget,
  setNotify,
  setUserId,
  setRemindTime,
  setRemind,
  setRole,
  setToken,
} = widgetSlice.actions;

export default widgetSlice.reducer;
