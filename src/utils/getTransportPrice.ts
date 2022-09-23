const baseFare = 260
const pricePerKm = 100

export const getTransportPrice = (distaceInMetres: number): number => {
  const distanceinKm = distaceInMetres / 1000
  const amount = (baseFare + distanceinKm * pricePerKm) * 100
  return parseFloat(
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(amount),
  )
}
