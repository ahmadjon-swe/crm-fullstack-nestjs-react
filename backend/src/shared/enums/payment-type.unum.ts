export enum PaymentType {
  DEPOSIT = 'deposit',       // Admin adds money to balance
  CHARGE = 'charge',         // Monthly fee auto-deducted
  REFUND = 'refund',         // Manual refund
}