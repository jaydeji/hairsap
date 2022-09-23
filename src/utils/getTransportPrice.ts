const baseFare = 260
const pricePerKm = 100 / 1000

export const getTransportPrice = (distaceInMetres: number): number => {
  const amount = (baseFare + distaceInMetres * pricePerKm) * 100
  return Math.floor(amount)
}
