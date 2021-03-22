import React, { Component } from "react";
import {
  Menu,
  Icon,
  Modal,
  Input,
  Form,
  Button,
  Message,
  Label,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";
import { motion } from "framer-motion";

class Channel extends Component {
  state = {
    user: this.props.currentUser,
    channels: [],
    channel: null,
    notifications: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    errors: [],
    firstLoad: true,
    activeChannel: "",
    channelRef: firebase.database().ref("channel"),
    messagesRef: firebase.database().ref("messages"),
    typingRef: firebase.database().ref("typing"),
  };

  componentDidMount() {
    this.addListener();
  }

  addListener = () => {
    let loadedChannel = [];
    this.state.channelRef.on("child_added", (snap) => {
      loadedChannel.push(snap.val());
      this.setState({ channels: loadedChannel }, () => this.setFirstChannel());
      this.getNotificationListener(snap.key);
    });
  };

  getNotificationListener = (channelId) => {
    this.state.messagesRef.child(channelId).on("value", (snap) => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }

    this.setState({ notifications });
  };

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.activeChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }
    this.setState({ firstLoad: false });
  };

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    this.state.channelRef.off();
  };

  closeModal = () => this.setState({ modal: false });
  openModal = () => this.setState({ modal: true });

  addChannel = () => {
    const { channelRef, channelDetails, channelName, user } = this.state;

    const key = channelRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,

      createdBy: {
        name: user?.displayName,
        avatar: user?.photoURL,
      },
    };

    channelRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("channel added");
      })
      .catch((err) => console.error(err));
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      this.setState({ errors: [] });
      return true;
    }
  };

  isFormEmpty = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    if (this.isFormValid(this.state)) {
      this.setState({ errors: [] });
      this.addChannel();
    }
  };

  changeChannel = (channel) => {
    this.activeChannel(channel);
    this.state.typingRef
      .child(this.state.channel?.id)
      .child(this.state.user?.uid)
      .remove();
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel });
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.channel.id
    );

    if (index !== -1) {
      let updatedNotification = [...this.state.notifications];
      updatedNotification[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotification[index].count = 0;
      this.setState({ notifications: updatedNotification });
    }
  };

  activeChannel = (channels) => {
    this.setState({ activeChannel: channels.id });
  };

  displayChannel = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.8 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          # {channel.name}
        </motion.div>
      </Menu.Item>
    ));

  getNotificationCount = (channel) => {
    let count = 0;

    this.state.notifications.forEach((notification) => {
      if (channel.id === notification.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  render() {
    const { channels, modal, channelDetails, channelName, errors } = this.state;
    return (
      <>
        <Menu.Menu className="menu">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            <Menu.Item>
              <span>
                <Icon name="exchange" />
                CHANNELS
              </span>{" "}
              ({channels.length})
              <Icon name="add" onClick={this.openModal} />
            </Menu.Item>
          </motion.div>

          {this.displayChannel(channels)}

          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Add a Channel</Modal.Header>
            <Modal.Content>
              <Form onClick={this.handleSubmit}>
                <Form.Field>
                  <Input
                    fluid
                    label="Channel Name"
                    name="channelName"
                    onChange={this.handleChange}
                    className={this.handleInputError(errors, "channelName")}
                    value={channelName}
                  />
                </Form.Field>
                <Form.Field>
                  <Input
                    fluid
                    label="About the Channel"
                    name="channelDetails"
                    onChange={this.handleChange}
                    className={this.handleInputError(errors, "channelDetails")}
                    value={channelDetails}
                  />
                </Form.Field>
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button color="green" inverted onClick={this.handleSubmit}>
                <Icon name="checkmark" />
                Add
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" />
                Cancel
              </Button>
            </Modal.Actions>
            {errors.length > 0 && (
              <Message error>{this.displayErrors(errors)}</Message>
            )}
          </Modal>
        </Menu.Menu>
      </>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Channel);
