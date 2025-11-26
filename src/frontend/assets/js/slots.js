const slotSymbols = ["💎", "🍉", "🍋", "⭐", "7️⃣", "🍀", "🛡️"];

const pickRandomSymbol = () => {
  const index = Math.floor(Math.random() * slotSymbols.length);
  return slotSymbols[index];
};

const spinSlotRow = (rowElement) => {
  if (!rowElement) {
    return;
  }

  const cells = Array.from(rowElement.querySelectorAll("[data-slot-cell]"));
  if (cells.length === 0) {
    return;
  }

  cells.forEach((cell, index) => {
    setTimeout(() => {
      cell.textContent = pickRandomSymbol();
    }, 80 * index);
  });
};

const setupSlots = () => {
  const container = document.querySelector("[data-slot-row]");
  if (!container) {
    return;
  }

  spinSlotRow(container);

  const spinButton = document.querySelector("[data-slot-spin]");
  if (spinButton) {
    spinButton.addEventListener("click", () => {
      spinSlotRow(container);
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setupSlots();
});