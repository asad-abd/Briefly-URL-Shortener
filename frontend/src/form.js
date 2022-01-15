import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import HttpOutlinedIcon from "@mui/icons-material/HttpOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";
import Alert from "@mui/material/Alert";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        CSD: Group 3
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

export default function SignIn() {
  const [longUrl, setLongUrl] = useState("");
  const [expiry, setExpiry] = useState("30");
  const [emptyError, setEmptyError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (longUrl.length === 0) {
      setEmptyError(true);
    } else {
      setEmptyError(false);
      console.log(longUrl);

      axios
        .put("http://localhost:3001/shorten", {
          longUrl: longUrl,
          expiry: expiry,
        })
        .then(function (response) {
          console.log("hello");
          alert("buffallo");
          console.log(response.data.short);
        })
        .catch(function (error) {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
          }
        });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <HttpOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            URL Shortner
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              error={emptyError}
              margin="normal"
              required
              fullWidth
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              //id="longURL"
              label="Enter the URL to shorten"
              //name="longURL"
              /*autoComplete="email"*/
              autoFocus
            />
            <FormControl fullWidth>
              <InputLabel variant="standard" htmlFor="uncontrolled-native">
                Short URL Expiry (in days from creation)
              </InputLabel>
              <NativeSelect
                defaultValue={30}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                inputProps={{
                  name: "age",
                  id: "uncontrolled-native",
                }}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </NativeSelect>
            </FormControl>
            {/* <TextField
              margin="normal"
              fullWidth
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              label="Expiry date of short URL (in days)"
              autoFocus
            /> */}
            <TextField
              margin="normal"
              fullWidth
              id="custom"
              label="Custom Url (only 6 character long from [a-z, A-Z, 0-9]"
              name="custom"
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Generate Short URL
            </Button>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
