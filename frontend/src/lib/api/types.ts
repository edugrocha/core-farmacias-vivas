export interface Paginacao<T> {
  paginacao: {
    total: number;
    paginas: number;
    pagina_atual: number;
    proxima: string | null;
    anterior: string | null;
  };
  resultados: T[];
}

export type TipoPerfil = "COMUNIDADE" | "ESPECIALISTA" | "ADMIN";

export interface UsuarioSessao {
  id: number;
  nome: string;
  email: string;
  tipo_perfil: TipoPerfil;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telefone: string;
  instituicao: string;
  tipo_perfil: TipoPerfil;
  foto_perfil: string | null;
  is_active: boolean;
  date_joined: string;
}

export interface FamiliaBotanica {
  id: number;
  nome: string;
  descricao: string;
}

export type NivelToxicidade =
  | "SEGURA"
  | "ATENCAO"
  | "RESTRITA"
  | "CONTRAINDICADA";

export type StatusCuracao = "RASCUNHO" | "EM_REVISAO" | "PUBLICADO" | "ARQUIVADO";

export interface Planta {
  id: number;
  nome_popular: string;
  outros_nomes: string;
  nome_cientifico: string;
  familia: FamiliaBotanica | number;
  familia_nome?: string;
  descricao: string;
  parte_utilizada: string;
  usos_terapeuticos: string;
  modo_preparo: string;
  contraindicacoes: string;
  interacoes_medicamentosas: string;
  nivel_toxicidade: NivelToxicidade;
  nivel_toxicidade_display?: string;
  regiao_ocorrencia: string;
  origem: string;
  foto_principal: string | null;
  status?: StatusCuracao;
  curado_por?: number | null;
  curado_por_nome?: string;
  data_curadoria?: string | null;
  referencias_bibliograficas?: string;
  registro_anvisa?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Instituicao {
  id: number;
  nome: string;
  tipo: string;
  site: string;
  email_contato: string;
  telefone: string;
}

export type StatusHorto = "ATIVO" | "INATIVO" | "MANUTENCAO";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface Horto {
  id: number;
  nome: string;
  descricao: string;
  instituicao: number;
  instituicao_nome?: string;
  responsavel: number | null;
  responsavel_nome?: string;
  logradouro: string;
  municipio: string;
  uf: string;
  cep: string;
  localizacao: GeoPoint;
  status: StatusHorto;
  foto: string | null;
  horario_funcionamento: string;
  created_at?: string;
  updated_at?: string;
}

export interface HortoFeature {
  type: "Feature";
  geometry: GeoPoint;
  properties: {
    id: number;
    nome: string;
    descricao: string;
    instituicao_nome: string;
    municipio: string;
    uf: string;
    logradouro: string;
    status: StatusHorto;
    horario_funcionamento: string;
    foto: string | null;
    distancia_km: number | null;
  };
}

export interface HortosProximosResponse {
  type: "FeatureCollection";
  total: number;
  origem: { lat: number; lon: number };
  nota: string;
  features: HortoFeature[];
}

export type Disponibilidade =
  | "ABUNDANTE"
  | "DISPONIVEL"
  | "ESCASSA"
  | "INDISPONIVEL";

export interface ItemInventario {
  id: number;
  horto: number;
  horto_nome?: string;
  horto_municipio?: string;
  planta: number;
  planta_nome?: string;
  planta_cientifico?: string;
  disponibilidade: Disponibilidade;
  disponibilidade_display?: string;
  quantidade_estimada: number | null;
  observacoes: string;
  atualizado_por_nome?: string;
  updated_at?: string;
}
