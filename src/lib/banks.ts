export const BRAZILIAN_BANKS = [
  { code: '001', name: 'Banco do Brasil S.A.' },
  { code: '033', name: 'Banco Santander (Brasil) S.A.' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Banco Bradesco S.A.' },
  { code: '341', name: 'Itaú Unibanco S.A.' },
  { code: '077', name: 'Banco Inter S.A.' },
  { code: '260', name: 'Nu Pagamentos S.A. (Nubank)' },
  { code: '336', name: 'Banco C6 S.A.' },
  { code: '290', name: 'Pagseguro Internet S.A.' },
  { code: '323', name: 'Mercado Pago' },
  { code: '212', name: 'Banco Original S.A.' },
  { code: '389', name: 'Banco Mercantil do Brasil S.A.' },
  { code: '041', name: 'Banco do Estado do Rio Grande do Sul S.A.' },
  { code: '748', name: 'Banco Cooperativo Sicredi S.A.' },
  { code: '756', name: 'Banco Cooperativo do Brasil S.A. - Bancoob' },
  { code: '422', name: 'Banco Safra S.A.' },
  { code: '655', name: 'Banco Votorantim S.A.' },
  { code: '633', name: 'Banco Rendimento S.A.' },
  { code: '218', name: 'Banco BS2 S.A.' },
  { code: '246', name: 'Banco ABC Brasil S.A.' },
  { code: '626', name: 'Banco C6 Consignado S.A.' },
  { code: '070', name: 'BRB - Banco de Brasília S.A.' },
  { code: '136', name: 'Unicred Cooperativa' },
  { code: '741', name: 'Banco Ribeirão Preto S.A.' },
  { code: '739', name: 'Banco Cetelem S.A.' },
  { code: '743', name: 'Banco Semear S.A.' },
  { code: '100', name: 'Planner Corretora de Valores S.A.' },
  { code: '096', name: 'Banco B3 S.A.' },
  { code: '747', name: 'Banco Rabobank International Brasil S.A.' },
  { code: '249', name: 'Banco Investcred Unibanco S.A.' },
].sort((a, b) => a.name.localeCompare(b.name))

export function searchBanks(query: string) {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) {
    return BRAZILIAN_BANKS
  }
  
  return BRAZILIAN_BANKS.filter(bank => {
    const fullText = `${bank.code} ${bank.name}`.toLowerCase()
    return fullText.includes(normalizedQuery)
  })
}

export function formatBankDisplay(bank: { code: string; name: string }) {
  return `${bank.code} - ${bank.name}`
}
