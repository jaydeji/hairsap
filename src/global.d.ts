declare module '*.yml'
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string
  }
}
