# Frontend Vite + Vue — image de développement
FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host pour exposer le serveur de dev hors du conteneur
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
