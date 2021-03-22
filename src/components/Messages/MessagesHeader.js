import { motion } from "framer-motion";
import React, { Component } from "react";
import { Header, Segment, Icon, Input } from "semantic-ui-react";

class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
      isPrivateChannel,
      handleStar,
      isChannelStarred,
    } = this.props;

    return (
      <Segment clearing>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Header
            fluid="true"
            as="h2"
            floated="left"
            style={{ marginBottom: 0 }}
          >
            <span>
              {channelName}
              {!isPrivateChannel && (
                <Icon
                  onClick={handleStar}
                  name={isChannelStarred ? "star" : "star outline"}
                  color={isChannelStarred ? "yellow" : "black"}
                />
              )}
            </span>
            <Header.Subheader> {numUniqueUsers}</Header.Subheader>
          </Header>
        </motion.div>
        <motion.div
          whileTap={{
            scale: 1.08,
          }}
        >
          <Header floated="right">
            <Input
              loading={searchLoading}
              size="mini"
              icon="search"
              name="searchTerm"
              placeholder="Search Messages"
              onChange={handleSearchChange}
            />
          </Header>
        </motion.div>
      </Segment>
    );
  }
}

export default MessagesHeader;
