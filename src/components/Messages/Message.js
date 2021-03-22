import React from "react";
import moment from "moment";
import { Comment, Image } from "semantic-ui-react";
import { motion } from "framer-motion";

const isOwnMessage = (message, user) => {
  return message.user.id === user.uid ? "message__self" : "";
};

const isImage = (message) => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const timeFromNow = (timestamp) => moment(timestamp).fromNow();

const Message = ({ message, user }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5, type: "tween" }}
  >
    <Comment>
      <Comment.Avatar src={message.user?.avatar} />
      <Comment.Content className={isOwnMessage(message, user)}>
        <Comment.Author as="a">{message.user?.name}</Comment.Author>
        <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
        {isImage(message) ? (
          <Image src={message.image} className="message__image" />
        ) : (
          <Comment.Text>{message.content}</Comment.Text>
        )}
      </Comment.Content>
    </Comment>
  </motion.div>
);

export default Message;
