interface ReservationCookie {
  propertyId: string;
  fromDate: string;
  toDate: string;
  guestEmail: string;
  confirmedAt: string;
  reservationId: string;
}

interface StoredReservation {
  reservations: ReservationCookie[];
  lastUpdated: string;
}

const COOKIE_NAME = 'bcn_workstation_reservations';
const COOKIE_EXPIRY_DAYS = 30;

export class ReservationCookies {
  private static getCookieValue(): StoredReservation {
    const cookies = document.cookie.split(';');
    const reservationCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );
    
    if (!reservationCookie) {
      return { reservations: [], lastUpdated: new Date().toISOString() };
    }
    
    try {
      const cookieValue = reservationCookie.split('=')[1];
      const decoded = decodeURIComponent(cookieValue);
      return JSON.parse(decoded);
    } catch (error) {
      console.warn('Failed to parse reservation cookie:', error);
      return { reservations: [], lastUpdated: new Date().toISOString() };
    }
  }

  private static setCookieValue(data: StoredReservation): void {
    const cookieData = JSON.stringify(data);
    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS);
    
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(cookieData)}; expires=${expires.toUTCString()}; path=/; sameSite=strict`;
  }

  static addReservation(reservation: Omit<ReservationCookie, 'confirmedAt' | 'reservationId'>): void {
    const currentData = this.getCookieValue();
    const newReservation: ReservationCookie = {
      ...reservation,
      confirmedAt: new Date().toISOString(),
      reservationId: this.generateReservationId(reservation.propertyId, reservation.fromDate, reservation.toDate, reservation.guestEmail)
    };
    
    // Remove any existing reservation for the same property and dates
    currentData.reservations = currentData.reservations.filter(
      r => !(r.propertyId === reservation.propertyId && 
             r.fromDate === reservation.fromDate && 
             r.toDate === reservation.toDate)
    );
    
    currentData.reservations.push(newReservation);
    currentData.lastUpdated = new Date().toISOString();
    
    this.setCookieValue(currentData);
  }

  static hasReservation(propertyId: string, fromDate: string, toDate: string): ReservationCookie | null {
    const currentData = this.getCookieValue();
    return currentData.reservations.find(
      r => r.propertyId === propertyId && 
           r.fromDate === fromDate && 
           r.toDate === toDate
    ) || null;
  }

  static getAllReservations(): ReservationCookie[] {
    const currentData = this.getCookieValue();
    return currentData.reservations;
  }

  static removeReservation(reservationId: string): void {
    const currentData = this.getCookieValue();
    currentData.reservations = currentData.reservations.filter(r => r.reservationId !== reservationId);
    currentData.lastUpdated = new Date().toISOString();
    this.setCookieValue(currentData);
  }

  static clearAllReservations(): void {
    const emptyData: StoredReservation = { reservations: [], lastUpdated: new Date().toISOString() };
    this.setCookieValue(emptyData);
  }

  static isRecentReservation(propertyId: string, fromDate: string, toDate: string, hours: number = 24): boolean {
    const reservation = this.hasReservation(propertyId, fromDate, toDate);
    if (!reservation) return false;
    
    const confirmationTime = new Date(reservation.confirmedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - confirmationTime.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff <= hours;
  }

  private static generateReservationId(propertyId: string, fromDate: string, toDate: string, email: string): string {
    const data = `${propertyId}-${fromDate}-${toDate}-${email}`;
    return btoa(data).replace(/[+/=]/g, '').substring(0, 12);
  }

  static getReservationSummary(propertyId: string, fromDate: string, toDate: string): {
    hasReservation: boolean;
    isRecent: boolean;
    reservation: ReservationCookie | null;
    email: string | null;
    confirmedAt: string | null;
  } {
    const reservation = this.hasReservation(propertyId, fromDate, toDate);
    return {
      hasReservation: !!reservation,
      isRecent: reservation ? this.isRecentReservation(propertyId, fromDate, toDate) : false,
      reservation,
      email: reservation?.guestEmail || null,
      confirmedAt: reservation?.confirmedAt || null
    };
  }
}
