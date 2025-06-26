import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";

export function useMicroform(steps, myStyles, cardImages) {
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
  const [cvvError, setCvvError] = useState(null);
  const [cvvIsValid, setCvvIsValid] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [expError, setExpError] = useState(null);
  const [activeCardType, setActiveCardType] = useState("");

  const handleExpDateChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2, 4);
    if (value.length > 5) value = value.slice(0, 5);
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
    let decoded;
    try {
      decoded = jwtDecode(t);
    } catch {
      setError("El capture-context no es válido.");
      return;
    }
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
    script.type = "text/javascript";
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

        const panField = microform.createField("number", {});
        panField.load("#number-container");
        panField.on("focus", () => setIsNumberFocused(true));
        panField.on("blur", () => setIsNumberFocused(false));
        panField.on("change", (event) => {
          setPanError(null);
          setPanIsEmpty(event.empty);
          setCardIsValid(event.valid);
          const detectedType = event.card?.[0]?.name;
          setActiveCardType(cardImages[detectedType] ? detectedType : "");
        });

        const cvvField = microform.createField("securityCode", {});
        cvvField.load("#securityCode-container");
        cvvField.on("focus", () => setIsCvvFocused(true));
        cvvField.on("blur", () => setIsCvvFocused(false));
        cvvField.on("change", (event) => {
          setCvvIsValid(event.valid);
          setCvvIsEmpty(event.empty);
          setCvvError(null);
        });

        microformRef.current = microform;
        setMicroformInitialized(true);
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

    return () => {
      document.head.removeChild(script);
    };
  }, [token, decodedToken, microformInitialized, cardImages, myStyles]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (panIsEmpty) {
        setPanError("Campo obligatorio*");
        return;
      }
      if (!cardIsValid) {
        setPanError("El número de la tarjeta no es válido");
        return;
      }
      setPanError(null);
    }

    if (activeStep === 1) {
      let expHasError = false;
      let cvvHasError = false;

      const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expDate || expDate.trim() === "") {
        setExpError("Campo obligatorio*");
        expHasError = true;
      } else {
        const [mm, aa] = expDate.split("/");
        if (mm && (parseInt(mm, 10) < 1 || parseInt(mm, 10) > 12)) {
          setExpError("El mes debe ser entre 01 y 12");
          expHasError = true;
        } else if (!regex.test(expDate)) {
          setExpError("La fecha debe ser MM/AA");
          expHasError = true;
        } else {
          const year = parseInt("20" + aa, 10);
          const month = parseInt(mm, 10) - 1;
          const now = new Date();
          const exp = new Date(year, month + 1, 0);
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
      if (expHasError || cvvHasError) return;
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
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
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
          setError(err.message || "Error creando token");
        } else {
          alert("Token generado – revisa la consola");
        }
      }
    );
  };

  return {
    loading,
    error,
    expDate,
    handleExpDateChange,
    isExpFocused,
    setIsExpFocused,
    cardHolder,
    setCardHolder,
    isNameFocused,
    setIsNameFocused,
    panIsEmpty,
    panError,
    setPanError,
    cardIsValid,
    setCardIsValid,
    activeStep,
    setActiveStep,
    isNumberFocused,
    setIsNumberFocused,
    handleNext,
    handleBack,
    steps,
    cvvError,
    setCvvError,
    isCvvFocused,
    setIsCvvFocused,
    cvvIsEmpty,
    setCvvIsEmpty,
    cvvIsValid,
    setCvvIsValid,
    nameError,
    setNameError,
    expError,
    setExpError,
    activeCardType,
    setActiveCardType,
    payButtonClicked,
  };
}
