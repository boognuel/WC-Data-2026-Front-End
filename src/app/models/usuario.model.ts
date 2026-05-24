export interface UsuarioRequest {
  idUsuario?: number;
  username: string;
  password: string;
  nombreapellido?: string;
  idRol?: number;
}

export interface UsuarioResponse {
  idUsuario: number;
  username: string;
  nombreapellido: string;
  idRol: number;
  estado: string;
  intentos: number;
  fechaUltClave: string;
}
