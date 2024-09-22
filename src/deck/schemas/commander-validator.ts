export function validateCommanderDeck(commander: any, cards: any[]): { valid: boolean; message: string } {
    if (!commander || !cards || cards.length === 0) {
      return { valid: false, message: 'Comandante ou cartas não fornecidos.' };
    }
  
    // Verificar se o número total de cartas é 100 (incluindo o comandante)
    if (cards.length !== 99) {
      return { valid: false, message: 'O deck deve conter exatamente 99 cartas além do comandante.' };
    }
  
    // Verificar identidade de cor do comandante e se todas as cartas estão na identidade de cor
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
      acc[card.name] = (acc[card.name] || 0) + 1;
      return acc;
    }, {});
  
    const duplicateCards = Object.entries(cardCounts).filter(([name, count]) => {
        return (count as number) > 1 && !name.includes('Terreno Básico');
      });
  
    if (duplicateCards.length > 0) {
      return { valid: false, message: `Cartas duplicadas (exceto terrenos básicos): ${duplicateCards.map(([name]) => name).join(', ')}.` };
    }
  
    // Tudo validado com sucesso
    return { valid: true, message: 'Deck válido.' };
  }
  