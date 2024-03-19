"use client";
import { LuSendHorizonal } from "react-icons/lu";
import {useEffect, useState} from "react";
import {createAssistant,askQuestions} from "../Components/apiCall";

const Page = () => {

  const [message, setMessage] = useState([]);
  const [conversation, setConversation] = useState([]);
  const ArrayMessage = [{ role: "assistant", content: message }];

  let isUseeffectRan = false;

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };


  useEffect(() => {
    if(!isUseeffectRan) {
      createAssistant();
      isUseeffectRan = true;
    }
  }, [])


  const handleSendClick = async () => {

    // Append the new user message to the conversation
    const updatedConversation = [
      ...conversation,
      { role: "user", content: message },
    ];

    // Call the OpenAI API with the updated conversation
    const responseText = askQuestions(message);

    // Update conversation with both the new message and the response
    setConversation([
      ...updatedConversation,
      { role: "assistant", content: responseText },
    ]);

    setMessage("");
  };

  return (
    <div className="border border-l-rose-100 h-screen">
      <div className="border-red-500 h-[80%] overflow-y-scroll">
        Welcome:
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={msg.role == "user" ? " flex pt-4 pr-3.5 text-green-500 justify-end" : "pl-10 pl-3.5 pt-4 text-red-500"}
          >
            {msg.role}: {msg.content}
          </div>
        ))}
      </div>
      <div className="absolute w-full flex items-center justify-center bottom-5 ">
        <textarea
          className="text-black resize-none w-[500px]"
          value={message}
          onChange={handleInputChange}
          rows={2}
          columns={1}
        />
        <button onClick={handleSendClick}>
          <LuSendHorizonal size={25} className="ml-2 " color="white" />
        </button>
      </div>
    </div>
  );
};

export default Page;
