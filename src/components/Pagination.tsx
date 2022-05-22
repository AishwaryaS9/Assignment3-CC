import { Box } from '@mui/material';
import React from 'react';

const Pagenumbers = ({ onClick, index }: any) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        padding: "10px",
        margin: '0 4px',
        width: '30px',
        height: '30px',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--indigo)',
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: 'var(--indigo-dark)',
          opacity: [0.7, 0.8, 0.7],
        },
      }}
    >{index}</Box>
  );
};

export default Pagenumbers;