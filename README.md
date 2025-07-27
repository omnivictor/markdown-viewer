# 🚀 Markdown Viewer

실시간 마크다운 편집기 및 뷰어입니다.

## ✨ 주요 기능

- **실시간 미리보기**: 마크다운을 입력하면 즉시 렌더링
- **다크/라이트 모드**: 테마 전환 지원
- **파일 관리**: 마크다운 파일 업로드/다운로드
- **GitHub Flavored Markdown**: 체크박스, 테이블, 이모지 지원
- **코드 하이라이팅**: 다양한 프로그래밍 언어 지원
- **내보내기**: HTML 형식으로 저장 가능
- **한글 지원**: 완벽한 한글 폰트 렌더링

## 🛠️ 기술 스택

- **Next.js 15**: React 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **Zustand**: 상태 관리
- **react-markdown**: 마크다운 렌더링
- **remark/rehype**: 마크다운 플러그인

## 🚀 시작하기

### 개발 환경 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어보세요.

### 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/           # Next.js App Router
├── components/    # React 컴포넌트
├── store/         # Zustand 상태 관리
├── types/         # TypeScript 타입 정의
└── lib/           # 유틸리티 함수
```

## 🎯 사용법

1. **파일 업로드**: 상단의 "Upload" 버튼으로 .md 파일 업로드
2. **실시간 편집**: 왼쪽 에디터에서 마크다운 작성
3. **미리보기**: 오른쪽에서 실시간 렌더링 확인
4. **저장**: "Save" 버튼으로 .md 또는 .html 형식으로 저장
5. **테마 변경**: 다크/라이트 모드 토글

## 📝 지원하는 마크다운 문법

- 제목 (H1-H6)
- 강조 (볼드, 이탤릭)
- 리스트 (순서, 무순서)
- 체크박스
- 코드 블록
- 테이블
- 인용구
- 링크 및 이미지
- 이모지
- 수평선

## 🔧 환경 변수

이 프로젝트는 추가 환경 변수가 필요하지 않습니다.

## 📄 라이센스

MIT License
