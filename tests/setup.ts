import "@testing-library/jest-dom/vitest";

// jsdom implements getBoundingClientRect but not getClientRects, which
// ProseMirror calls on elements and ranges when it scrolls a selection into
// view. Without these the editor throws asynchronously after every insert.
const emptyRect = () =>
  ({
    x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0,
    toJSON: () => ({}),
  }) as DOMRect;

const emptyRectList = () => {
  const list: DOMRect[] = [];
  return Object.assign(list, { item: (i: number) => list[i] ?? null }) as unknown as DOMRectList;
};

for (const proto of [
  typeof Element !== "undefined" ? Element.prototype : null,
  typeof Range !== "undefined" ? Range.prototype : null,
]) {
  if (proto && !proto.getClientRects) proto.getClientRects = emptyRectList;
  if (proto && !proto.getBoundingClientRect) proto.getBoundingClientRect = emptyRect;
}
