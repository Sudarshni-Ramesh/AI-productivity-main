import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { SxProps, Theme } from '@mui/system';

const LLMSearch: React.FC = () => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      placeholder="Start typing..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton sx={{
              color: '#4dabf5', // Blueish color for mic button
              '&:hover': {
                backgroundColor: 'rgba(77, 171, 245, 0.1)', // Light blue background on hover
              },
            }}>
              <MicIcon />
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light up on hover
              },
            }}>
              <ArrowForwardIcon />
            </IconButton>
          </InputAdornment>
        ),
        style: {
          backgroundColor: '#333',
          color: 'white',
          borderRadius: '28px', // Increased border radius for more circular shape
          padding: '4px 12px', // Reduced padding to decrease height
          fontSize: '0.875rem', // Optional: Adjust font size if needed
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            border: 'none',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: '1px solid rgba(255, 255, 255, 0.3)', // Add a subtle border on hover
          },
        },
        '& .MuiInputBase-input': {
          color: 'white',
        },
      } as SxProps<Theme>}
    />
  );
};

export default LLMSearch;
