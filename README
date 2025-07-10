# EKS Node Group Scaler Lambda

Esta Lambda em Node.js escala Auto Scaling Groups (ASGs) usados como Node Groups do Amazon EKS com base em tag `stop=yes` e agendamentos via CloudWatch/EventBridge.

---

## ✅ Pré-requisitos

- AWS CLI configurada com credenciais e região
- Node.js 18+ instalado (recomendo usar `nvm`)
- Serverless Framework v3+ instalado globalmente  
  `npm install -g serverless`
- Permissões AWS para criar Lambda, EventBridge, e roles IAM

---

## 📁 Estrutura do Projeto
```bash
.
├── src/
│ └── handler.js # Código da Lambda
├── package.json
└── serverless.yml # Configuração Serverless
```

---

## 🚀 Deploy passo a passo

### 1. Instale as dependências

`npm install`


### 2. Deploy da função Lambda na AWS

`sls deploy`

Este comando irá:

  - Criar a função Lambda

  - Criar eventos agendados (EventBridge) às 7h e 19h BRT

  - Criar as permissões IAM automaticamente

### 3. Testar a Lambda localmente

`sls invoke local -f scaler --data '{"action":"scaleDown"}'`

### 4. Testar a Lambda diretamente na AWS
Vá até function > test e crie um evento de teste com a seguinte chave

`{"action": "scaleDown"}`

Ou via AWS CLI:
```bash
aws lambda invoke \
  --function-name eks-scaler-dev \
  --payload '{"action":"scaleDown"}' \
  response.json

cat response.json
```
## 🚧 Mudar ou remover o stage

### 1. Passar o stage no deploy

`sls deploy --stage prod`

### 2. Definir stage padrão no serverless.yml

```bash
provider:
  name: aws
  stage: prod
  ...
```

## 🧰 Comandos úteis

Deploy completo

`sls deploy`

Deploy rápido

`sls deploy function -f scaler`

Invocar local

`sls invoke local -f scaler --data ...`

Invocar remoto

`sls invoke -f scaler --data ...`

Remover tudo

`sls remove`