export interface UsuarioResponseDTO {
  idUsuario?: number;
  username: string;
  nombreapellido: string;
  idRol?: number;
  estado: string;
  intentos?: number;
  fechaUltClave?: Date;
}

export interface UsuarioRequestDTO {
  idUsuario?: number;
  username: string;
  password: string;
  nombreapellido: string;
  idRol: number;
}