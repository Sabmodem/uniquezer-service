FROM node:lts-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm install --ignore-scripts
COPY . ./

ARG NUXT_PUBLIC_GTAG_ID
ARG NUXT_PUBLIC_YANDEX_METRIKA_ID
ENV NUXT_PUBLIC_GTAG_ID=$NUXT_PUBLIC_GTAG_ID
ENV NUXT_PUBLIC_YANDEX_METRIKA_ID=$NUXT_PUBLIC_YANDEX_METRIKA_ID

RUN npm run prepare
RUN npm run build

FROM node:lts-alpine
WORKDIR /app
COPY --from=build /app/.output/ ./
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080
CMD ["node", "/app/server/index.mjs"]