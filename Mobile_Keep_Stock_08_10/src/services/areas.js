import { criarCrud } from './crudBase';
import { filtrarPorTermo, toInt } from './helpers';
import { Validator } from './validator';

// ROTAS DE ÁREAS DE ESTOQUE
// Espelha /areas e /area/salvar, /area/atualizar e /area/excluir do sistema web

export const areasCrud = criarCrud('areas_estoque', 'id_area');

// Normaliza os campos vindos do formulário (espelha get_area_form)
export function montarArea(dados) {
  return {
    nome: (dados.nome || '').trim(),
    descricao: (dados.descricao || '').trim(),
    area_rua: (dados.area_rua || '').trim(),
    area_codigo: (dados.area_codigo || '').trim(),
    distancia_entre_prat: (dados.distancia_entre_prat || '').trim(),
    temperatura_max: toInt(dados.temperatura_max),
    temperatura_min: toInt(dados.temperatura_min),
  };
}

// Espelha Area.validate()
export function validarArea(area) {
  const erros = [
    Validator.required(area.nome, 'nome'),
    Validator.required(area.area_rua, 'rua da área'),
    Validator.required(area.area_codigo, 'código da área'),
    Validator.required(area.distancia_entre_prat, 'distância entre prateleiras'),
    Validator.required(area.temperatura_max, 'temperatura máxima'),
    Validator.required(area.temperatura_min, 'temperatura mínima'),
  ];

  return erros.filter(Boolean);
}

export async function listarAreas(termo = '') {
  const areas = await areasCrud.findAll();

  return filtrarPorTermo(areas, termo, [
    'nome',
    'descricao',
    'area_rua',
    'area_codigo',
  ]);
}

export async function buscarArea(id) {
  return areasCrud.findById(id);
}

export async function salvarArea(dados) {
  const area = montarArea(dados);

  return areasCrud.insert(area);
}

export async function atualizarArea(id, dados) {
  const area = montarArea(dados);
  const erros = validarArea(area);

  if (erros.length) throw new Error(erros.join(' '));

  if (!(await areasCrud.findById(id))) {
    throw new Error('Área do estoque não encontrada.');
  }

  return areasCrud.update(id, area);
}

// Espelha Area.safe_delete()
export async function excluirArea(id) {
  if (!(await areasCrud.findById(id))) {
    throw new Error('Área não encontrada.');
  }

  await areasCrud.delete(id);
}
