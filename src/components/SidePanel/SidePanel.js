import React from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channel from "./Channel";
import DirectMessage from "./DirectMessage";
import Starred from "./Starred";

class SidePanel extends React.Component {
  render() {
    const { currentUser, primaryColor, currentChannel } = this.props;

    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: primaryColor, fontSize: "1.2rem" }}
      >
        <UserPanel
          primaryColor={primaryColor}
          currentUser={currentUser}
          currentChannel={currentChannel}
        />
        <Starred currentUser={currentUser} />
        <Channel currentUser={currentUser} />
        <DirectMessage currentUser={currentUser} />
      </Menu>
    );
  }
}

export default SidePanel;
