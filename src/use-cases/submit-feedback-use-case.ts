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
      subject: "Novo feedback",
      body: [
        `<div style="font-family: sans-serif; font-size:16px; color: #fff;background-color:#222;padding: 15px;display:flex; justify-content:center; align-items:center; flex-direction: column;" >`,
        `<p>Tipo do feedback: ${type}</p>`,
        `<p>Comentário: ${comment}</p>`,
        screenshot
          ? `<img src="${screenshot}" width="500" height="auto"/>`
          : ``,
        `</div>`,
      ].join("\n"),
    });
  }
}
