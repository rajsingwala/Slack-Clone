import React from "react";
import firebase from "../../firebase";
import AvatarEditor from "react-avatar-editor";

import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button,
  Form,
  Message,
} from "semantic-ui-react";
import { connect } from "react-redux";
import slack from "../image/slack.svg";
import { motion } from "framer-motion";

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    modal2: false,
    previewImage: "",
    croppedImage: "",
    blob: null,
    uploadedCroppedImage: "",
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref("users"),
    channelRef: firebase.database().ref("channel"),
    metadata: {
      contentType: "image/jpeg",
    },
    username: "",
    errors: [],
    channel: this.props.currentChannel,
    messagesRef: firebase.database().ref("messages"),
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  openModal2 = () => this.setState({ modal2: true });
  closeModal2 = () => this.setState({ modal2: false });

  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{this.state.user?.displayName}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span onClick={this.openModal}>Change Avatar</span>,
    },
    {
      key: "editprofile",
      text: <span onClick={this.openModal2}>Change Username</span>,
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignout}>Sign Out</span>,
    },
  ];

  uploadCroppedImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;

    storageRef
      .child(`avatars/users/${userRef.uid}`)
      .put(blob, metadata)
      .then((snap) => {
        snap.ref.getDownloadURL().then((downloadURL) => {
          this.setState({ uploadedCroppedImage: downloadURL }, () =>
            this.changeAvatar()
          );
        });
      });
  };

  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedCroppedImage,
      })
      .then(() => {
        console.log("PhotoURL updated");
        this.closeModal();
      })
      .catch((err) => {
        console.error(err);
      });

    this.state.usersRef
      .child(this.state.user?.uid)
      .update({ avatar: this.state.uploadedCroppedImage })
      .then(() => {
        console.log("User avatar updated");
      })
      .catch((err) => {
        console.error(err);
      });

    this.state.channelRef
      .child(this.state.channel?.id)
      .child("createdBy")
      .update({ avatar: this.state.uploadedCroppedImage })
      .then(() => console.log("channel-username updated"))
      .catch((err) => console.error(err));
  };

  handleChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob,
        });
      });
    }
  };

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out!"));
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Username Can't Empty" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ username }) => {
    return !username.length;
  };

  editProfile = (e) => {
    e.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [] });
      this.updateProfile();
    }
  };

  updateProfile = () => {
    this.state.userRef
      .updateProfile({
        displayName: this.state.username,
      })
      .then(() => {
        console.log("redux username updated");
        this.closeModal2();
      })
      .catch((err) => console.error(err));

    this.state.usersRef
      .child(this.state.user?.uid)
      .update({ name: this.state.username })
      .then(() => {
        console.log("database username updated");
      })
      .catch((err) => {
        console.error(err);
      });

    this.state.channelRef
      .child(this.state.channel?.id)
      .child("createdBy")
      .update({ name: this.state.username })
      .then(() => console.log("channel-username updated"))
      .catch((err) => console.error(err));
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
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

  iconVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      rotate: [0, 0, 270, 270, 0],
      transition: {
        delay: 0.5,
        duration: 2,
      },
    },
  };

  render() {
    const {
      user,
      modal,
      previewImage,
      croppedImage,
      modal2,
      username,
      errors,
    } = this.state;
    const { primaryColor } = this.props;

    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* App Header */}
            <Header inverted floated="left" as="h3">
              <Image src={slack} className="slack__img" />

              <Header.Content className="size">Notify-Slack</Header.Content>
            </Header>
            {/* User Dropdown  */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              <Header style={{ padding: "0.25em" }} as="h4" inverted>
                <Dropdown
                  trigger={
                    <span>
                      <Image src={user?.photoURL} spaced="right" avatar />
                      {user?.displayName}
                    </span>
                  }
                  options={this.dropdownOptions()}
                />
              </Header>
            </motion.div>
          </Grid.Row>

          {/* Change User Avatar Modal   */}
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChange}
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={(node) => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button
                  color="green"
                  inverted
                  onClick={this.uploadCroppedImage}
                >
                  <Icon name="save" /> Change Avatar
                </Button>
              )}
              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>

          <Modal open={modal2} onClose={this.closeModal2}>
            <Modal.Header>Edit Profile</Modal.Header>
            <Modal.Content>
              <Form onSubmit={this.editProfile}>
                <Form.Input
                  fluid
                  name="username"
                  value={username}
                  onChange={this.handleInputChange}
                  className={this.handleInputError(errors, "username")}
                  icon="user"
                  iconPosition="left"
                  placeholder="New Username"
                  required
                />
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button color="green" inverted onClick={this.editProfile}>
                <Icon name="checkmark" /> Edit Profile
              </Button>
              <Button color="red" inverted onClick={this.closeModal2}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
            {errors.length > 0 && (
              <Message error>
                <h3>Error</h3>
                {this.displayErrors(errors)}
              </Message>
            )}
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(UserPanel);
