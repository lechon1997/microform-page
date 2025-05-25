import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  TextField,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";

const steps = ["Número", "CVV", "Expiración", "Nombre"];

function Microform() {
  const microformRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [maskedNumber, setMaskedNumber] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [isNumberFocused, setIsNumberFocused] = useState(false);
  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);

  const myStyles = {
    input: {
      "font-size": "16px",
      "line-height": "1.5",
      color: "#212121",
      direction: "ltr", // 👈 importante
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
    if (activeStep !== 0 || !token || !decodedToken) return;

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

        const PANIFrame = microform.createField("number", {
          placeholder: "Número de tarjeta",
        });
        PANIFrame.load("#number-container");
        PANIFrame.on("focus", () => setIsNumberFocused(true));
        PANIFrame.on("blur", () => setIsNumberFocused(false));
        PANIFrame.on("change", (event) => {
          const valueLength = event?.value?.length || 0;
          setMaskedNumber("*".repeat(valueLength));
        });

        microformRef.current = microform;
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
  }, [activeStep, token, decodedToken]);

  useEffect(() => {
    if (activeStep !== 1 || !microformRef.current) return;

    const SecurityCodeIFrame = microformRef.current.createField(
      "securityCode",
      {
        placeholder: "CVV",
      }
    );

    SecurityCodeIFrame.load("#securityCode-container");
  }, [activeStep]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      payButtonClicked();
    }
  };

  const payButtonClicked = () => {
    if (!microformRef.current) return;
    setLoading(true);

    microformRef.current.createToken(
      { expirationMonth: expMonth, expirationYear: expYear },
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
    <Box sx={{ maxWidth: 400, mx: "auto", p: 0 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          "& .MuiStepConnector-root": {
            top: 20, // half of the custom icon height (40px)
          },
          "& .MuiStepConnector-line": {
            minHeight: 0,
            marginTop: 0,
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep > index}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    position: "relative",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor:
                      activeStep === index
                        ? "primary.main"
                        : activeStep > index
                        ? "#43A047"
                        : "grey.400",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {index + 1}
                </Box>
              )}
            />
          </Step>
        ))}
      </Stepper>

      <Box
        sx={{
          height: 90,
          background: "#1976d2",
          color: "white",
          borderRadius: 2,
          p: 2,
          mb: 4,
          mt: 4,
        }}
      >
        <Typography variant="body2">
          **** **** **** {maskedNumber.slice(-4)}
        </Typography>
        <Typography variant="body2">
          Expira: {expMonth}/{expYear}
        </Typography>
        <Typography variant="body2">{cardHolder}</Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {activeStep === 0 && (
        <Box
          id="number-container"
          sx={{
            height: 26,
            py: 1,
            px: 1.5,
            border: isNumberFocused ? "2px solid #1976d2" : "1px solid #ccc",
            borderRadius: 1,
          }}
        />
      )}

      {activeStep === 1 && (
        <Box
          id="securityCode-container"
          sx={{
            height: 44,
            px: 1.5,
            border: "1px solid #ccc",
            borderRadius: 1,
          }}
        />
      )}

      {activeStep === 2 && (
        <>
          <TextField
            label="Mes (MM)"
            inputProps={{ inputMode: "numeric", maxLength: 2 }}
            value={expMonth}
            onChange={(e) => setExpMonth(e.target.value.slice(0, 2))}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Año (YYYY)"
            inputProps={{ inputMode: "numeric", maxLength: 4 }}
            value={expYear}
            onChange={(e) => setExpYear(e.target.value.slice(0, 4))}
            fullWidth
          />
        </>
      )}

      {activeStep === 3 && (
        <TextField
          label="Nombre y apellido"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value)}
          fullWidth
        />
      )}

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3, height: 46 }}
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
  );
}

export default function CheckoutPage() {
  return (
    <Box sx={{ p: 2 }}>
      <Microform />
    </Box>
  );
}
