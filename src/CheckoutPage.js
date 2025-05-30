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

  const [panError, setPanError] = useState(null);
  const [cardIsValid, setCardIsValid] = useState(false);

  const [cardLogoSrc, setCardLogoSrc] = useState("");

  const [cvvError, setCvvError] = useState(null);
  const [cvvIsValid, setCvvIsValid] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [expError, setExpError] = useState(null);
  const [activeCardType, setActiveCardType] = useState("");

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

  const cardImages = {
    visa: "./visa.png",
    mastercard: "./mastercard.png",
    amex: "./amex.png",
    maestro: "./maestro.png",
    discover: "./discover.png",
    dinersclub: "./dinersclub.png",
    jcb: "./jcb.png",
  };

  const handleExpDateChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");

    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }

    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    setExpDate(value);
    setExpError(null);
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
          /*setPanError(null);
          setPanIsEmpty(event.empty);
          setCardIsValid(event.valid);

          const detectedType = event.card?.[0]?.name;
          setActiveCardType(cardImages[detectedType] ? detectedType : "");*/
        });

        // Campo CVV
        const cvvField = microform.createField("securityCode", {});
        cvvField.load("#securityCode-container");
        cvvField.on("focus", () => setIsCvvFocused(true));
        cvvField.on("blur", () => setIsCvvFocused(false));
        cvvField.on("change", (event) => {
          console.log("CVV event", event);
          setCvvIsValid(event.valid);
          setCvvIsEmpty(event.empty);
          setCvvError(null);
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
    if (activeStep === 0) {
      // Si el PAN está vacío
      if (panIsEmpty) {
        setPanError("Campo obligatorio*");
        return;
      }
      // Si hay cardInfo y es inválido
      console.log("Card info:", cardIsValid);
      if (!cardIsValid) {
        setPanError("El número de la tarjeta no es válido");
        return;
      }
      setPanError(null);
    }

    if (activeStep === 1) {
      let expHasError = false;
      let cvvHasError = false;

      // Expiración (MM/AA)
      const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expDate || expDate.trim() === "") {
        setExpError("Campo obligatorio*");
        expHasError = true;
      } else {
        // Validar el mes explícitamente
        const [mm, aa] = expDate.split("/");
        if (mm && (parseInt(mm, 10) < 1 || parseInt(mm, 10) > 12)) {
          setExpError("El mes debe ser entre 01 y 12");
          expHasError = true;
        } else if (!regex.test(expDate)) {
          setExpError("La fecha debe ser MM/AA");
          expHasError = true;
        } else {
          // Validar que la fecha sea futura
          const year = parseInt("20" + aa, 10);
          const month = parseInt(mm, 10) - 1; // JS: 0=enero
          const now = new Date();
          const exp = new Date(year, month + 1, 0); // Último día del mes de expiración
          if (exp < new Date(now.getFullYear(), now.getMonth(), 1)) {
            setExpError("La tarjeta está vencida");
            expHasError = true;
          }
        }
      }

      if (cvvIsEmpty) {
        setCvvError("Campo obligatorio*");
        cvvHasError = true;
      } else if (!cvvIsValid) {
        setCvvError("El código no es válido");
        cvvHasError = true;
      }

      if (expHasError || cvvHasError) {
        return;
      }
      setExpError(null);
      setCvvError(null);
    }

    if (activeStep === 2) {
      const value = (cardHolder || "").trim();
      const words = value.split(/\s+/).filter(Boolean);

      if (!value) {
        setNameError("Campo requerido*");
        return;
      }
      if (words.length < 2) {
        setNameError("Ingresá nombre y apellido");
        return;
      }
      if (value.length > 50) {
        setNameError("Máximo 50 caracteres");
        return;
      }
      if (!/^[A-ZÁÉÍÓÚÑ ]+$/i.test(value)) {
        setNameError("Solo se permiten letras y espacios");
        return;
      }
      setNameError(null);
    }

    if (cardIsValid && !panIsEmpty) {
      if (activeStep < steps.length - 1) {
        setActiveStep((prev) => prev + 1);
      } else {
        payButtonClicked();
      }
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
        mt: 8,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box
          sx={{
            position: "relative",
            height: 150,
            background: "#212121",
            color: "white",
            borderRadius: 2,
            px: 3,
            py: 2,
            mb: 2,
            mt: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 22,
              width: 40,
              height: 24,
              zIndex: 2,
            }}
          >
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
                  opacity: 0,
                  transition: "opacity 0.2s",
                  pointerEvents: "none", // Evita que se cliqueen las invisibles
                  visibility: "hidden",
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

          {/* Línea central con los asteriscos */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Typography
              sx={{ letterSpacing: 2, fontSize: 18, fontWeight: 500, mt: 3 }}
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
                  maxWidth: 260, // Ajustá según el ancho de la tarjeta
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.2,
                  minHeight: 13 * 2, // para que reserve espacio hasta 2 líneas
                }}
              >
                {cardHolder || "NOMBRE APELLIDO"}
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

        {error && (
          <Alert sx={{ mb: 2 }} severity="error">
            {error}
          </Alert>
        )}

        {/* Campo número de tarjeta (siempre en el DOM, visible solo en step 0) */}
        <Box sx={{ position: "relative", height: 100, mb: 2 }}>
          {/* Paso 0: PAN */}

          <Box sx={{ position: "relative" }}>
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
                error={!!panError}
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
            {panError && (
              <Typography
                sx={{
                  position: "absolute",
                  left: 8, // alineado al label/input
                  top: "100%", // justo debajo del campo
                  color: "#d32f2f",
                  fontSize: "0.7rem",
                  pointerEvents: "none", // no bloquea el mouse
                  zIndex: 2,
                  mt: "2px", // separación visual mínima
                }}
              >
                {panError}
              </Typography>
            )}
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
                  sx: {
                    height: 50,
                    paddingY: 0,
                  },
                }}
                InputLabelProps={{
                  shrink: isExpFocused || !!expDate,
                }}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: expError
                        ? "#d32f2f"
                        : isExpFocused
                        ? "#000"
                        : "#ccc",
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

            {/* CVV visual */}
            <Box sx={{ width: "50%", position: "relative" }}>
              <TextField
                label="Código de seguridad"
                error={!!cvvError}
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
              error={!!nameError}
              onChange={(e) => {
                let value = e.target.value.toUpperCase();

                value = value.replace(/[^A-ZÁÉÍÓÚÑ ]/gi, "");

                if (value.length > 50) value = value.slice(0, 50);

                setCardHolder(value);
                setNameError(null);
              }}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              fullWidth
              InputProps={{
                maxLength: 50,
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
        </Box>
      </Box>

      <Box
        sx={{
          position: "sticky", // se mantiene visible cuando hay scroll
          bottom: 0,
          zIndex: 10,
          backgroundColor: "#fff", // fondo blanco para que no se mezcle con el contenido
          pt: 2,
          px: 2,
          pb: {
            xs: "calc(env(safe-area-inset-bottom) + 8px)",
            sm: 2,
          },
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
                "&:hover": {
                  borderColor: "#999",
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
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#e0a800",
                boxShadow: "none",
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
