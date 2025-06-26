import { Box, Typography } from "@mui/material";

export function CreditCardPreview({ cardImages, activeCardType, cardHolder, expDate }) {
  return (
    <Box
      sx={{
        position: "relative",
        height: 150,
        background: "#212121",
        color: "white",
        borderRadius: 2,
        px: 3,
        py: 2,
        mb: 4,
        mt: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, left: 22, width: 40, height: 24, zIndex: 2 }}>
        {Object.entries(cardImages).map(([type, src]) => (
          <Box
            key={type}
            component="img"
            src={src}
            alt={`${type} logo`}
            sx={{
              width: 40,
              height: 24,
              objectFit: "contain",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: activeCardType === type ? 1 : 0,
              transition: "opacity 0.2s",
              pointerEvents: "none",
              visibility: activeCardType === type ? "visible" : "hidden",
            }}
          />
        ))}
      </Box>
      <img
        src="/chip2.svg"
        alt="chip dorado"
        style={{
          position: "absolute",
          right: 24,
          top: "42%",
          transform: "translateY(-50%)",
          width: 60,
          height: 68,
          objectFit: "contain",
          zIndex: 2,
        }}
      />
      <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
        <Typography sx={{ letterSpacing: 2, fontSize: 18, fontWeight: 500, mt: 3 }}>
          **** **** **** ****
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <Box>
          <Typography sx={{ fontSize: 9, fontWeight: 400, mb: 0.5, color: "#E0E0E0" }}>
            Nombre del titular
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: 11,
              fontWeight: 400,
              maxWidth: 260,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.2,
              minHeight: 13 * 2,
            }}
          >
            {cardHolder || "NOMBRE APELLIDO"}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: "#E0E0E0", fontSize: 9, fontWeight: 400, mb: 0.5 }}>
            Fecha de expiración
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 11, fontWeight: 400 }}>
            {expDate ? `${expDate.slice(0, 2)}/${expDate.slice(3, 5)}` : "MM/AA"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
