import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getBotResponse } from "../../../utils/helpers";

export const fetchBotResponse = createAsyncThunk(
  "messages/fetchBotResponse",
  async (payload, thunkAPI) => {
    //const response = await getBotResponse(payload);
    const testData = {
      content: payload.message,
      chatId: 2,
      role: 1,
      courseId: 5,
    };
    const response = await fetch(payload.rasaServerUrl, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      method: "POST",
      body: JSON.stringify(testData),
    });

    const reader = response.body.getReader();
    let isBotTyping = true;
    const decoder = new TextDecoder();
    thunkAPI.dispatch(setBotStream(""));

    while (isBotTyping) {
      const { done, value } = await reader.read();
      if (done) {
        isBotTyping = false;
        break;
      }
      console.log({ value });

      const chunk = decoder.decode(value, { stream: true });
      console.log({ chunk });

      // Dispatch each chunk as it arrives
      thunkAPI.dispatch(updateBotStream(chunk));
    }

    thunkAPI.dispatch(toggleBotTyping(false));
    console.log("bot response", response);
    // await new Promise((r) => setTimeout(r, 1000));
    return response;
  }
);

export const resetBot = createAsyncThunk(
  "messages/resetBot",
  async (payload, thunkAPI) => {
    await getBotResponse(payload);
  }
);

const initialState = {
  messages: [],
  botTyping: false,
  userTyping: true,
  userTypingPlaceholder: "Type your message here...",
  userGreeted: false,
  nextChunk: "",
  botStream: "",
};
export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      if (action.payload.sender === "USER") {
        state.messages = state.messages.map((message) => {
          if (message.type === "custom") {
            if (message.text) {
              message = {
                text: message.text,
                sender: "BOT",
                type: "text",
                ts: message.ts,
              };
            }
          }
          if (message.type === "buttons") {
            message.quick_replies = [];
          }
          return message;
        });
      }
      state.messages.push(action.payload);
    },
    setBotStream: (state, action) => {
      state.botStream = "";
      state.nextChunk = "";
    },
    updateBotStream: (state, action) => {
      console.log("Updating botStream with:", action.payload); // Add this line
      state.botStream += action.payload; // Append new chunk to botStream
      state.nextChunk = action.payload;
      console.log("Updated botStream:", state.botStream); // Add this line
    },
    finalizeBotMessage: (state) => {
      // Add final botStream data as a message
      state.messages.push({
        text: state.botStream,
        sender: "BOT",
        type: "text",
        ts: new Date(),
      });
      state.botStream = ""; // Clear botStream after finalizing
    },
    resetMessageState: () => {
      return initialState;
    },
    removeAllMessages: (state) => {
      state.messages = [];
    },
    disableButtons: (state, action) => {
      const index = action.payload;
      state.messages[index].callback = false;
    },
    toggleUserTyping: (state, action) => {
      state.userTyping = action.payload;
    },
    toggleBotTyping: (state, action) => {
      state.botTyping = action.payload;
      state.userTypingPlaceholder = action.payload
        ? "Please wait for bot response..."
        : "Type your message here...";
      state.nextChunk = "";
    },
    setUserTypingPlaceholder: (state, action) => {
      state.userTypingPlaceholder = action.payload;
    },
    setUserGreeted: (state, action) => {
      state.userGreeted = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBotResponse.fulfilled, (state) => {
      // Finalize bot message when streaming is done
      state.botTyping = false;
      state.userTyping = true;
      state.userTypingPlaceholder = "Type your message here...";
      state.messages.push({
        text: state.botStream,
        sender: "BOT",
        type: "text",
        ts: new Date(),
      });
      state.botStream = "";
    });
  },
});

export const {
  addMessage,
  setBotStream,
  updateBotStream,
  removeAllMessages,
  finalizeBotMessage,
  toggleBotTyping,
  toggleUserTyping,
  setUserTypingPlaceholder,
  setUserGreeted,
  resetMessageState,
  disableButtons,
} = messagesSlice.actions;

export default messagesSlice.reducer;
