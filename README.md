# Moda Maskavo

📱 **Aplicativo de Moda e Estilo em React Native**

Um app desenvolvido em **React Native** para pedidos de peças exclusívas e uniformes da Maskavo!

<p align="center">
  <img src=".github/screenshot1.jpeg" width="200" />
  <img src=".github/screenshot2.jpeg" width="200" />
  <img src=".github/screenshot3.jpeg" width="200" />
  <img src=".github/screenshot4.jpeg" width="200" />
  <img src=".github/screenshot5.jpeg" width="200" />
  <img src=".github/screenshot6.jpeg" width="200" />
  <img src=".github/screenshot7.jpeg" width="200" />
</p>

---

## 🛠️ Tecnologias Usadas

- **Framework**: React Native
- **Gerenciamento de Estado**: Redux (+ Redux Toolkit)
- **Navegação**: React Navigation
- **Estilização**: Styled Components
- **Autenticação**: Firebase Auth
- **Banco de Dados**: Firestore

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js v18+
- Yarn ou npm
- Android Studio (para Android) ou Xcode (para iOS)
- Conta no [Firebase Console](https://console.firebase.google.com/)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/AlissonSchmitzM/modamaskavo.git
   cd modamaskavo
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o Firebase:
   Crie um projeto no Firebase e ative Auth e Firestore.
   Copie suas credenciais para `src/services/FirebaseService.js`.
   Ative a autenticação com o Google e copie para `src/components/SplashScreen.js`.

4. Inicie o app:

```sh
npx react-native run-android  # Android
# ou
npx react-native run-ios     # iOS
```

## 📂 Estrutura do Projeto

```text
src/
├── assets/            # JSON de arquivos Lotties
├── components/        # Telas do app
│   └── common/        # Componentes reutilizáveis
├── imgs/              # Imagens e Icones
├── services/          # Lógica de API/Firebase e Assas Pagamentos
├── store/             # Arquivos do Redux
│   ├── actions/       # Ações redux
│   ├── reducers/      # Atualização de estados redux
│   └── index.js       # Configuração da store
├── styles/            # Estilos globais
└── utils/             # Funções auxiliares
```

## 🔧 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit suas mudanças: `git commit -m "feat: nova funcionalidade"`
4. Envie para o repositório remoto: `git push origin minha-feature`
5. Abra um Pull Request no GitHub

Desenvolvido por [Alisson Schmitz](https://github.com/AlissonSchmitzM)
