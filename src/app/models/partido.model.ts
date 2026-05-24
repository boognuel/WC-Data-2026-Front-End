export interface PartidoDTO {
  idPartido?: number;
  idEquipoLocal: number;
  idEquipoVisitante: number;
  fase: string;
  golesLocal?: number | null;
  golesVisitante?: number | null;
  fechaHora?: string;
  estado: string;
}