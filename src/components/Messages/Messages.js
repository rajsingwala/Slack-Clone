import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import { connect } from "react-redux";
import { setUserPosts } from "../../actions";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    usersRef: firebase.database().ref("users"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    privateChannel: this.props.isPrivateChannel,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    numUniqueUsers: "",
    searchTerm: "",
    isChannelStarred: false,
    searchLoading: false,
    searchResults: [],
    typingUsers: [],
    listeners: [],
    typingRef: firebase.database().ref("typing"),
    connectedRef: firebase.database().ref(".info/connected"),
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.messageEnd) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messageEnd.scrollIntoView({ behavior: "smooth" });
  };

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners);
      this.addListeners(channel?.id);
      this.addUserStarsListener(channel?.id, user?.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  removeListeners = (listener) => {
    listener.forEach((listener) => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex((listeners) => {
      return (
        listeners.id === id &&
        listeners.ref === ref &&
        listeners.event === event
      );
    });

    if (index !== -1) {
      const newListeners = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListeners) });
    }
  };

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId);
  };

  addTypingListener = (channelId) => {
    let typingUsers = [];

    this.state.typingRef.child(channelId).on("child_added", (snap) => {
      if (snap.key !== this.state.user?.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val(),
        });
        this.setState({ typingUsers });
      }
    });
    this.addToListeners(channelId, this.state.typingRef, "child_added");

    this.state.typingRef.child(channelId).on("child_removed", (snap) => {
      const index = typingUsers.findIndex((user) => snap.key === user.uid);
      if (index !== -1) {
        typingUsers = typingUsers.filter((user) => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });
    this.addToListeners(channelId, this.state.typingRef, "child_removed");

    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user?.uid)
          .onDisconnect()
          .remove((err) => {
            if (err !== null) console.error(err);
          });
      }
    });
  };

  addMessageListener = (channelId) => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();

    ref.child(channelId).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
    this.addToListeners(channelId, ref, "child_added");
  };

  getMessagesRef = () => {
    const { privateChannel, messagesRef, privateMessagesRef } = this.state;

    return privateChannel ? privateMessagesRef : messagesRef;
  };

  countUniqueUsers = (message) => {
    const uniqueUsers = message.reduce((acc, message) => {
      if (!acc.includes(message.user.id)) {
        acc.push(message.user.id);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} User${plural ? "s" : ""}`;
    this.setState({ numUniqueUsers });
  };

  countUserPosts = (message) => {
    const userPosts = message.reduce((acc, message) => {
      if (message.user.id in acc) {
        acc[message.user.id].count += 1;
      } else {
        acc[message.user.id] = {
          avatar: message.user.avatar,
          count: 1,
          name: message.user.name,
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  handleSearchChange = (e) => {
    this.setState(
      {
        searchTerm: e.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  displayChannelName = (channel) => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  handleStar = () => {
    this.setState(
      (prevState) => ({
        isChannelStarred: !prevState.isChannelStarred,
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersRef.child(`${this.state.user?.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,

          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar,
          },
        },
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user?.uid}/starred`)
        .child(this.state.channel.id)
        .remove((err) => {
          if (err !== null) console.error(err);
        });
    }
  };

  addUserStarsListener = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then((data) => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  displayTypingUsers = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
        key={user.id}
      >
        <span className="user__typing">{user?.name} is typing </span> <Typing />
      </div>
    ));

  displayMessagesSkeleton = (loading) =>
    loading ? (
      <>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </>
    ) : null;

  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      numUniqueUsers,
      searchResults,
      searchTerm,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
      messagesLoading,
    } = this.state;

    return (
      <>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          isChannelStarred={isChannelStarred}
          handleStar={this.handleStar}
          handleChange={this.handleChange}
        />
        <Segment>
          <Comment.Group className="messages">
            {this.displayMessagesSkeleton(messagesLoading)}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={(node) => (this.messageEnd = node)} />
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
