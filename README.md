# AI Company

사장님의 오더를 다섯 명의 AI 직원이 논의하고 최종 실행 보고서로 정리하는 Next.js MVP입니다.

## 실행

```bash
npm install
copy .env.example .env.local
npm run dev
```

`.env.local`에 사용할 Provider의 API 키를 입력한 뒤 `http://localhost:3000`에서 확인하세요.
각 AI 직원의 설정에서 OpenAI 또는 Gemini와 모델을 따로 선택할 수 있습니다.

## 환경 변수

```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# API 키 없이 화면 흐름만 확인할 때 사용
# AI_MEETING_MODE=mock
```

선택된 Provider의 키만 필요합니다. 예를 들어 모든 직원을 OpenAI로 설정했다면
`GEMINI_API_KEY`는 생략할 수 있습니다.
