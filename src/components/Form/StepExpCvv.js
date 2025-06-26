import { Box, TextField, Typography } from "@mui/material";

export function StepExpCvv({
  activeStep,
  expDate,
  handleExpDateChange,
  expError,
  isExpFocused,
  setIsExpFocused,
  cvvError,
  isCvvFocused,
  setIsCvvFocused,
  cvvIsEmpty
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: activeStep === 1 ? "flex" : "none",
        gap: 2,
      }}
    >
      {/* Fecha de expiración */}
      <Box sx={{ width: "50%", position: "relative" }}>
        <TextField
          label="Fecha de expiración"
          placeholder="MM/AA"
          value={expDate}
          error={!!expError}
          onChange={handleExpDateChange}
          onFocus={() => setIsExpFocused(true)}
          onBlur={() => setIsExpFocused(false)}
          inputProps={{
            maxLength: 5,
            inputMode: "numeric",
            sx: { height: 50, paddingY: 0 },
          }}
          InputLabelProps={{
            shrink: isExpFocused || !!expDate,
          }}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: expError ? "#d32f2f" : isExpFocused ? "#000" : "#ccc",
                borderWidth: expError ? 1 : isExpFocused ? 2 : 1,
              },
            },
            "& .MuiInputBase-input": {
              fontSize: "14px",
              lineHeight: "1.5",
              color: isExpFocused ? "#1976d2" : "#212121",
              "&::placeholder": {
                color: expError ? "#d32f2f" : "#888",
                fontSize: "0.65rem",
              },
            },
            "& label": {
              fontSize: "0.8rem",
              color: expError
                ? "#d32f2f"
                : isExpFocused
                ? "#1976d2"
                : "#888",
            },
            "& .MuiInputLabel-shrink": {
              fontSize: "0.75rem",
              transform: "translate(16px, -6px) scale(0.75)",
            },
            "& .MuiOutlinedInput-notchedOutline > legend": {
              maxWidth: isExpFocused || !!expDate ? "98px" : "0.01px",
            },
          }}
        />
        {expError && (
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
            {expError}
          </Typography>
        )}
      </Box>
      {/* CVV */}
      <Box sx={{ width: "50%", position: "relative" }}>
        <TextField
          label="Código de seguridad"
          error={!!cvvError}
          fullWidth
          InputProps={{
            readOnly: true,
            sx: { height: 50, paddingY: 0 },
          }}
          InputLabelProps={{
            shrink: isCvvFocused || !cvvIsEmpty,
          }}
          sx={{
            "& .MuiInputBase-root": { pointerEvents: "none" },
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isCvvFocused ? "#000" : "#ccc",
              borderWidth: isCvvFocused ? 2 : 1,
            },
            "& label": {
              fontSize: "0.8rem",
              color: isCvvFocused ? "#1976d2" : "#888",
            },
            "& .MuiInputLabel-shrink": {
              fontSize: "0.75rem",
              transform: "translate(16px, -6px) scale(0.75)",
            },
            "& .MuiOutlinedInput-notchedOutline > legend": {
              maxWidth: isCvvFocused || !cvvIsEmpty ? "102px" : "0.01px",
            },
          }}
        />
        <Box
          id="securityCode-container"
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
        {cvvError && (
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
            {cvvError}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
