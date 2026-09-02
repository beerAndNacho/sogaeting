import "./globals.css";
import "./upgrade.css";

export const metadata = {
  title: "첫만남 리허설 | AI 소개팅 예행연습",
  description: "소개팅 전에 AI와 대화를 연습하고, 호감도 변화·돌발상황·소개팅 후 카톡까지 실전처럼 연습해보세요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
