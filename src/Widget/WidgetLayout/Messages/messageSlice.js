import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setRemind, setRemindTime } from "../../widgetSlice";
import Swal from "sweetalert2";

export const fetchBotResponse = createAsyncThunk(
  "messages/fetchBotResponse",
  async (payload, thunkAPI) => {
    const body = {
      content: payload.message,
      chatId: payload.sender,
      role: payload.role,
      courseId: payload.courseId,
    };
    const response = await fetch(payload.rasaServerUrl, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + payload.token,
      },
      method: "POST",
      body: JSON.stringify(body),
    });

    const reader = response.body.getReader();
    let isBotTyping = true;
    const decoder = new TextDecoder();
    thunkAPI.dispatch(setBotStream());

    while (isBotTyping) {
      const { done, value } = await reader.read();
      if (done) {
        isBotTyping = false;
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      // Dispatch each chunk as it arrives
      thunkAPI.dispatch(updateBotStream(chunk));
      if (chunk.includes("&start&")) {
        thunkAPI.dispatch(setBotStream());
      }
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
    try {
      // Make the API request
      await fetch(payload.rasaServerUrl, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + payload.token,
        },
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  "messages/fetchChatHistory",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(setBotStream());

      // Make the API request
      const response = await fetch(payload.rasaServerUrl, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + payload.token,
        },
        method: "GET",
      });
      if (response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Invalid token!",
        });

        thunkAPI.dispatch(setMessage([]));
        return { error: "Invalid token" };
      } else if (response.status === 403) {
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "Missing token!"
        })
      }

      // Parse the response into JSON
      const chatHistory = await response.json();

      let history = [];

      // Iterate over each entry in the chat history
      chatHistory.forEach((entry) => {
        const parsedContent = JSON.parse(entry.content);
        console.log("PARSE_CONTENT: ",parsedContent);
        // Parse bot message
        const botMessage = {
          text: parsedContent.bot.message,
          sender: "BOT",
          type: "text",
          ts: new Date(parsedContent.bot.time),
        };

        // Parse user message
        const userMessage = {
          text: parsedContent.user.message,
          sender: "USER",
          type: "text",
          ts: new Date(parsedContent.user.time),
        };
        // Add both messages to the history array
        if (parsedContent.user.message !== "") {
          history.push(userMessage);
        }
        if (parsedContent.bot.message !== "") {
          history.push(botMessage);
        }
      });
      thunkAPI.dispatch(setMessage(history));

      return { message: "Fetch successfully" };
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!"
      })
      console.error("Failed to fetch chat history:", error);
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const getRemind = createAsyncThunk(
  "messages/getRemind",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(setBotStream());

      // Make the API request
      const response = await fetch(payload.rasaServerUrl, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + payload.token,
        },
        method: "GET",
      });
      const remind = await response.json();
      console.log(remind);

        thunkAPI.dispatch(setRemind(!!remind[0].value));
        thunkAPI.dispatch(setRemindTime(remind[0].value));

      // Parse the response into JSON
    } catch (error) {
      console.error("Failed to fetch remind:", error);
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const setRemindApi = createAsyncThunk(
  "messages/setRemind",
  async (payload, thunkAPI) => {
    try {
      const body = {
        userId: payload.userId,
        status: payload.status,
        time: payload.remindTime,
      };

      // Make the API request
      await fetch(payload.rasaServerUrl, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + payload.token,
        },
        method: "POST",
        body: JSON.stringify(body),
      });
      thunkAPI.dispatch(setRemindTime(body.time));
      Swal.fire({
        icon: "success",
        title: "Set reminder successfully!",
        showClass: {
          popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
        },
        hideClass: {
          popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
        }
      });
      // Parse the response into JSON
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
      return thunkAPI.rejectWithValue({ error: error.message });
    }
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
    setMessage: (state, action) => {
      state.messages = action.payload;
    },
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
    setBotStream: (state) => {
      state.botStream = "";
      state.nextChunk = "";
    },
    updateBotStream: (state, action) => {
      state.botStream += action.payload; // Append new chunk to botStream
      state.nextChunk = action.payload;
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
  setMessage,
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
