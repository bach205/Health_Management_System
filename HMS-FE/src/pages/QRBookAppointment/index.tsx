import React, { useState } from 'react';
import { Button, Card } from 'antd';
import QRBookAppointmentForm from './QRBookAppointmentForm';

const QRBookAppointment: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <style>
        {`
          @media (max-width: 600px) {
            .qr-book-card-wrapper {
              max-width: 100vw !important;
              padding: 0 8px !important;
            }
          }
        `}
      </style>
      <div
        className="flex justify-center items-center min-h-screen bg-gray-50"
      >
        <div className="qr-book-card-wrapper" style={{ width: '100%', maxWidth: 480, margin: '0 auto', padding: 24 }}>
          {!showForm ? (
            <Card className="w-full text-center" style={{ boxSizing: 'border-box' }}>
              <h2 className="text-2xl font-bold mb-4">Đặt lịch khám bằng mã QR</h2>
              <p className="mb-6">Nhấn nút bên dưới để quét mã QR và điền thông tin đặt lịch.</p>
              <Button type="primary" size="large" onClick={() => setShowForm(true)}>
                Quét mã QR
              </Button>
            </Card>
          ) : (
            <QRBookAppointmentForm />
          )}
        </div>
      </div>
    </>
  );
};

export default QRBookAppointment; 