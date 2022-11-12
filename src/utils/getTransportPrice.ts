const baseFare = 300
const pricePerKm = 175

export const getTransportPrice = (distaceInMetres: number): number => {
  const amount = (baseFare + (distaceInMetres / 1000) * pricePerKm) * 100
  return Math.floor(amount)
}
