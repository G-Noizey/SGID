import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const eventTypes = [
  { value: "boda", label: "Boda" },
  { value: "cumpleaños", label: "Cumpleaños" },
  { value: "baby-shower", label: "Baby Shower" },
  { value: "graduacion", label: "Graduación" },
  { value: "corporativo", label: "Evento Corporativo" },
  { value: "otro", label: "Otro" }
];

const EventTypeSelect = ({ value, onChange }) => (
  <FormControl fullWidth variant="outlined">
    <InputLabel>Tipo de Evento</InputLabel>
    <Select
      value={value}
      onChange={onChange}
      name="tipo"
      required
      label="Tipo de Evento"
    >
      {eventTypes.map((type) => (
        <MenuItem key={type.value} value={type.value}>
          {type.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default EventTypeSelect;