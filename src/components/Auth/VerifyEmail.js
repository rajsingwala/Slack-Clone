import React, { Component } from "react";
import {
  Grid,
  Header,
  Icon,
  Segment,
  Button,
  Message,
} from "semantic-ui-react";
import firebase from "../../firebase";

class VerifyEmail extends Component {
  state = {
    message: [],
  };

  sendVerification = () => {
    var user = firebase.auth().currentUser;
    user
      .sendEmailVerification()
      .then(() => {
        this.setState({ message: "Email has been sent Successfully" });
      })
      .catch((err) => console.error(err));
  };

  render() {
    const { message } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app_auth">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="blue" textAlign="center">
            <Icon name="envelope outline" color="blue" />
          </Header>
          <Segment stacked>
            <h2 className="r_color">Verify Your Email</h2>
            <p>Click here to send verification</p>
            <Button
              color="blue"
              fluid
              size="large"
              onClick={this.sendVerification}
            >
              Send Verification
            </Button>
          </Segment>
          {message.length > 0 && <Message message>{message}</Message>}
        </Grid.Column>
      </Grid>
    );
  }
}

export default VerifyEmail;
