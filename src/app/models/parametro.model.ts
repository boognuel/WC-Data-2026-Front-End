export interface ParametroDTO {
  idParametro?: number;
  descripcion: string;
  valorTexto: string;
  valorNumero?: number | null;
  fechaInicial?: string;
  fechaFinal?: string;
  estado: string;
}