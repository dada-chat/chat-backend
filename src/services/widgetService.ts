import { VisitorRepository } from "../repositories/visitorRepository.js";
import { ConversationRepository } from "../repositories/conversationRepository.js";

export class WidgetService {
  private visitorRepository = new VisitorRepository();
  private conversationRepository = new ConversationRepository();

  async initializeChat(
    email: string,
    name: string | undefined,
    domainId: string
  ) {
    // 1. 방문자 식별
    const visitor = await this.visitorRepository.upsertVisitor(email, name);

    // 2. 기존에 열려있는 방이 있는지 확인
    let conversation = await this.conversationRepository.findActiveConversation(
      visitor.id,
      domainId
    );

    // 3. 없다면 새로 생성
    if (!conversation) {
      const newConversation =
        await this.conversationRepository.createConversation(
          visitor.id,
          domainId
        );
      conversation = {
        ...newConversation,
        messages: [],
      };
    }

    return {
      visitor,
      conversation,
    };
  }
}
