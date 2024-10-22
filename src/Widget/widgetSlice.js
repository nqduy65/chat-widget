import { createSlice } from "@reduxjs/toolkit";

export const roleMap = {
  Default: 0,
  Professor: 1,
  Assistant: 2,
  Friend: 3,
};
const initialState = {
  toggleWidget: false,
  notify: false,
  userId: null,
  remind: false,
  remindTime: "",
  role: roleMap["Default"],
  token: "",
};

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
