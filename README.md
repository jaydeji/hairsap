# Hairsap :haircut:

## Running for the first time

create a .env file from the `.env.example` file and fill values without quotes

```
docker-compose up -d
npm install
npm run prepare
npm run prisma:generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Database migration

When you make changes to the prisma schema, you need to run a migration.\
`npx prisma migrate dev --name <migration_name>`\
To clear the database and reseed \
`npx migrate reset -f` \
To seed \
`npx prisma db seed` or `npx prisma db seed ./seed.js`\
To deploy to prod\
`npx prisma migrate deploy --skip-generate`

## Endpoint authorization

The project JWT tokens. Auth protected endpoints expect a token to be passed into the `Authorization` header according to the following format:

`Authorization: Bearer <jwt>`

If the header is missing, incorrect or the JWT cannot be correctly decoded, the authorizer will reject the request with an appropriate error.

A JWT payload can be created for development testing using the debugger tool at https://jwt.io/ - ensure you paste the correct secret string in when creating the JWT.

## Documentation

Add swagger documentation for new models and routes in swagger.yml file in the docs folder.
The swagger docs are hosted on /reference

## Logging

Avoid using console. Use the npm package debug logger instead

## CI / CD

We will make use of the **Docker.prod** and **docker-compose.prod.yml** files

## Notes

- After installing a package in dev, run `docker compose up --build`
- Generate uuid with uuidgen on linux shell
- You must wrap your express handlers with `ah`_(express-async-handler)_ in order for errors to be handled properly
- All balances are held as `integers` not `floats`, so $100.95 would be held as `10095` in any transaction amount or balance fields.
- Raw queries syntax hishlighting from prisma have wierd behaaviours for now
