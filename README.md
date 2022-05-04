## NLW Return Terceiro dia Criando backend

> Setup ----------

npm init -y
npm i typescript @types/node ts-node-dev -D

npx tsc --init

tsconfig.json

```json

"target": "es2020"
```

> Criamos uma pasta na raiz src

dentro dela src/server.ts

```tsx
const server = 1;
```

tsconfig.json

```tsx
rootDir: src;
outDir: dist;
```

rodamos npx tsc

> Setup ts-node-dev

packege.json

```tsx

script: {
  "dev": " ts-node-dev src/server.ts"
}

```

npm run dev

> Configurando Express

npm i express
npm i @types/express

importamos o express
server.ts
configurando o express

```tsx
const app = express();

const port = 3333;
app.listen(port, () => {
  console.log("Http server running" + port);
});

app.get("/users", (req, res) => {
  return res.send("Hello World");
});
```

npm run dev

> Configurando SQLite Prisma

npm i prisma -D

npm i @prisma/client

npx prisma init
Ele cria uma pasta prisma + .env + .gitignore

Configuramos o prisma/schema.prisma de postgresql para sqlite

```tsx
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

```

No .env colocamos

```tsx
DATABASE_URL = "file:./dev.db";
```

No schema.prisma

```prisma
model Feedback{ // nome da tabela
  //temos que indicar que ela vai ter
  //id Int @id @default(autoincrement())// id dele @id seria primary key
  id @id @default(uuid()) //uuid unique id
  type String // tipo do feedback

  comment String

  screenshot String? // ? nao e obrigatório

  @@map("feedbacks") // nome da tabela so que modificamos ela para minuscula
}

// isso aqui so nao cria nada nenhuma tabela
// pra criar a tabela vamos no terminal e executamos
npx prisma migrate dev
//damos um nome create feedbacks

//se rodarmos npx prisma studio conseguimos ver as tabelas na web
npx prisma studio
```

> Rota do feedback
> Criando uma rota de criação de um novo feedback

server.ts

```tsx
//falamos pro express que ele vai receber JSON
app.use(express.json()); //verifica se tem alguma requisição em json

//post

app.post("/feedbacks", (req, res) => {
  console.log(req.body);
  return res.send("Hello world");
});
```

Utilizando o insominia para testar as rotas do server

Criando um arquivo chamado prisma.ts

```ts
export const prisma = new PrismaClient({ log: ["query"] }); //passamos uma configuração
```

Voltamos para o server.ts

```tsx
//dentro do app.post
app.post("/feedbacks", (req, res) => {
  prisma.feedback.create({
    data: {
      type: req.body.type,
      comment: req.body.comment,
      screenshot: req.body.screenshot,
    },
  });
  return res.send("Hello world");
});
```

Fazendo a desestruturação

```tsx
const { type, comment, screenshot } = req.body;
prisma.feedback.create({
  data: {
    type,
    comment,
    screenshot,
  },
});
```

Como a chamada e assíncrona utilizamos async await

```tsx
app.post("/feedbacks", async (req, res) => {
  const { type, comment, screenshot } = req.body;
  const feedback = await prisma.feedback.create({
    data: {
      type,
      comment,
      screenshot,
    },
  });
  return res.status(201).json({ data: feedback }); //201 e um status de criação
});
```

Enviando a nova criação do feedback no email

instalamos a biblioteca chamada nodemailer
npm i nodemailer
npm i @types/nodemailer -D

Para conseguir enviar o email usamos um serviço externo
vamos usar o mailtrap

https://mailtrap.io

testing > create > seleciona nodemailer
Copiamos a configuracao

Antes da nossa rota colocamos a configuracao

```tsx
var transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "90115892bea204",
    pass: "66a901aae737c7",
  },
});
```

Depois que criar o feedbacks
Dentro do app.post

```tsx
await transport.sendMail({
  from: "Equipe Feedget <oi@feedget.com>",
  to: "Bruno Hamawaki <zapnovinhas@gmail.com>",
  subject: "Novo Feedback",
  html: [
    `<div style="font-family: sans-serif; font-size:16px; color: #fff;background-color:#222;padding: 15px;display:flex; justify-content:center; align-items:center; flex-direction: column;" >`,
    `<p>Tipo do feedback: ${type}</p>`,
    `<p>Comentário: ${comment}</p>`,
    `</div>`,
  ].join("\n"),
});
```

Fazemos um novo send no insominia

## Princípios do SOLID

SOLID

- Single Responsibility principle
- Open/Closed Principle
- Liskov Substitution principle
- Interface Segregation Principle
- Dependency Inversion Principle

---

