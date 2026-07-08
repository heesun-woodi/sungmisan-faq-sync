// 빌드 진입점: 노션(또는 오프라인 샘플) → 모델 → HTML → dist/faq.html
//
// 환경변수:
//   NOTION_TOKEN         노션 Internal Integration 토큰 (secret_... 또는 ntn_...)
//   NOTION_ROOT_PAGE_ID  FAQ 페이지 ID (URL의 32자리 hex)
// 둘 다 없으면 sample/faq.sample.json 으로 빌드하고 경고를 출력합니다(오프라인 미리보기용).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderFaq } from "./render.js";
import { fetchModelFromNotion } from "./notion.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

function countBlocks(model) {
  const c = { banner: 0, category: 0, qa: 0 };
  for (const b of model.blocks || []) if (c[b.type] != null) c[b.type]++;
  return c;
}

async function main() {
  const token = process.env.NOTION_TOKEN;
  const pageId = process.env.NOTION_ROOT_PAGE_ID;

  let model;
  if (token && pageId) {
    console.log("→ 노션에서 FAQ를 가져오는 중...");
    model = await fetchModelFromNotion(token, pageId);
  } else {
    console.warn(
      "⚠ NOTION_TOKEN / NOTION_ROOT_PAGE_ID 가 없어 sample/faq.sample.json 으로 빌드합니다 (오프라인 미리보기).",
    );
    model = JSON.parse(fs.readFileSync(path.join(ROOT, "sample", "faq.sample.json"), "utf8"));
  }

  const counts = countBlocks(model);
  if ((model.blocks || []).length === 0) {
    console.error("✗ 블록이 0개입니다. 노션 페이지가 통합(integration)에 공유됐는지, 매핑 규칙이 맞는지 확인하세요.");
    process.exit(1);
  }

  const html = renderFaq(model);

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, "faq.html"), html, "utf8");
  fs.writeFileSync(path.join(DIST, "faq.json"), JSON.stringify(model, null, 2), "utf8");

  console.log(
    `✓ dist/faq.html 생성 완료 — 배너 ${counts.banner} · 카테고리 ${counts.category} · 질문 ${counts.qa}개 (${html.length.toLocaleString()} bytes)`,
  );
}

main().catch((err) => {
  console.error("✗ 빌드 실패:", err.message || err);
  process.exit(1);
});
