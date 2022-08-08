# Hairsap

## Running for the first time 
### Docker
docker-compose up
### Local
create a .env file from the .env.example file and fill values without quotes
npm install
npm run prepare
npx prisma migrate dev --name init
npx prisma db seed

## Database migration
When you make changes to the  prisma schema, you need to run a migration.
npx prisma migrate dev --name <migration_name>
To clear the database and reseed
npx prisma migrate reset -f
To deploy to prod
npx prisma migrate deploy --skip-generate

## Endpoint authorization

The project JWT tokens. Auth protected endpoints expect a token to be passed into the `Authorization` header according to the following format:

`Authorization: Bearer <jwt>`

If the header is missing, incorrect or the JWT cannot be correctly decoded, the authorizer will reject the request with an appropriate error.

A JWT payload can be created for development testing using the debugger tool at https://jwt.io/ - ensure you paste the correct secret string in when creating the JWT.


## Documentation
Add swagger documentation for new models and routes in swagger.yml file in the docs folder
The swagger docs are hosted on /reference

## Logging
Avoid using console. Use the npm package debug logger instead

## CI / CD


## Notes
After installing a package in dev, run docker compose up --build
Generate uuid with uuidgen on linux shell
You must wrap your express handlers with ```ah```(express-async-handler) in order for errors to be handled properly
All balances are held as `integers` not `floats`, so $100.95 would be held as `10095` in any transaction amount or balance fields.