import React from "react";
import firebase from "../../firebase";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

class Login extends React.Component {
  state = {
    email: "",
    errors: [],
    message: [],
    loading: false,
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  resetPassword = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });

      firebase
        .auth()
        .sendPasswordResetEmail(this.state.email)
        .then(this.setState({ message: "Check Your Inbox", loading: false }))
        .catch((err) => {
          console.log(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false,
          });
        });
    }
  };

  isFormValid = ({ email }) => {
    if (email) {
      return true;
    } else return false;
  };

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  iconVariants = {
    hidden: {
      opacity: 0.5,
    },
    hover: {
      scale: 1.1,
    },
    visible: {
      opacity: 1,
      scale: [1, 1.3, 1.3, 1, 1],
      rotate: [0, 0, 270, 270, 0],
      transition: {
        delay: 0.5,
        duration: 2,
        yoyo: Infinity,
      },
    },
  };

  render() {
    const { email, errors, loading, message } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app_auth">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <motion.div
              variants={this.iconVariants}
              initial="hidden"
              animate="visible"
            >
              <Icon name="key" color="teal" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: "100vw" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                delay: 1,
                duration: 2,
                stiffness: 120,
              }}
            >
              <span style={{ color: "red" }}>Password Reset</span>
            </motion.div>
          </Header>
          <motion.div
            initial={{ x: "-100vw" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", delay: 1.5, duration: 2 }}
          >
            <Form size="large" onSubmit={this.resetPassword}>
              <Segment stacked>
                <Form.Input
                  fluid
                  name="email"
                  icon="mail"
                  iconPosition="left"
                  placeholder="Email Address"
                  onChange={this.handleChange}
                  value={email}
                  className={this.handleInputError(errors, "email")}
                  type="email"
                />
                <motion.div
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  <Button
                    disabled={loading}
                    className={loading ? "loading" : ""}
                    color="red"
                    fluid
                    size="large"
                  >
                    Reset Password
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ marginTop: "1rem" }}
                >
                  Back to Login <Link to="/login">Login</Link>
                </motion.div>
              </Segment>
            </Form>
            {errors.length > 0 && (
              <motion.div
                style={{ marginTop: "1rem" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Message error>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <h3>Error</h3>
                    {this.displayErrors(errors)}
                  </motion.div>
                </Message>
              </motion.div>
            )}
            {message.length > 0 && <Message message>{message}</Message>}
            <Message>
              <motion.div
                whileHover={{
                  scale: 1.05,
                }}
                transition={{ duration: 0.3 }}
              >
                New Here? <Link to="/register"> Register </Link>
              </motion.div>
            </Message>
          </motion.div>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
