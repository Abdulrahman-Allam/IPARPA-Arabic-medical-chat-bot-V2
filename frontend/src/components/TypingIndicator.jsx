import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';

// Define typing animation
const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
`;

const TypingIndicator = () => {
  return (
    <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', height: 20 }}>
      {[0, 1, 2].map((dot) => (
        <Box
          key={dot}
          sx={{
            width: 6,
            height: 6,
            backgroundColor: 'grey.500',
            borderRadius: '50%',
            animation: `${bounce} 1.4s ease-in-out infinite`,
            animationDelay: `${dot * 0.16}s`,
          }}
        />
      ))}
    </Box>
  );
};

export default TypingIndicator;
