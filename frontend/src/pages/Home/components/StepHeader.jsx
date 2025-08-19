import React from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel } from '@mui/material';

const StepHeader = ({ steps, activeStep }) => (
  <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  </Paper>
);

export default StepHeader;
