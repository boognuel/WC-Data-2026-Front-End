export interface PartidoDTO {
  idPartido?: number;
  idEquipoLocal: number;
  idEquipoVisitante: number;
  fase: string;
  golesLocal?: number | null;
  golesVisitante?: number | null;
  fechaHora?: Date | null;
  estado: string;
}