// 노션 페이지의 블록 구조를 트리로 출력합니다.
// 매핑 규칙(notion.js의 MAP)을 실제 페이지에 맞추기 위한 진단 도구입니다.
//
// 사용법: NOTION_TOKEN=... NOTION_ROOT_PAGE_ID=... npm run inspect

import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const pageId = process.env.NOTION_ROOT_PAGE_ID;

if (!token || !pageId) {
  console.error("NOTION_TOKEN 과 NOTION_ROOT_PAGE_ID 환경변수가 필요합니다.");
  process.exit(1);
}

const notion = new Client({ auth: token });

function textOf(block) {
  const t = block[block.type];
  const rt = t && t.rich_text;
  if (Array.isArray(rt)) return rt.map((x) => x.plain_text).join("");
  return "";
}

async function walk(blockId, depth = 0) {
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const b of res.results) {
      const indent = "  ".repeat(depth);
      const text = textOf(b).slice(0, 60);
      console.log(`${indent}- [${b.type}] ${text}`);
      if (b.has_children) await walk(b.id, depth + 1);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
}

console.log(`\n노션 페이지 구조 (${pageId}):\n`);
walk(pageId)
  .then(() => console.log("\n완료. 위 [type] 들을 notion.js 의 MAP 규칙과 비교하세요.\n"))
  .catch((e) => {
    console.error("조회 실패:", e.message || e);
    process.exit(1);
  });
