export function validateCommanderDeck(commander: any, cards: any[]): { valid: boolean; message: string } {
  if (!commander || !cards || cards.length === 0) {
    return { valid: false, message: 'Comandante ou cartas não fornecidos.' };
  }

  console.log('Número de cartas:', cards.length);

  // Verifica se o número total de cartas é 99 (excluindo o comandante)
  if (cards.length < 1 || cards.length > 99) {
    return { valid: false, message: 'O deck deve conter entre 1 e 99 cartas além do comandante.' };
  }

/*=================== PARA TESTAR CRIAR UM DECK PELO JSON, COM MENOS CARTAS ======================

 if (cards.length < 1 || cards.length > 99) {
    return { valid: false, message: 'O deck deve conter entre 1 e 99 cartas além do comandante.' };
  }


if (cards.length !== 99) {
    return { valid: false, message: 'O deck deve conter exatamente 99 cartas além do comandante.' };
  }


  substitua acima "verifica se o numero total de cartatas é 100"
*/

  // Verificar identidade de cor do comandante
  const commanderColors = commander.color_identity || [];
  const invalidCards = cards.filter(card => {
    const cardColors = card.color_identity || [];
    return !cardColors.every(color => commanderColors.includes(color));
  });

  if (invalidCards.length > 0) {
    return { valid: false, message: `Cartas fora da identidade de cor do comandante: ${invalidCards.map(card => card.name).join(', ')}.` };
  }

  // Verificar se todas as cartas (exceto terrenos básicos) têm apenas uma cópia
  const cardCounts = cards.reduce((acc, card) => {
    if (!card.name) {
      console.warn('Carta sem nome encontrada:', card);
      return acc; // Ignora cartas sem nome
    }
    acc[card.name] = (acc[card.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Contagem de cartas:', cardCounts);

  const duplicateCards = Object.entries(cardCounts).filter(([name, count]) => {
    return (count as number) > 1 &&
      !['plains', 'island', 'swamp', 'mountain', 'forest'].some(terrain => name.toLowerCase().includes(terrain));
  });

  if (duplicateCards.length > 0) {
    return { valid: false, message: `Cartas duplicadas (exceto terrenos básicos): ${duplicateCards.map(([name]) => name).join(', ')}.` };
  }

  // Tudo validado com sucesso
  return { valid: true, message: 'Deck válido.' };
}
