import { Box, Button, CircularProgress } from "@mui/material";

export function StepButtons({ activeStep, steps, loading, handleBack, handleNext }) {
  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        backgroundColor: "#fff",
        pt: 2,
        px: 2,
        pb: { xs: "calc(env(safe-area-inset-bottom) + 8px)", sm: 2 },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        {activeStep > 0 && (
          <Button
            variant="outlined"
            fullWidth
            sx={{
              height: 46,
              borderColor: "#ccc",
              color: "#212121",
              textTransform: "none",
              "&:hover": { borderColor: "#999" },
            }}
            onClick={handleBack}
            disabled={loading}
          >
            Volver
          </Button>
        )}
        <Button
          variant="contained"
          fullWidth
          sx={{
            color: "black",
            height: 46,
            backgroundColor: "#FFBC0D",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#e0a800", boxShadow: "none" },
          }}
          onClick={handleNext}
          disabled={loading}
        >
          {activeStep < steps.length - 1 ? (
            "Siguiente"
          ) : loading ? (
            <CircularProgress size={24} />
          ) : (
            "Guardar tarjeta"
          )}
        </Button>
      </Box>
    </Box>
  );
}
