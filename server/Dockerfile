# Usa una imagen oficial de Node.js
FROM node:20

# Crea un directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente
COPY . .

# Compila el código TypeScript
RUN npm run build

# Expone el puerto 3000
EXPOSE 3000

# Comando para ejecutar la app
CMD ["npm", "run", "start:prod"]
