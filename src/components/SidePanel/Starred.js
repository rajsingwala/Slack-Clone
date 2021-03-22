import React, { Component } from "react";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";
import firebase from "../../firebase";
import { motion } from "framer-motion";

class Starred extends Component {
  state = {
    activeChannel: "",
    starredChannels: [],
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    this.state.usersRef.child(`${this.state.user?.uid}/starred`).off();
  };

  addListener = (userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", (snap) => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel],
        });
      });

    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", (snap) => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannel = this.state.starredChannels.filter((channel) => {
          return channel.id !== channelToRemove.id;
        });
        this.setState({ starredChannels: filteredChannel });
      });
  };

  changeChannel = (channel) => {
    this.activeChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  activeChannel = (channels) => {
    this.setState({ activeChannel: channels.id });
  };

  displayChannel = (starredChannels) =>
    starredChannels.length > 0 &&
    starredChannels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.8 }}
        active={channel.id === this.state.activeChannel}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          # {channel.name}
        </motion.div>
      </Menu.Item>
    ));

  render() {
    const { starredChannels } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            <span>
              <Icon name="star" />
              STARRED
            </span>{" "}
            ({starredChannels.length})
          </motion.div>
        </Menu.Item>
        {this.displayChannel(starredChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setPrivateChannel, setCurrentChannel })(Starred);
