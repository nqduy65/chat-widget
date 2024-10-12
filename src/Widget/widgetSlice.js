import { createSlice } from "@reduxjs/toolkit";

export const roleMap = {
  "Professor": 1,
  "Assistant": 2,
  "Friend": 3,
};
const initialState = {
  toggleWidget: false,
  userId: null,
  remindTime: "",
  role: roleMap["Professor"],
};

export const widgetSlice = createSlice({
  name: "widget",
  initialState,
  reducers: {
    setToggleWidget: (state, action) => {
      state.toggleWidget = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setRemindTime: (state, action) => {
      state.remindTime = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
  },
});

export const { setToggleWidget, setUserId, setRemindTime, setRole } =
  widgetSlice.actions;

export default widgetSlice.reducer;
