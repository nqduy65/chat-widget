import axios from "axios";

export const createUserMessage = (message) => {
  return {
    text: message,
    sender: "USER",
    messageType: "text",
    ts: new Date(),
  };
};

export const getBotResponse = async ({
  rasaServerUrl,
  sender,
  courseId,
  message,
  metadata = {},
}) => {
  try {
    const response = await axios({
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      method: "post",
      url: rasaServerUrl,
      data: {
        content: message,
        chatId: sender,
        role: 1,
        courseId: courseId,
      },
    });
    console.log("response", response);
    return response.data.message;
  } catch (error) {
    console.log("error occurred fetching bot response", error);
    return [];
  }
};
