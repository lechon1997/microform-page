import React from "react";
import { Box, Alert } from "@mui/material";
import { CreditCardPreview } from "./CreditCardPreview";
import { StepNumber } from "./StepNumber";
import { StepExpCvv } from "./StepExpCvv";
import { StepName } from "./StepName";
import { StepButtons } from "./StepButtons";
import { useMicroform } from "./useMicroform";

const steps = ["Número", "Código + Expiración", "Nombre"];
const cardImages = {
  visa: "./visa.png",
  mastercard: "./mastercard.png",
  amex: "./amex.png",
  maestro: "./maestro.png",
  discover: "./discover.png",
  dinersclub: "./dinersclub.png",
  jcb: "./jcb.png",
};
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

export default function Microform() {
  
  const microform = useMicroform(steps, myStyles, cardImages);

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        p: 0,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <CreditCardPreview
          cardImages={cardImages}
          activeCardType={microform.activeCardType}
          cardHolder={microform.cardHolder}
          expDate={microform.expDate}
        />

        {microform.error && (
          <Alert sx={{ mb: 2 }} severity="error">
            {microform.error}
          </Alert>
        )}

        <Box sx={{ position: "relative", height: 100, mb: 2 }}>
          <StepNumber
            panError={microform.panError}
            panIsEmpty={microform.panIsEmpty}
            isNumberFocused={microform.isNumberFocused}
            activeStep={microform.activeStep}
          />
          <StepExpCvv
            activeStep={microform.activeStep}
            expDate={microform.expDate}
            handleExpDateChange={microform.handleExpDateChange}
            expError={microform.expError}
            isExpFocused={microform.isExpFocused}
            setIsExpFocused={microform.setIsExpFocused}
            cvvError={microform.cvvError}
            isCvvFocused={microform.isCvvFocused}
            setIsCvvFocused={microform.setIsCvvFocused}
            cvvIsEmpty={microform.cvvIsEmpty}
          />
          <StepName
            cardHolder={microform.cardHolder}
            setCardHolder={microform.setCardHolder}
            nameError={microform.nameError}
            isNameFocused={microform.isNameFocused}
            setIsNameFocused={microform.setIsNameFocused}
            activeStep={microform.activeStep}
          />
        </Box>
      </Box>
      
      <StepButtons
        activeStep={microform.activeStep}
        steps={steps}
        loading={microform.loading}
        handleBack={microform.handleBack}
        handleNext={microform.handleNext}
      />
    </Box>
  );
}
