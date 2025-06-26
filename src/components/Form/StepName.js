import { Box, TextField, Typography } from "@mui/material";

export function StepName({
  cardHolder,
  setCardHolder,
  nameError,
  isNameFocused,
  setIsNameFocused,
  activeStep
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: activeStep === 2 ? "block" : "none",
      }}
    >
      <TextField
        label="Nombre y apellido"
        value={cardHolder}
        error={!!nameError}
        onChange={(e) => {
          let value = e.target.value.toUpperCase();
          value = value.replace(/[^A-ZÁÉÍÓÚÑ ]/gi, "");
          if (value.length > 50) value = value.slice(0, 50);
          setCardHolder(value);
        }}
        onFocus={() => setIsNameFocused(true)}
        onBlur={() => setIsNameFocused(false)}
        fullWidth
        InputProps={{
          maxLength: 50,
          sx: { height: 50, paddingY: 0 },
        }}
        InputLabelProps={{
          shrink: isNameFocused || !!cardHolder,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: nameError
                ? "#d32f2f"
                : isNameFocused
                ? "#000"
                : "#ccc",
              borderWidth: nameError ? 2 : isNameFocused ? 2 : 1,
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "14px",
            lineHeight: "1.5",
            color: isNameFocused ? "#1976d2" : "#212121",
          },
          "& label": {
            fontSize: "0.8rem",
            color: nameError
              ? "#d32f2f"
              : isNameFocused
              ? "#1976d2"
              : "#888",
          },
          "& .MuiInputLabel-shrink": {
            fontSize: "0.75rem",
            transform: "translate(16px, -6px) scale(0.75)",
          },
          "& .MuiOutlinedInput-notchedOutline > legend": {
            maxWidth: isNameFocused || !!cardHolder ? "90px" : "0.01px",
          },
        }}
      />
      {nameError && (
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
          {nameError}
        </Typography>
      )}
    </Box>
  );
}
