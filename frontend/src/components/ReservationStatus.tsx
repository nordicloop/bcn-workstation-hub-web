import { useState } from 'react';
import { ReservationCookies } from '../utils/ReservationCookies';

interface ReservationStatusProps {
  propertyId: string;
  fromDate: Date | null;
  toDate: Date | null;
  onCancel?: () => void;
}

export function ReservationStatus({ propertyId, fromDate, toDate, onCancel }: ReservationStatusProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  if (!fromDate || !toDate) {
    return null;
  }

  const fromDateStr = fromDate.toISOString().split('T')[0];
  const toDateStr = toDate.toISOString().split('T')[0];
  const reservationInfo = ReservationCookies.getReservationSummary(propertyId, fromDateStr, toDateStr);

  const handleCancelBooking = () => {
    setIsCancelling(true);
    try {
      // Get the reservation to get its ID
      const reservation = ReservationCookies.hasReservation(propertyId, fromDateStr, toDateStr);
      if (reservation) {
        // Remove the reservation from cookies using the reservation ID
        ReservationCookies.removeReservation(reservation.reservationId);
      }
      setShowCancelConfirm(false);
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (reservationInfo.hasReservation && reservationInfo.isRecent) {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 mb-1">Booking Requested</h3>
            <p className="text-sm text-green-700 mb-1">
              You already requested a booking for this property for the selected dates.
            </p>
            <p className="text-xs text-green-600">
              Confirmation sent to: {reservationInfo.email}
            </p>
            <p className="text-xs text-green-600">
              Confirmed on: {new Date(reservationInfo.confirmedAt!).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-green-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Cancel booking"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {showCancelConfirm && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-3">
              Are you sure you want to cancel this booking request? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Booking
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (reservationInfo.hasReservation && !reservationInfo.isRecent) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Previous Booking</h3>
            <p className="text-sm text-yellow-700 mb-1">
              You previously requested a booking for this property for these dates.
            </p>
            <p className="text-xs text-yellow-600">
              Previous booking: {new Date(reservationInfo.confirmedAt!).toLocaleDateString()}
            </p>
          </div>
          <div className="text-yellow-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
