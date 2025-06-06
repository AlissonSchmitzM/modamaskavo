import {
  situation_order_pending,
  situation_order_cancel,
  situation_order_completed,
  situation_order_in_production,
  situation_order_payment_pending,
  situation_order_payment_completed,
  situation_order_awaiting_shipment,
} from '../../../assets';

export const PENDENTE = {
  description: 'Pendente',
  color: '#FFEE00FF',
  lottie: situation_order_pending,
  lottie_height: 10,
};
export const PAGAMENTO_PENDENTE = {
  description: 'Pagamento Pendente',
  color: '#00F7FFFF',
  lottie: situation_order_payment_pending,
  lottie_height: 20,
};
export const PAGAMENTO_CONCLUIDO = {
  description: 'Pagamento Concluído',
  color: '#0EBBADFF',
  lottie: situation_order_payment_completed,
  lottie_height: 25,
};
export const AGUARDANDO_ENVIO = {
  description: 'Aguardando Envio',
  color: '#3004CFFF',
  lottie: situation_order_awaiting_shipment,
  lottie_height: 15,
};
export const EM_PRODUCAO = {
  description: 'Em Produção',
  color: '#B565FFFF',
  lottie: situation_order_in_production,
  lottie_height: 30,
};
export const CONCLUIDO = {
  description: 'Concluído',
  color: '#15FF00FF',
  lottie: situation_order_completed,
  lottie_height: 15,
};
export const CANCELADO = {
  description: 'Cancelado',
  color: '#D40000FF',
  lottie: situation_order_cancel,
  lottie_height: 12,
};

// Cria um objeto de mapeamento para pesquisa rápida
export const STATUS_MAP = {
  Pendente: PENDENTE,
  'Pagamento Pendente': PAGAMENTO_PENDENTE,
  'Pagamento Concluído': PAGAMENTO_CONCLUIDO,
  'Aguardando Envio': AGUARDANDO_ENVIO,
  'Em Produção': EM_PRODUCAO,
  Concluído: CONCLUIDO,
  Cancelado: CANCELADO,
};

// Função para obter a cor pela descrição
export function getColorByDescription(description) {
  const status = STATUS_MAP[description];
  return status ? status.color : '#CCCCCC';
}

export function getLottieByDescription(description) {
  const status = STATUS_MAP[description];
  return status.lottie;
}

export function getLottieHeightByDescription(description) {
  const status = STATUS_MAP[description];
  return status.lottie_height;
}
