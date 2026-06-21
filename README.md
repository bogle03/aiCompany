# AI Company

사장님의 오더를 다섯 명의 AI 직원이 논의하고 최종 실행 보고서로 정리하는 Next.js MVP입니다.

## 실행

```bash
npm install
copy .env.example .env.local
npm run dev
```

`.env.local`의 `OPENAI_API_KEY`에 실제 API 키를 입력한 뒤 `http://localhost:3000`에서 확인하세요.

## 환경 변수

```env
OPENAI_API_KEY=sk-...
# 선택 사항 (기본값: gpt-4.1-mini)
OPENAI_MODEL=gpt-4.1-mini
```
