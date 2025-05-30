import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { jwtDecode } from "jwt-decode";

const myStyles = {
  input: {
    fontSize: "15px",
    lineHeight: "1.5",
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

function Microform() {
  const microformRef = useRef(null);
  const scriptLoaded = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtén el token del query string
    const params = new URLSearchParams(window.location.search);
    const t = params.get("cc");
    if (!t) {
      setError("No se encontró el token de captura (cc) en la URL.");
      return;
    }

    // Decodifica el JWT
    let decoded;
    try {
      decoded = jwtDecode(t);
    } catch (e) {
      setError("El token JWT no es válido.");
      return;
    }

    // Extrae datos del JWT
    const { clientLibrary, clientLibraryIntegrity } = decoded.ctx[0].data;

    // Evita cargar el script más de una vez
    if (!scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = clientLibrary;
      script.async = true;
      if (clientLibraryIntegrity) {
        script.integrity = clientLibraryIntegrity;
        script.crossOrigin = "anonymous";
      }
      script.onload = () => {
        scriptLoaded.current = true;
        if (window.Flex) {
          const flex = new window.Flex(t); // Usa el token completo recibido por URL

          // Microform
          const microform = flex.microform({ styles: myStyles });

          // Campo PAN (número de tarjeta)
          const panField = microform.createField("number", {
            styles: myStyles,
          });
          panField.load("#number-container");

          // Campo CVV
          const cvvField = microform.createField("securityCode", {
            styles: myStyles,
          });
          cvvField.load("#securityCode-container");

          microformRef.current = microform;
        } else {
          setError("No se pudo cargar el cliente Flex de Cybersource.");
        }
      };
      script.onerror = () =>
        setError("No se pudo cargar el script de Microform.");
      document.body.appendChild(script);
    }
    // eslint-disable-next-line
  }, []); // Solo en el primer render

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, minHeight: "100dvh" }}>
      {error && <Box sx={{ color: "red", mb: 2 }}>{error}</Box>}
      <Box
        id="number-container"
        sx={{ backgroundColor: "#f5f5f5", px: 2, mb: 2, borderRadius: 2 }}
      />
      <Box
        id="securityCode-container"
        sx={{ backgroundColor: "#f5f5f5", px: 2, borderRadius: 2 }}
      />
    </Box>
  );
}

export default function CheckoutPage() {
  return <Microform />;
}