1 - Cada classe/funcao tem uma responsabilidade única;
2 - A classes devem serem abertas para extensão mais fechadas para modificação;
3 - No devemos substituir uma classe pai por uma herança dela e tudo continuar funcionando
4 - ...
5 - Dependências da nossa classe

> Desestruturado as rotas

Criamos um arquivo chamado routes.ts
Copiamos o app.post no server.ts
Colamos no routes.ts

```tsx
export const routes = express.Router();

//trocamos o app.  por routes.
//exportamos ela
routes.post("/feedbacks", async (req, res) => {});
```

Deixando o routes.js assim

```tsx
import express from "express";
import { prisma } from "./prisma";

import nodemailer from "nodemailer";

const routes = express.Router();

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "90115892bea204",
    pass: "66a901aae737c7",
  },
});
routes.post("/feedbacks", async (req, res) => {
  const { type, comment, screenshot } = req.body;
  const feedback = await prisma.feedback.create({
    data: {
      type,
      comment,
      screenshot,
    },
  });

  await transport.sendMail({
    from: "Equipe Feedget <oi@feedget.com>",
    to: "Bruno Hamawaki <zapnovinhas@gmail.com>",
    subject: "Novo Feedback",
    html: [
      `<div style="font-family: sans-serif; font-size:16px; color: #fff;background-color:#222;padding: 15px;display:flex; justify-content:center; align-items:center; flex-direction: column;" >`,
      `<p>Tipo do feedback: ${type}</p>`,
      `<p>Comentário: ${comment}</p>`,
      `</div>`,
    ].join("\n"),
  });

  return res.status(201).json({ data: feedback });
});
```

e o arquivo do server.ts assim

```tsx
import express from "express";

const app = express();
app.use(express.json());

const port = 3333;
app.listen(port, () => {
  console.log("Http server running" + port);
});
```

> Aplicando os conceitos SOLID na nossa aplicação

- Dependency Inversion Principle

Criamos uma pasta src/repositories/feedbacks-repository.ts

```tsx
//criamos a interface que determina quais dados iram vir
interface FeedbackCreateData {
  type: string;
  comment: string;
  screenshot?: string;
}

export interface FeedbackRepository {
  create: (data: FeedbackCreateData) => void; // ele recebe os dados da interface criada acima
}
```

Dentro criamos repositories/prisma/prisma-feedbacks-repository.ts

criamos e exportamos uma classe e implementamos o FeedbacksRepository

```tsx
import {
  FeedbackCreateData,
  FeedbacksRepository,
} from "../feedbacks-repository";

export class PrismaFeedbacksRepository implements FeedbacksRepository {
  create(data: FeedbackCreateData) {}
}
//transformamos ela em assíncrona a funcao create e colocamos a criação dos dados aqui
export class PrismaFeedbacksRepository implements FeedbacksRepository {
  async create({ type, comment, screenshot }: FeedbackCreateData) {
    await prisma.feedback.create({
      data: {
        type,
        comment,
        screenshot,
      },
    });
  }
}


No feedbacks-repository.ts
//Como ela agora e assíncrona temos que mudar FeedbacksRepository de apensas void para Promise<void>

export interface FeedbacksRepository {
  create: (data: FeedbackCreateData) => Promise<void>;
}
```

Em src criamos uma pasta de funcionalidades para o projeto, use-cases
src/use-cases/submit-feedback-use-case.ts

```tsx
import { FeedbacksRepository } from "../repositories/feedbacks-repository";

interface SubmitFeedbackUseCaseRequest {
  type: string;
  comment: string;
  screenshot?: string;
}

export class SubmitFeedbackUseCase {
  constructor(private feedbacksRepository: FeedbacksRepository) {}
  async execute(request: SubmitFeedbackUseCaseRequest) {
    //salvar o feedback e enviar o email

    const { type, comment, screenshot } = request;

    this.feedbacksRepository.create({
      type,
      comment,
      screenshot,
    });
  }
}
```

Agora vamos no routes.ts

```tsx
//instanciamos o PrismaFeedbacksRepository
const prismaFeedbacksRepository = new PrismaFeedbacksRepository();
//instanciamos o SubmitFeedbackUseCase e passamos o prismaFeedbacksRepository
const submitFeedbackUseCase = new SubmitFeedbackUseCase(
  prismaFeedbacksRepository
);

await submitFeedbackUseCase.execute({
  type,
  comment,
  screenshot,
});

return res.status(201).send();
```

Criando a parte de emails sem dependências

Criamos uma pasta adapters/mail-adapter.ts

```tsx
export interface sendMailData {
  subject: string;
  body: string;
}

export interface mailAdapters {
  sendMail: (data: sendMailData) => void;
}
```

