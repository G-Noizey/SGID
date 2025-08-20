import React from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel } from '@mui/material';

const StepHeader = ({ steps, activeStep }) => (
  <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        '& .MuiStepIcon-root': {
          color: '#4caf50',          // color de los círculos no activos
        },
        '& .MuiStepIcon-root.Mui-active': {
          color: '#388e3c',          // color del círculo activo
        },
        '& .MuiStepIcon-root.Mui-completed': {
          color: '#2e7d32',          // color de los pasos completados
        },
        '& .MuiStepLabel-label': {
          color: '#2e7d32',          // color del texto de cada paso
        }
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  </Paper>
);

export default StepHeader;
