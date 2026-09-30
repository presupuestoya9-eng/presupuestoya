# Trabajar con Presupuestoya desde VS Code

## 1. Instalar lo necesario

- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) (versión LTS)

## 2. Clonar el repositorio

En VS Code: `Ctrl+Shift+P` → **Git: Clone** → pega:

```
https://github.com/presupuestoya9-eng/presupuestoya.git
```

Elige una carpeta y pulsa **Abrir** cuando termine. VS Code te pedirá iniciar sesión en GitHub la primera vez que hagas `push`.

## 3. Extensiones recomendadas

Al abrir la carpeta, VS Code sugerirá instalar las extensiones de `.vscode/extensions.json`. Pulsa **Instalar todo**. La más importante es **Claude Code** (`anthropic.claude-code`): abre el panel de Claude con el icono ✳ de la barra lateral e inicia sesión con tu cuenta de Claude.

## 4. Instalar dependencias y configurar

En la terminal integrada (`Ctrl+ñ` o **Terminal → Nueva terminal**):

```bash
npm install
```

Copia `.env.example` a `.env` y rellena tus valores (por ejemplo `WEBHOOK_URL`). El archivo `.env` no se sube a GitHub.

## 5. Ejecutar la app

Pulsa `F5` y elige una configuración:

- **Iniciar servidor (desarrollo)**: arranca `server.js` con depurador.
- **Iniciar servidor con recarga (nodemon)**: reinicia solo al guardar cambios.

Abre http://localhost:3000 en el navegador.

## 6. Flujo de trabajo con Git

1. Crea una rama: clic en el nombre de la rama (abajo a la izquierda) → **Crear nueva rama**.
2. Haz cambios y guárdalos en la vista **Control de código fuente** (`Ctrl+Shift+G`): escribe un mensaje y pulsa **Confirmar**.
3. Pulsa **Sincronizar / Publicar rama** para subirla a GitHub.
4. Abre un Pull Request desde la extensión de GitHub o desde github.com.

Si trabajas también con Claude Code en la web, haz `git pull` antes de empezar para traer los cambios que Claude haya subido a su rama.
