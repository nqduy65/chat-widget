
export const createUserMessage = (message) => {
  return {
    text: message,
    sender: "USER",
    type: "text",
    ts: new Date(),
  };
};

