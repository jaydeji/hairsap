const baseFare = 260
const pricePerKm = 100

export const getTransportPrice = (distaceInMetres: number) => {
  const distanceinKm = distaceInMetres / 1000
  return (baseFare + distanceinKm * pricePerKm) * 100
}
