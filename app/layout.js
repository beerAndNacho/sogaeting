import "./globals.css";

export const metadata = {
  title: "첫만남 리허설 | AI 소개팅 예행연습",
  description: "소개팅 전에 AI와 대화를 연습하고 자연스러움, 질문력, 공감, 호감 표현을 점검해보세요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
