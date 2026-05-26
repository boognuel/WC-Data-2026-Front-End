export interface ParametroDTO {
  idParametro?: number;
  descripcion: string;
  valorTexto: string;
  valorNumero?: number | null;
  fechaInicial?: Date | null;
  fechaFinal?: Date | null;
  estado: string;
}