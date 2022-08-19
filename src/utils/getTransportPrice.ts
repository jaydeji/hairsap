export const getTransportPrice = (distaceInMetres: number) => {
  return Math.round(distaceInMetres) * 100
}
