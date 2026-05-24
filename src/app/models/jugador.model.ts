export interface JugadorDTO {
  idJugador?: number;
  idEquipo: number;
  nombre: string;
  posicion: string;
  numeroCamiseta: number;
  fechaNacimiento?: string;
  foto?: string;
  estado: string;
}
