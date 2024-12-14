module.exports = {
  parser: '@typescript-eslint/parser', // Define el parser para TypeScript
  parserOptions: {
    project: 'tsconfig.json', // Path al archivo tsconfig
    tsconfigRootDir: __dirname, // Raíz del proyecto
    sourceType: 'module', // Permite usar import/export
  },
  plugins: [
    '@typescript-eslint/eslint-plugin', // Reglas para TypeScript
    'prettier', // Plugin de Prettier para integrarlo con ESLint
  ],
  extends: [
    'plugin:@typescript-eslint/recommended', // Reglas recomendadas para TypeScript
    'plugin:prettier/recommended', // Integra Prettier con ESLint y desactiva conflictos
  ],
  root: true, // Marca este archivo como raíz para ESLint
  env: {
    node: true, // Entorno Node.js
    jest: true, // Entorno Jest para pruebas
  },
  ignorePatterns: ['.eslintrc.js', 'node_modules/', 'dist/'],
  rules: {
    // Reglas personalizadas
    '@typescript-eslint/interface-name-prefix': 'off', // Desactiva prefijo obligatorio en interfaces
    '@typescript-eslint/explicit-function-return-type': 'off', // No obliga a declarar el tipo de retorno
    '@typescript-eslint/explicit-module-boundary-types': 'off', // No obliga a declarar tipos en módulos
    '@typescript-eslint/no-explicit-any': 'off', // Permite usar `any` (puedes activarlo si prefieres estricta tipificación)
    '@typescript-eslint/no-unused-vars': 'error', // Marca variables no usadas como error
    'prettier/prettier': 'error', // Aplica reglas de Prettier y marca errores si no se cumplen
    'no-console': 'warn', // Da una advertencia si se usa console.log
  },
};
