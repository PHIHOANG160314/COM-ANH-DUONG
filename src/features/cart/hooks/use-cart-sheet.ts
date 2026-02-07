import { useState } from 'react';

/**
 * Simple hook for managing cart sheet state
 * Usage:
 *   const { isOpen, open, close } = useCartSheet();
 *   <CartSheet open={isOpen} onClose={close} />
 */
export const useCartSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, open, close };
};
