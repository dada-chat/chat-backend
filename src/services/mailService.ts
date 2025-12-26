import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendInviteMail = async (
  to: string,
  inviteData: { name: string; orgName: string; inviteLink: string }
) => {
  await mailTransporter.sendMail({
    from: `"DadaChat" <${process.env.MAIL_USER}>`,
    to,
    subject: `[Dada Chat] ${inviteData.orgName}에 초대되었습니다.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #222222;">초대 메일: ${inviteData.orgName}</h2>
        <p>안녕하세요, <strong>${inviteData.name}</strong>님!</p>
        <p>${inviteData.orgName} 서비스의 CS 매니저로 초대되었습니다.</p>
        <p>아래 버튼을 클릭하여, 회원가입을 완료해 주세요.</p>
        <div style="text-align: center; margin: 40px 0 60px;">
          <a href="${inviteData.inviteLink}" 
             style="display: inline-block; background-color: #222222; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            초대 수락 및 가입하기
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">이 링크는 본인 확인을 위해 생성되었으며, 가입 시 한 번만 사용 가능합니다.</p>
      </div>
    `,
  });
};
