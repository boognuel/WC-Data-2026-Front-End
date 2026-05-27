export interface AuditoriaDTO {
  idLog: number;
  idUsuario: number | null;
  accion: string;
  tablaAfectada: string;
  idRegistroAfectado: number | null;
  fechaHora: string;
  ipCliente: string | null;
}
