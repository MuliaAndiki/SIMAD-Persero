/**
 * Error khusus aplikasi yang membawa status HTTP.
 * Dipakai oleh service layer untuk menandakan kegagalan bisnis
 * beserta status kode yang seharusnya dikembalikan ke klien.
 * Controller memetakan `AppError` ini ke helper `HttpResponse` dari `@/http`.
 */
export class AppError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}
