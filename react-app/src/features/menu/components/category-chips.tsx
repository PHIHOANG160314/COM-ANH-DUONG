import { Box, Chip } from '@mui/material';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export const CategoryChips = ({ categories, selectedCategory, onCategorySelect }: CategoryChipsProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        pb: 2,
        mb: 2,
        // Hide scrollbar but keep scroll functionality
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none', // Firefox
        // Smooth scroll behavior
        scrollBehavior: 'smooth',
        // Enable momentum scrolling on iOS
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* All categories chip */}
      <Chip
        label="Tất cả"
        onClick={() => onCategorySelect('all')}
        color={selectedCategory === 'all' ? 'primary' : 'default'}
        sx={{
          minWidth: 80,
          height: 44, // Touch target
          fontSize: '0.9rem',
          fontWeight: selectedCategory === 'all' ? 'bold' : 'normal',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: selectedCategory === 'all' ? 'primary.dark' : 'action.hover',
          },
        }}
      />

      {/* Category chips */}
      {categories.map((category) => (
        <Chip
          key={category}
          label={category}
          onClick={() => onCategorySelect(category)}
          color={selectedCategory === category ? 'primary' : 'default'}
          sx={{
            minWidth: 80,
            height: 44, // Touch target
            fontSize: '0.9rem',
            fontWeight: selectedCategory === category ? 'bold' : 'normal',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: selectedCategory === category ? 'primary.dark' : 'action.hover',
            },
          }}
        />
      ))}
    </Box>
  );
};
