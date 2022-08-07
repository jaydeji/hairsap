FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN echo $(ls)
RUN npm run build
EXPOSE 3000/tcp
# ENV Jwt__SecretKey=$Jwt__SecretKey
# ENTRYPOINT ["dotnet", "Payment.Api.dll"]
CMD [ "node", "dist/index.js" ]