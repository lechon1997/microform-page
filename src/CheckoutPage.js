import React from "react";
import { ThemeProvider, createTheme, Box } from "@mui/material";
import Microform from "./components/Form/Microform";

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function CheckoutPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ px: 2 }}>
        <Microform />
      </Box>
    </ThemeProvider>
  );
}