Criamos uma pasta nodemailer/nodemailer-mail-adapter.ts

```tsx
import { mailAdapters, sendMailData } from "../mail-adapter";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "90115892bea204",
    pass: "66a901aae737c7",
  },
});

export class NodemailerMailAdapter implements mailAdapters {
  async sendMail({ subject, body }: sendMailData) {
    await transport.sendMail({
      from: "Equipe Feedget <oi@feedget.com>",
      to: "Bruno Hamawaki <zapnovinhas@gmail.com>",
      subject: "Novo Feedback",
      html: [
        `<div style="font-family: sans-serif; font-size:16px; color: #fff;background-color:#222;padding: 15px;display:flex; justify-content:center; align-items:center; flex-direction: column;" >`,
        `<p>Tipo do feedback: ${subject}</p>`,
        `<p>Comentário: ${body}</p>`,
        `</div>`,
      ].join("\n"),
    });
  }
}
```

Agora no use-case temos outra dependência

```tsx

  //incluímos mailAdapters
  export class SubmitFeedbackUseCase {
  constructor(
    private feedbacksRepository: FeedbacksRepository,
    private mailAdapters: mailAdapters
  ) {}

  //incluímos
   await this.mailAdapters.sendMail({
      subject: 'Novo feedback',
      body: [
        `<div style="font-family: sans-serif; font-size:16px; color: #fff;background-color:#222;padding: 15px;display:flex; justify-content:center; align-items:center; flex-direction: column;" >`,
        `<p>Tipo do feedback: ${type}</p>`,
        `<p>Comentário: ${comment}</p>`,
        `</div>`,
      ].join("\n")
    })

    //ficando assim

    import { mailAdapters } from "../adapters/mail-adapter";
import { FeedbacksRepository } from "../repositories/feedbacks-repository";

interface SubmitFeedbackUseCaseRequest {
  type: string;
  comment: string;
  screenshot?: string;
}

export class SubmitFeedbackUseCase {
  constructor(
    private feedbacksRepository: FeedbacksRepository,
    private mailAdapters: mailAdapters
  ) {}

  async execute(request: SubmitFeedbackUseCaseRequest) {
    //salvar o feedback e enviar o email

    const { type, comment, screenshot } = request;

    this.feedbacksRepository.create({
      type,
      comment,
      screenshot,
    });


    await this.mailAdapters.sendMail({
      subject: 'Novo feedback',
      body: [
        `<div style="font-family: sans-serif; font-size:16px; color: #fff;background-color:#222;padding: 15px;display:flex; justify-content:center; align-items:center; flex-direction: column;" >`,
        `<p>Tipo do feedback: ${type}</p>`,
        `<p>Comentário: ${comment}</p>`,
        `</div>`,
      ].join("\n")
    })
  }
}

```

Voltamos na routes.ts

```tsx
//instanciamos o NodemailerMailAdapter

const prismaFeedbacksRepository = new PrismaFeedbacksRepository();
const nodemailerMailAdapter = new NodemailerMailAdapter();
const submitFeedbackUseCase = new SubmitFeedbackUseCase(
  prismaFeedbacksRepository,
  //passamo o nodemailerMailAdapter na propriedade
  nodemailerMailAdapter
);
```

## Configurando o Jest e fazer os teste unitarios automáticos

instalando o jest
npm i jest -D
npm i @types/jest
npx jest --init

yes
yes
node
yes
v8
yes

npm i ts-node -D

Jest por padrão somente entendi js e nao entendi ts

temos que permitir que o jest entenda arquivos ts

para isso instalamos o swc.rs

npm i -D jest @swc/jest

vamos no arquivo jest.config.ts

colocamos

```tsx
 transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
```

dentro da pasta use-case/submit-feedback-use-case.spec.ts

```tsx
import { SubmitFeedbackUseCase } from "./submit-feedback-use-case";

describe("Submit feedback", () => {
  it("should be able to submit a feedback", async () => {
    const submitFeedback = new SubmitFeedbackUseCase(
      { create: async () => {} },
      { sendMail: async () => {} }
    );

    await expect(
      submitFeedback.execute({
        type: "BUG",
        comment: "example comment",
        screenshot: "teste.png",
      })
    ).resolves.not.toThrow();
  });
});
```

npm run test

instalando biblioteca cors

npm i cors
npm i @types/cors

no server.ts importamos o cors

```tsx
import cors from "cors";
app.use(cors());
```

cors ele basicamente uma forma de fazer controle no backend , para ele bloqueie acesso do frontend querendo acessar algo no backend

com cors conseguimos falar quais endereço pode consumir
o correto e passar como origin

```tsx
app.use(
  cors({
    origin: "http://localhos:3000",
  })
);
```
