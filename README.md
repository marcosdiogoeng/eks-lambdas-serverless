# Lambdas EKS e RDS

Lambdas EKS e RDS em Node.js com base em tag `stop=yes` e agendamentos via CloudWatch/EventBridge para uso em praticas de FinOps. Realizando o scale UP e Down dos nodes groups do EKS e start e stop de instancias RDS em horarios definidos que não há utilização.
 
---

## ✅ Pré-requisitos (Execução local)

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
│ └── eksScaler.js # Lambda EKS 
│ └── rdsScaler.js # Lambda RDS 
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

`sls invoke -f eksScaler --data '{"action":"scaleDown"}'`

`sls invoke -f rdsScaler --data '{"action":"stop"}'`

### 4. Testar a Lambda diretamente na AWS
Vá até function > test e crie um evento de teste com a seguinte chave

eksScaler

`{"action": "scaleDown"}`

rdsScaler

`'{"action":"stop"}'`

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