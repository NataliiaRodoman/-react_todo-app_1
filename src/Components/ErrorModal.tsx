/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect } from 'react';
import { ErrorMessage } from '../types/Constants';

interface Props {
  onClose: () => void;
  error: string;
  onErrorChange: (error: ErrorMessage | null) => void;
}

export const ErrorModal: React.FC<Props> = ({ onClose, error, onErrorChange }) => {
  useEffect(() => {
    const hideNotification = setTimeout(() => {
      onErrorChange(null);
    }, 3000);

    return () => clearTimeout(hideNotification);
  }, [error]);

  return (
    <div className="notification is-danger is-light has-text-weight-normal">
      <button
        type="button"
        className="delete"
        onClick={onClose}
      />
      {error}
    </div>
  );
};
