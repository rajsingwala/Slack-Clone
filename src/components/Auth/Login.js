import React from "react";
import firebase from "../../firebase";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Image,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import { googleAuthProvider } from "../../firebase";
import { motion } from "framer-motion";
import slack from "../image/slack.svg";

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false,
    loading2: false,
    usersRef: firebase.database().ref("users"),
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });

      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then((signedInUser) => console.log(signedInUser))
        .catch((err) => {
          console.log(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false,
          });
        });
    }
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ email, password }) => {
    return !email.length || !password.length;
  };

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  saveUser = (createdUser) => {
    return this.state.usersRef.child(createdUser.user?.uid).set({
      name: createdUser.user?.displayName,
      avatar: createdUser.user?.photoURL,
    });
  };

  googleLogin = (e) => {
    e.preventDefault();
    firebase
      .auth()
      .signInWithPopup(googleAuthProvider)
      .then((signedInUser) => this.saveUser(signedInUser))
      .catch((err) => {
        console.log(err);
        this.setState({
          errors: this.state.errors.concat(err),
          loading2: false,
        });
      });
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
    const { email, password, errors, loading, loading2 } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app_auth">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <motion.div
              variants={this.iconVariants}
              initial="hidden"
              animate="visible"
            >
              <Image src={slack} centered className="slack__img" />
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
              <span className="l_color">Login for Notify-Slack</span>
            </motion.div>
          </Header>
          <motion.div
            initial={{ x: "-100vw" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", delay: 1.5, duration: 2 }}
          >
            <Form onSubmit={this.handleSubmit} size="large">
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

                <Form.Input
                  fluid
                  name="password"
                  icon="lock"
                  iconPosition="left"
                  placeholder="Password"
                  onChange={this.handleChange}
                  value={password}
                  className={this.handleInputError(errors, "password")}
                  type="password"
                />
                <p>
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                    }}
                  >
                    <Link to="/forgot-password">Forgot Password?</Link>
                  </motion.div>
                </p>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    disabled={loading}
                    className={loading ? "loading" : ""}
                    color="violet"
                    fluid
                    size="large"
                  >
                    Login
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    disabled={loading2}
                    onClick={this.googleLogin}
                    className={loading2 ? "loading" : ""}
                    style={{ marginTop: "1em" }}
                    color="orange"
                    fluid
                    size="large"
                    icon="google"
                    labelPosition="left"
                    content="Login With Google"
                  />
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

            <Message>
              <motion.div
                whileHover={{
                  scale: 1.05,
                }}
                transition={{ duration: 0.3 }}
              >
                {" "}
                New Here? <Link to="/register"> Register </Link>{" "}
              </motion.div>
            </Message>
          </motion.div>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
