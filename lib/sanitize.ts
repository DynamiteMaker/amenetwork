import { FilterXSS, getDefaultWhiteList, type IWhiteList } from "xss";

// Rich-text HTML authored in the admin editor is stored raw in Supabase, so it
// must be sanitized before it reaches `dangerouslySetInnerHTML`.
// `xss` is used instead of DOMPurify because DOMPurify needs a DOM: on the
// server that means jsdom, which Next externalizes into a hashed
// `.next/node_modules/jsdom-<hash>` alias that is not resolvable inside a
// Vercel serverless function (every blog article returned a 500).
const whiteList: IWhiteList = getDefaultWhiteList();
for (const tag of Object.keys(whiteList)) {
  whiteList[tag] = [...(whiteList[tag] ?? []), "class", "id"];
}
whiteList.a = [...(whiteList.a ?? []), "rel"];
whiteList.img = [...(whiteList.img ?? []), "srcset", "sizes"];

const filter = new FilterXSS({
  whiteList,
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
});

export function sanitizeHtml(html: string | null | undefined): string {
  return html ? filter.process(html) : "";
}
