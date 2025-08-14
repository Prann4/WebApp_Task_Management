import React from 'react';

interface CheckmarkIconProps {
  completed: boolean;
  onClick: () => void;
}

const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({ completed, onClick }) => {
  // Menangani klik via keyboard (Enter atau Spasi) untuk aksesibilitas
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button" // Menambahkan peran sebagai tombol untuk screen reader
      tabIndex={0} // Membuat elemen ini bisa difokusus dengan keyboard
      style={{
        cursor: 'pointer',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: `2px solid ${completed ? '#28a745' : '#ced4da'}`, // Hijau jika selesai, abu-abu jika belum
        backgroundColor: completed ? '#28a745' : 'transparent', // Latar belakang hijau jika selesai
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {completed && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.3334 4L6.00008 11.3333L2.66675 8"
            stroke="white" // Ceklis berwarna putih
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};

export default CheckmarkIcon;
