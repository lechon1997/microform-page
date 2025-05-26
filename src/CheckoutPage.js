import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { jwtDecode } from "jwt-decode";

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const steps = ["Número", "Código + Expiración", "Nombre"];

function Microform() {
  const microformRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expDate, setExpDate] = useState("");
  const [isExpFocused, setIsExpFocused] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [microformInitialized, setMicroformInitialized] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [panIsEmpty, setPanIsEmpty] = useState(true);
  const [cvvIsEmpty, setCvvIsEmpty] = useState(true);
  const [isCvvFocused, setIsCvvFocused] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isNumberFocused, setIsNumberFocused] = useState(false);
  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);

  const myStyles = {
    input: {
      "font-size": "15px",
      "line-height": "1.5",
      color: "#212121",
    },
    ":focus": {
      color: "#1976d2",
    },
    valid: {
      color: "#2e7d32",
    },
    invalid: {
      color: "#d32f2f",
    },
  };

  const handleExpDateChange = (e) => {
    let value = e.target.value;

    value = value.replace(/[^\d/]/g, "");

    if (value.length === 2 && !value.includes("/") && !expDate.includes("/")) {
      value += "/";
    }

    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    setExpDate(value);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("cc");
    if (!t) {
      setError("Falta el parámetro ?cc");
      return;
    }

    const decoded = jwtDecode(t);
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      setError("El capture-context ha expirado. Recarga la página.");
      return;
    }

    setToken(t);
    setDecodedToken(decoded);
  }, []);

  useEffect(() => {
    if (!token || !decodedToken || microformInitialized) return;

    const { clientLibrary, clientLibraryIntegrity } = decodedToken.ctx[0].data;
    const script = document.createElement("script");
    script.src = clientLibrary;
    script.async = true;
    if (clientLibraryIntegrity) {
      script.integrity = clientLibraryIntegrity;
      script.crossOrigin = "anonymous";
    }

    script.onload = () => {
      try {
        const flex = new window.Flex(token);
        const microform = flex.microform({ styles: myStyles });

        // Campo PAN
        const panField = microform.createField("number", {});
        panField.load("#number-container");
        panField.on("focus", () => setIsNumberFocused(true));
        panField.on("blur", () => setIsNumberFocused(false));
        panField.on("change", (event) => {
          console.log("PAN event", event);
          setPanIsEmpty(event.empty);
          const cardImage = document.querySelector("img.cardDisplay");
          const cardImages = {
            visa: "./visa.png",
            mastercard: "./mastercard.png",
            amex: "./amex.png",
            maestro: "./maestro.png",
            discover: "./discover.png",
            dinersclub: "./dinersclub.png",
            jcb: "./jcb.png",
          };

          if (event.card?.length === 1) {
            const cardType = event.card[0].name;
            if (cardImages[cardType]) {
              cardImage.src = cardImages[cardType];
              cardImage.style.visibility = "visible";
            } else {
              cardImage.style.visibility = "hidden";
            }
          } else {
            cardImage.style.visibility = "hidden";
          }
        });

        // Campo CVV
        const cvvField = microform.createField("securityCode", {});
        cvvField.load("#securityCode-container");
        cvvField.on("focus", () => setIsCvvFocused(true));
        cvvField.on("blur", () => setIsCvvFocused(false));
        cvvField.on("change", (event) => {
          console.log("CVV event", event);

          setCvvIsEmpty(event.empty);
        });
        microformRef.current = microform;
        setMicroformInitialized(true); // ⬅️ evitar repetir
      } catch (err) {
        setError(
          err.reason === "CAPTURE_CONTEXT_INVALID"
            ? "El capture-context es inválido o ya caducó."
            : err.message
        );
      }
    };

    script.onerror = () =>
      setError("No se pudo descargar la librería de Microform.");
    document.head.appendChild(script);
  }, [token, decodedToken, microformInitialized]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      payButtonClicked();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const payButtonClicked = () => {
    if (!microformRef.current) return;
    setLoading(true);

    const [month, year] = expDate.split("/");

    microformRef.current.createToken(
      { expirationMonth: month, expirationYear: `20${year}` },
      (err, res) => {
        setLoading(false);
        if (err) {
          console.error(err);
          setError(err.message || "Error creando token");
        } else {
          console.log("Transient Token:", res.transientToken || res);
          alert("Token generado – revisa la consola");
        }
      }
    );
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        p: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box
          sx={{
            position: "relative",
            height: 120,
            background: "#212121",
            color: "white",
            borderRadius: 2,
            px: 3,
            py: 2,
            mb: 4,
            mt: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            component="img"
            className="cardDisplay"
            src=""
            alt="card logo"
            sx={{
              visibility: "hidden",
              position: "absolute",
              top: 8,
              right: 16,
              width: 40,
              height: 24,
              objectFit: "contain",
            }}
          />
          {/* Línea central con los asteriscos */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Typography
              sx={{ letterSpacing: 2, fontSize: 18, fontWeight: 500 }}
            >
              **** **** **** ****
            </Typography>
          </Box>

          {/* Línea inferior con nombre y fecha */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 9,
                  fontWeight: 400,
                  mb: 0.5,
                  color: "#E0E0E0",
                }}
              >
                Nombre del titular
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 11,
                  fontWeight: 400,
                }}
              >
                {cardHolder.toUpperCase() || "NOMBRE APELLIDO"}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  color: "#E0E0E0",
                  fontSize: 9,
                  fontWeight: 400,
                  mb: 0.5,
                }}
              >
                Fecha de expiración
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 11,
                  fontWeight: 400,
                }}
              >
                {expDate
                  ? `${expDate.slice(0, 2)}/${expDate.slice(3, 5)}`
                  : "MM/AA"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Campo número de tarjeta (siempre en el DOM, visible solo en step 0) */}
        <Box sx={{ position: "relative", height: 100, mb: 2 }}>
          {/* Paso 0: PAN */}

          <Box sx={{ position: "relative", mb: 2 }}>
            <Box
              sx={{
                position: "relative",
                mb: 2,
                display: activeStep === 0 ? "block" : "none", // 👈 oculta todo visualmente pero lo mantiene en el DOM
              }}
            >
              <TextField
                label="Número de tarjeta"
                fullWidth
                InputProps={{
                  readOnly: true,
                  sx: {
                    height: 50,
                    paddingY: 0,
                  },
                }}
                InputLabelProps={{
                  shrink: isNumberFocused || !panIsEmpty,
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    pointerEvents: "none",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
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
                    maxWidth:
                      isNumberFocused || !panIsEmpty ? "90px" : "0.01px",
                  },
                }}
              />

              {/* Campo funcional real de CyberSource */}
              <Box
                id="number-container"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  px: 2,
                  display: activeStep === 0 ? "flex" : "none", // 👈 esto lo oculta fuera del paso 0
                  alignItems: "center",
                  pointerEvents: "auto",
                }}
              />
            </Box>
          </Box>
          {/* Paso 2: Expiración + CVV */}
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
            <TextField
              label="Fecha de expiración"
              placeholder="MM/AA"
              value={expDate}
              onChange={handleExpDateChange}
              onFocus={() => setIsExpFocused(true)}
              onBlur={() => setIsExpFocused(false)}
              inputProps={{
                maxLength: 5,
                inputMode: "numeric",
                sx: {
                  height: 50,
                  paddingY: 0,
                },
              }}
              InputLabelProps={{
                shrink: isExpFocused || !!expDate,
              }}
              sx={{
                width: "50%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isExpFocused ? "#000" : "#ccc",
                    borderWidth: isExpFocused ? 2 : 1,
                  },
                },
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: isExpFocused ? "#1976d2" : "#212121", // 👈 aquí está el cambio importante
                  "&::placeholder": {
                    color: "#888",
                    fontSize: "0.8rem",
                  },
                },

                "& label": {
                  fontSize: "0.8rem",
                  color: isExpFocused ? "#1976d2" : "#888", // 👈 aquí está el cambio importante
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

            {/* CVV visual */}
            <Box sx={{ width: "50%", position: "relative" }}>
              <TextField
                label="Código de seguridad"
                fullWidth
                InputProps={{
                  readOnly: true,
                  sx: {
                    height: 50,
                    paddingY: 0,
                  },
                }}
                InputLabelProps={{
                  shrink: isCvvFocused || !cvvIsEmpty,
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    pointerEvents: "none",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isCvvFocused ? "#000" : "#ccc",
                    borderWidth: isCvvFocused ? 2 : 1,
                  },
                  "& label": {
                    fontSize: "0.8rem",
                    color: isCvvFocused ? "#1976d2" : "#888", // 👈 aquí está el cambio importante
                  },
                  "& label.Mui-focused": {
                    color: "primary.main", // o simplemente omitilo y dejará el color por defecto
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
            </Box>
          </Box>

          {/* Paso 3: Nombre */}
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
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              fullWidth
              InputProps={{
                sx: {
                  height: 50,
                  paddingY: 0,
                },
              }}
              InputLabelProps={{
                shrink: isNameFocused || !!cardHolder,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isNameFocused ? "#000" : "#ccc",
                    borderWidth: isNameFocused ? 2 : 1,
                  },
                },
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: isNameFocused ? "#1976d2" : "#212121",
                },
                "& label": {
                  fontSize: "0.8rem",
                  color: isNameFocused ? "#1976d2" : "#888",
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
          </Box>
        </Box>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}
      >
        {activeStep > 0 && (
          <Button
            variant="outlined"
            fullWidth
            sx={{
              height: 46,
              borderColor: "#ccc", // 👈 borde gris claro
              color: "#212121", // color de texto si querés mantenerlo oscuro
              textTransform: "none", // opcional: mantener el texto como lo escribís
              "&:hover": {
                borderColor: "#999", // opcional: un poco más oscuro en hover
              },
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
            boxShadow: "none", // 👈 quita la sombra
            "&:hover": {
              backgroundColor: "#e0a800", // opcional: color hover sin sombra
              boxShadow: "none", // 👈 quita la sombra también en hover
            },
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

export default function CheckoutPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ px: 2 }}>
        <Microform />
      </Box>
    </ThemeProvider>
  );
}
