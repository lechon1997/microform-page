import { Box, TextField, Typography } from "@mui/material";

export function StepNumber({ panError, panIsEmpty, isNumberFocused, activeStep }) {
  return (
    <Box sx={{ position: "relative", height: 100, mb: 2, display: activeStep === 0 ? "block" : "none" }}>
      <Box sx={{ position: "relative" }}>
        <TextField
          label="Número de tarjeta"
          fullWidth
          error={!!panError}
          InputProps={{
            readOnly: true,
            sx: { height: 50, paddingY: 0 },
          }}
          InputLabelProps={{
            shrink: isNumberFocused || !panIsEmpty,
          }}
          sx={{
            "& .MuiInputBase-root": { pointerEvents: "none" },
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isNumberFocused ? "#000" : "#ccc",
              borderWidth: isNumberFocused ? 2 : 1,
            },
            "& label": {
              fontSize: "0.8rem",
              color: isNumberFocused ? "#000" : "#888",
            },
            "& .MuiInputLabel-shrink": {
              fontSize: "0.75rem",
              transform: "translate(16px, -6px) scale(0.75)",
            },
            "& .MuiOutlinedInput-notchedOutline > legend": {
              maxWidth: isNumberFocused || !panIsEmpty ? "90px" : "0.01px",
            },
          }}
        />
        {/* Campo funcional de CyberSource */}
        <Box
          id="number-container"
          className="form-control"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            px: 2,
            display: "flex",
            alignItems: "center",
            pointerEvents: "auto",
          }}
        />
        {panError && (
          <Typography
            sx={{
              position: "absolute",
              left: 8,
              top: "100%",
              color: "#d32f2f",
              fontSize: "0.7rem",
              pointerEvents: "none",
              zIndex: 2,
              mt: "2px",
            }}
          >
            {panError}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
