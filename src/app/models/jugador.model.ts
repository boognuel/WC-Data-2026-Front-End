export interface JugadorDTO {
  idJugador?: number;
  idEquipo: number;
  nombre: string;
  posicion: string;
  numeroCamiseta: number;
  fechaNacimiento?: string | null;
  estado: string;
  foto?: string | null;
}